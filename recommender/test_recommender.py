import pytest
from services.recommender import HybridRecommender

SAMPLE_PROPERTIES = [
    {
        "id": "prop-1",
        "title": "Modern Downtown Condo",
        "price": 450000,
        "bedrooms": 2,
        "bathrooms": 2.0,
        "sqft": 1100,
        "city": "Austin",
        "propertyType": "CONDO",
        "listingType": "SALE",
        "status": "AVAILABLE",
    },
    {
        "id": "prop-2",
        "title": "Luxury High-Rise Condo",
        "price": 490000,
        "bedrooms": 2,
        "bathrooms": 2.0,
        "sqft": 1200,
        "city": "Austin",
        "propertyType": "CONDO",
        "listingType": "SALE",
        "status": "AVAILABLE",
    },
    {
        "id": "prop-3",
        "title": "Suburban Family Home",
        "price": 850000,
        "bedrooms": 4,
        "bathrooms": 3.5,
        "sqft": 3200,
        "city": "Seattle",
        "propertyType": "HOUSE",
        "listingType": "SALE",
        "status": "AVAILABLE",
    },
    {
        "id": "prop-4",
        "title": "Cozy Miami Studio",
        "price": 2200,
        "bedrooms": 1,
        "bathrooms": 1.0,
        "sqft": 600,
        "city": "Miami",
        "propertyType": "APARTMENT",
        "listingType": "RENT",
        "status": "AVAILABLE",
    },
]

SAMPLE_INTERACTIONS = [
    {"userId": "user-austin-lover", "propertyId": "prop-1", "actionType": "VIEW"},
    {"userId": "user-austin-lover", "propertyId": "prop-1", "actionType": "SAVE"},
    {"userId": "user-austin-lover", "propertyId": "prop-1", "actionType": "INQUIRY"},
]

def test_fit_and_matrix_shape():
    engine = HybridRecommender()
    engine.fit(SAMPLE_PROPERTIES, SAMPLE_INTERACTIONS)
    assert engine.is_fitted is True
    assert engine.feature_matrix.shape[0] == 4
    assert len(engine.property_id_to_idx) == 4

def test_content_based_similarity():
    engine = HybridRecommender()
    engine.fit(SAMPLE_PROPERTIES, SAMPLE_INTERACTIONS)
    
    # prop-1 and prop-2 are both 2-bed condos in Austin around 450k-490k
    # prop-1 should be most similar to prop-2, and much less similar to prop-4 (Miami studio)
    similars = engine.get_similar_properties(property_id="prop-1", limit=3)
    assert len(similars) > 0
    top_similar = similars[0]
    assert top_similar.property_id == "prop-2"
    assert top_similar.score > 0.85
    assert "Austin" in top_similar.reason

def test_user_personalized_recommendation():
    engine = HybridRecommender()
    engine.fit(SAMPLE_PROPERTIES, SAMPLE_INTERACTIONS)
    
    # user-austin-lover heavily interacted with prop-1 (Austin condo)
    # The personalized hybrid recommender should recommend prop-2 first
    resp = engine.get_user_recommendations(user_id="user-austin-lover", limit=2)
    assert resp.strategy == "personalized_hybrid"
    assert len(resp.recommendations) > 0
    # Top recommended property should be prop-2
    assert resp.recommendations[0].property_id == "prop-2"

def test_cold_start_fallback():
    engine = HybridRecommender()
    engine.fit(SAMPLE_PROPERTIES, SAMPLE_INTERACTIONS)
    
    # New user with 0 interactions should receive cold-start trending recommendations
    resp = engine.get_user_recommendations(user_id="brand-new-user-123", limit=2)
    assert resp.strategy == "cold_start_trending"
    assert len(resp.recommendations) == 2
    # prop-1 has the highest community interaction weight (1 + 3 + 5 = 9), so it should rank first in trending
    assert resp.recommendations[0].property_id == "prop-1"
