from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PropertySummary(BaseModel):
    id: str
    title: str
    price: float
    city: str
    state: str
    propertyType: str
    listingType: str
    bedrooms: int
    bathrooms: float
    sqft: int
    images: List[str] = Field(default_factory=list)
    status: str = "AVAILABLE"

class RecommendedProperty(BaseModel):
    property_id: str
    score: float
    match_percentage: int
    reason: str
    property: Optional[PropertySummary] = None

class RecommendationResponse(BaseModel):
    user_id: Optional[str] = None
    strategy: str
    total: int
    recommendations: List[RecommendedProperty]

class HealthResponse(BaseModel):
    status: str
    service: str
    properties_count: int
    interactions_count: int

class RecalculateResponse(BaseModel):
    success: bool
    message: str
    properties_count: int
    interactions_count: int
