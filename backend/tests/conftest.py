"""Shared test fixtures."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    """Async test client for FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# A minimal valid 1x1 white JPEG as base64
VALID_IMAGE_B64 = (
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkS"
    "Ew8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJ"
    "CQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy"
    "MjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEA"
    "AAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIh"
    "MUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6"
    "Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZ"
    "mqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx"
    "8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREA"
    "AgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAV"
    "YnLRChYkNOEl8RcYI4Q/RFhHRUYnJCk6LzNEVTpHSktMTU5PRldYWVpbXF1eX2Jj"
    "ZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3"
    "uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIR"
    "AxEAPwD3+gD/2Q=="
)

MOCK_ANALYSIS_RESULT = {
    "food_name": "Masala Dosa",
    "category": "Home Cooked",
    "general_health_score": 65,
    "personal_health_score": 40,
    "verdict": "A balanced South Indian crepe with potato filling.",
    "personal_verdict": "The potato filling has high glycemic index — risky for your pre-diabetes. Pair with sambar for protein.",
    "ingredients": ["rice batter", "urad dal", "potato", "onion", "mustard seeds", "ghee"],
    "harmful_additives": [],
    "positives": ["Good source of carbohydrates", "Fermented batter aids digestion"],
    "concerns": ["High glycemic index from potato", "Excess ghee adds saturated fat"],
    "swaps": [
        {
            "original": "Potato filling",
            "suggestion": "Paneer or mixed vegetable filling",
            "benefit": "Lower glycemic index, more protein",
        }
    ],
    "allergen_alerts": [],
    "meal_items": [
        {
            "name": "Dosa crepe",
            "health_score": 70,
            "calories_estimate": 120,
            "brief": "Fermented rice-lentil batter, good for gut health",
        },
        {
            "name": "Potato masala",
            "health_score": 50,
            "calories_estimate": 150,
            "brief": "High GI, moderate calories",
        },
    ],
    "daily_impact": "",
}
