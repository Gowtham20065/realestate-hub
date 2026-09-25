import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

from schemas import (
    PropertySummary,
    RecommendedProperty,
    RecommendationResponse,
)

logger = logging.getLogger("recommender.engine")

ACTION_WEIGHTS: Dict[str, float] = {
    "VIEW": 1.0,
    "SAVE": 3.0,
    "INQUIRY": 5.0,
}

class HybridRecommender:
    def __init__(self):
        self.properties_df: pd.DataFrame = pd.DataFrame()
        self.interactions_df: pd.DataFrame = pd.DataFrame()
        self.feature_matrix: np.ndarray = np.array([])
        self.property_id_to_idx: Dict[str, int] = {}
        self.idx_to_property_id: Dict[int, str] = {}
        self.property_map: Dict[str, Dict[str, Any]] = {}
        self.feature_columns: List[str] = []
        self.is_fitted: bool = False

    def fit(self, properties: List[Dict[str, Any]], interactions: List[Dict[str, Any]]) -> None:
        """
        Builds the property catalog mappings, normalizes features,
        and constructs the vector space for cosine similarity.
        """
        if not properties:
            logger.warning("No properties provided to fit.")
            self.is_fitted = False
            return

        self.property_map = {p["id"]: p for p in properties}
        
        # Build clean properties DataFrame
        raw_rows = []
        for p in properties:
            raw_rows.append({
                "id": p["id"],
                "price": float(p.get("price", 0)),
                "bedrooms": int(p.get("bedrooms", 1)),
                "bathrooms": float(p.get("bathrooms", 1)),
                "sqft": int(p.get("sqft", 1000)),
                "city": str(p.get("city", "Unknown")).strip().title(),
                "propertyType": str(p.get("propertyType", "HOUSE")).strip().upper(),
                "listingType": str(p.get("listingType", "SALE")).strip().upper(),
                "status": str(p.get("status", "AVAILABLE")).strip().upper(),
            })

        self.properties_df = pd.DataFrame(raw_rows)
        self.property_id_to_idx = {pid: idx for idx, pid in enumerate(self.properties_df["id"])}
        self.idx_to_property_id = {idx: pid for idx, pid in enumerate(self.properties_df["id"])}

        # Load interactions
        interaction_rows = []
        for i in interactions:
            action = str(i.get("actionType", "VIEW")).upper()
            weight = ACTION_WEIGHTS.get(action, 1.0)
            interaction_rows.append({
                "userId": i.get("userId"),
                "propertyId": i.get("propertyId"),
                "actionType": action,
                "weight": weight,
            })
        self.interactions_df = pd.DataFrame(interaction_rows)

        # Feature Engineering:
        # 1. Log-transform price to prevent million-dollar outliers from dominating
        log_price = np.log1p(self.properties_df["price"].values).reshape(-1, 1)
        bedrooms = self.properties_df[["bedrooms"]].values
        bathrooms = self.properties_df[["bathrooms"]].values
        sqft = np.log1p(self.properties_df["sqft"].values).reshape(-1, 1)

        num_features = np.hstack([log_price, bedrooms, bathrooms, sqft])
        scaler = MinMaxScaler()
        scaled_num = scaler.fit_transform(num_features)

        # 2. One-hot encode categorical features (city, propertyType, listingType)
        cat_df = pd.get_dummies(self.properties_df[["city", "propertyType", "listingType"]], dtype=float)
        cat_matrix = cat_df.values

        # 3. Combine into final feature matrix (shape: [num_properties, num_features])
        self.feature_matrix = np.hstack([scaled_num, cat_matrix]).astype(np.float32)
        self.feature_columns = ["log_price", "bedrooms", "bathrooms", "log_sqft"] + list(cat_df.columns)
        self.is_fitted = True

        logger.info(
            f"Fitted recommender: {len(self.properties_df)} properties, "
            f"{len(self.interactions_df)} interactions, "
            f"feature dimension: {self.feature_matrix.shape[1]}"
        )

    def _to_property_summary(self, property_id: str) -> Optional[PropertySummary]:
        raw = self.property_map.get(property_id)
        if not raw:
            return None
        return PropertySummary(
            id=raw["id"],
            title=raw.get("title", ""),
            price=float(raw.get("price", 0)),
            city=raw.get("city", ""),
            state=raw.get("state", ""),
            propertyType=raw.get("propertyType", ""),
            listingType=raw.get("listingType", ""),
            bedrooms=int(raw.get("bedrooms", 1)),
            bathrooms=float(raw.get("bathrooms", 1)),
            sqft=int(raw.get("sqft", 0)),
            images=raw.get("images", []),
            status=raw.get("status", "AVAILABLE"),
        )

    def get_trending_recommendations(self, limit: int = 6, exclude_ids: Optional[set] = None) -> List[RecommendedProperty]:
        """
        Calculates cold-start recommendations by aggregating community engagement scores.
        """
        if exclude_ids is None:
            exclude_ids = set()

        # If we have interactions, calculate weighted sum per property
        if not self.interactions_df.empty:
            valid_interactions = self.interactions_df[self.interactions_df["propertyId"].isin(self.property_map.keys())]
            trending_scores = valid_interactions.groupby("propertyId")["weight"].sum().to_dict()
        else:
            trending_scores = {}

        # Rank all properties
        ranked: List[Tuple[str, float]] = []
        for pid in self.properties_df["id"]:
            if pid in exclude_ids:
                continue
            score = trending_scores.get(pid, 0.0)
            ranked.append((pid, score))

        ranked.sort(key=lambda x: x[1], reverse=True)
        max_score = ranked[0][1] if ranked and ranked[0][1] > 0 else 1.0

        results: List[RecommendedProperty] = []
        for pid, raw_score in ranked[:limit]:
            prop_summary = self._to_property_summary(pid)
            if not prop_summary:
                continue
            normalized_score = round(min(1.0, 0.65 + (raw_score / max_score) * 0.35) if max_score > 0 else 0.80, 2)
            match_pct = int(normalized_score * 100)
            
            results.append(
                RecommendedProperty(
                    property_id=pid,
                    score=normalized_score,
                    match_percentage=match_pct,
                    reason=f"Popular listing with high community interest in {prop_summary.city}",
                    property=prop_summary,
                )
            )

        return results

    def get_similar_properties(self, property_id: str, limit: int = 4) -> List[RecommendedProperty]:
        """
        Content-Based Filtering: Computes cosine similarity between target property vector
        and all other properties in catalog.
        """
        if not self.is_fitted or property_id not in self.property_id_to_idx:
            return []

        target_idx = self.property_id_to_idx[property_id]
        target_vector = self.feature_matrix[target_idx : target_idx + 1]
        target_prop = self.property_map[property_id]

        similarities = cosine_similarity(target_vector, self.feature_matrix)[0]

        # Sort descending
        ranked_indices = np.argsort(similarities)[::-1]

        results: List[RecommendedProperty] = []
        for idx in ranked_indices:
            if idx == target_idx:
                continue  # skip the query property itself
            
            pid = self.idx_to_property_id[idx]
            sim_score = float(similarities[idx])
            if sim_score < 0.0:
                continue

            prop_summary = self._to_property_summary(pid)
            if not prop_summary:
                continue

            match_pct = int(round(sim_score * 100))
            
            # Formulate dynamic rationale
            reason_parts = []
            if prop_summary.city.lower() == target_prop.get("city", "").lower():
                reason_parts.append(f"Located in {prop_summary.city}")
            if prop_summary.propertyType.upper() == target_prop.get("propertyType", "").upper():
                reason_parts.append(f"Same {prop_summary.propertyType.capitalize()} layout")
            if abs(prop_summary.bedrooms - int(target_prop.get("bedrooms", 1))) <= 1:
                reason_parts.append(f"{prop_summary.bedrooms}-bed match")

            reason = " & ".join(reason_parts) if reason_parts else "Similar pricing and property attributes"

            results.append(
                RecommendedProperty(
                    property_id=pid,
                    score=round(sim_score, 3),
                    match_percentage=match_pct,
                    reason=reason,
                    property=prop_summary,
                )
            )

            if len(results) >= limit:
                break

        return results

    def get_user_recommendations(self, user_id: Optional[str], limit: int = 6) -> RecommendationResponse:
        """
        Hybrid Filtering:
        - If user has no interactions -> Cold-Start Trending
        - If user has interactions -> Builds weighted preference vector and computes cosine similarity
        """
        if not self.is_fitted or not user_id or self.interactions_df.empty:
            trending = self.get_trending_recommendations(limit=limit)
            return RecommendationResponse(
                user_id=user_id,
                strategy="cold_start_trending",
                total=len(trending),
                recommendations=trending,
            )

        # Filter interactions for this user
        user_actions = self.interactions_df[self.interactions_df["userId"] == user_id]

        if user_actions.empty:
            trending = self.get_trending_recommendations(limit=limit)
            return RecommendationResponse(
                user_id=user_id,
                strategy="cold_start_trending",
                total=len(trending),
                recommendations=trending,
            )

        # Aggregate weights per property for this user
        weights_by_prop = user_actions.groupby("propertyId")["weight"].sum().to_dict()
        interacted_pids = set(weights_by_prop.keys())

        # Build user vector as weighted sum of interacted property feature vectors
        user_vector = np.zeros((1, self.feature_matrix.shape[1]), dtype=np.float32)
        total_weight = 0.0

        for pid, w in weights_by_prop.items():
            if pid in self.property_id_to_idx:
                p_idx = self.property_id_to_idx[pid]
                user_vector += w * self.feature_matrix[p_idx : p_idx + 1]
                total_weight += w

        if total_weight == 0.0:
            trending = self.get_trending_recommendations(limit=limit)
            return RecommendationResponse(
                user_id=user_id,
                strategy="cold_start_trending",
                total=len(trending),
                recommendations=trending,
            )

        user_vector /= total_weight

        # Compute cosine similarity between user preference vector and all properties
        similarities = cosine_similarity(user_vector, self.feature_matrix)[0]

        # Rank properties
        ranked_indices = np.argsort(similarities)[::-1]

        results: List[RecommendedProperty] = []
        
        # 1. First prioritize properties the user has NOT interacted with
        for idx in ranked_indices:
            pid = self.idx_to_property_id[idx]
            if pid in interacted_pids:
                continue

            sim_score = float(similarities[idx])
            prop_summary = self._to_property_summary(pid)
            if not prop_summary:
                continue

            match_pct = int(round(sim_score * 100))
            reason = f"Personalized match based on your recent activity in {prop_summary.city}"

            results.append(
                RecommendedProperty(
                    property_id=pid,
                    score=round(sim_score, 3),
                    match_percentage=match_pct,
                    reason=reason,
                    property=prop_summary,
                )
            )

            if len(results) >= limit:
                break

        # 2. If catalog has fewer un-interacted properties than limit, backfill
        if len(results) < limit:
            for idx in ranked_indices:
                pid = self.idx_to_property_id[idx]
                if any(r.property_id == pid for r in results):
                    continue

                sim_score = float(similarities[idx])
                prop_summary = self._to_property_summary(pid)
                if not prop_summary:
                    continue

                results.append(
                    RecommendedProperty(
                        property_id=pid,
                        score=round(sim_score, 3),
                        match_percentage=int(round(sim_score * 100)),
                        reason="Matches your general search preferences",
                        property=prop_summary,
                    )
                )
                if len(results) >= limit:
                    break

        return RecommendationResponse(
            user_id=user_id,
            strategy="personalized_hybrid",
            total=len(results),
            recommendations=results,
        )
