import logging
from typing import List, Dict, Any
import httpx

logger = logging.getLogger("recommender.fetcher")

async def fetch_all_properties(api_base_url: str) -> List[Dict[str, Any]]:
    """
    Fetch all active properties from the Node.js backend.
    Handles pagination automatically up to all available pages.
    """
    properties: List[Dict[str, Any]] = []
    page = 1
    limit = 100

    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            try:
                url = f"{api_base_url.rstrip('/')}/properties"
                params = {"page": page, "limit": limit}
                response = await client.get(url, params=params)
                
                if response.status_code != 200:
                    logger.error(f"Failed to fetch properties: HTTP {response.status_code} - {response.text}")
                    break

                body = response.json()
                page_data = body.get("data", {})
                page_properties = page_data.get("properties", [])
                pagination = page_data.get("pagination", {})
                
                properties.extend(page_properties)

                total_pages = pagination.get("totalPages", 1)
                if page >= total_pages or len(page_properties) == 0:
                    break
                page += 1

            except httpx.RequestError as exc:
                logger.error(f"Network error while connecting to Node API ({url}): {exc}")
                break
            except Exception as exc:
                logger.error(f"Unexpected error fetching properties: {exc}")
                break

    logger.info(f"Fetched {len(properties)} properties from backend.")
    return properties


async def fetch_all_interactions(api_base_url: str) -> List[Dict[str, Any]]:
    """
    Fetch all user interaction records from the Node.js backend export feed.
    """
    interactions: List[Dict[str, Any]] = []

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            url = f"{api_base_url.rstrip('/')}/interactions/export"
            response = await client.get(url)

            if response.status_code != 200:
                logger.error(f"Failed to fetch interactions: HTTP {response.status_code} - {response.text}")
                return []

            body = response.json()
            interactions = body.get("data", {}).get("interactions", [])

        except httpx.RequestError as exc:
            logger.error(f"Network error while connecting to Node API ({url}): {exc}")
            return []
        except Exception as exc:
            logger.error(f"Unexpected error fetching interactions: {exc}")
            return []

    logger.info(f"Fetched {len(interactions)} interaction events from backend.")
    return interactions
