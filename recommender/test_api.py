import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app, recommender
from test_recommender import SAMPLE_PROPERTIES, SAMPLE_INTERACTIONS

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_recommender_data():
    recommender.fit(SAMPLE_PROPERTIES, SAMPLE_INTERACTIONS)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "realestate-recommender"
    assert data["properties_count"] == 4
    assert data["interactions_count"] == 3

def test_trending_endpoint():
    response = client.get("/recommendations/trending?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert data["strategy"] == "cold_start_trending"
    assert len(data["recommendations"]) <= 3
    assert data["recommendations"][0]["property_id"] == "prop-1"

def test_personalized_user_endpoint():
    response = client.get("/recommendations/user/user-austin-lover?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["strategy"] == "personalized_hybrid"
    assert len(data["recommendations"]) > 0
    assert data["recommendations"][0]["property_id"] == "prop-2"

def test_cold_start_user_endpoint():
    response = client.get("/recommendations/user/unknown-user-999?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert data["strategy"] == "cold_start_trending"
    assert len(data["recommendations"]) == 2

def test_similar_properties_endpoint():
    response = client.get("/recommendations/property/prop-1?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["property_id"] == "prop-2"

@patch("main.fetch_all_properties", new_callable=AsyncMock)
@patch("main.fetch_all_interactions", new_callable=AsyncMock)
def test_recalculate_endpoint(mock_interactions, mock_properties):
    mock_properties.return_value = SAMPLE_PROPERTIES
    mock_interactions.return_value = SAMPLE_INTERACTIONS
    
    response = client.post("/recalculate")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["properties_count"] == 4
    assert data["interactions_count"] == 3
