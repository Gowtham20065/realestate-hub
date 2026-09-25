import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, List
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import (
    HealthResponse,
    RecommendationResponse,
    RecommendedProperty,
    RecalculateResponse,
)
from services.data_fetcher import fetch_all_properties, fetch_all_interactions
from services.recommender import HybridRecommender

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("recommender.main")

NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:5000/api")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

recommender = HybridRecommender()

async def reload_recommender():
    logger.info(f"Connecting to Node backend at {NODE_API_URL} to refresh catalog & interactions...")
    properties = await fetch_all_properties(NODE_API_URL)
    interactions = await fetch_all_interactions(NODE_API_URL)
    recommender.fit(properties, interactions)
    logger.info("Recommender training matrix successfully updated.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Attempt to load initial properties & interactions
    logger.info("Starting RealEstateHub Recommendation Service...")
    try:
        await reload_recommender()
    except Exception as exc:
        logger.warning(f"Initial model fit deferred (Node API may be starting up): {exc}")
    yield
    logger.info("Shutting down Recommendation Service...")

app = FastAPI(
    title="RealEstateHub Recommendation Microservice",
    description="Python + FastAPI + scikit-learn hybrid real estate recommendation engine",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    return HealthResponse(
        status="healthy",
        service="realestate-recommender",
        properties_count=len(recommender.properties_df),
        interactions_count=len(recommender.interactions_df),
    )

@app.post("/recalculate", response_model=RecalculateResponse, tags=["Training"])
async def recalculate():
    """
    Manually triggers a fresh fetch of properties & interactions from PostgreSQL
    and re-trains the in-memory feature vectors and similarity matrix.
    """
    await reload_recommender()
    return RecalculateResponse(
        success=True,
        message="Recommender model refitted successfully with latest backend data.",
        properties_count=len(recommender.properties_df),
        interactions_count=len(recommender.interactions_df),
    )

@app.get("/recommendations/user/{user_id}", response_model=RecommendationResponse, tags=["Recommendations"])
async def get_user_recommendations(
    user_id: str,
    limit: int = Query(default=6, ge=1, le=20, description="Number of recommendations to return")
):
    """
    Returns personalized hybrid recommendations for a user.
    Falls back gracefully to trending properties if user has 0 interactions.
    """
    return recommender.get_user_recommendations(user_id=user_id, limit=limit)

@app.get("/recommendations/trending", response_model=RecommendationResponse, tags=["Recommendations"])
async def get_trending_recommendations(
    limit: int = Query(default=6, ge=1, le=20, description="Number of recommendations to return")
):
    """
    Returns top trending properties across the entire platform based on aggregate
    interaction weights (VIEW: 1x, SAVE: 3x, INQUIRY: 5x).
    """
    trending = recommender.get_trending_recommendations(limit=limit)
    return RecommendationResponse(
        user_id=None,
        strategy="cold_start_trending",
        total=len(trending),
        recommendations=trending,
    )

@app.get("/recommendations/property/{property_id}", response_model=List[RecommendedProperty], tags=["Recommendations"])
async def get_similar_properties(
    property_id: str,
    limit: int = Query(default=4, ge=1, le=12, description="Number of similar properties to return")
):
    """
    Content-Based Filtering: Returns properties most similar to the target property
    using cosine similarity over price, bedrooms, bathrooms, and location vectors.
    """
    similar = recommender.get_similar_properties(property_id=property_id, limit=limit)
    return similar

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
