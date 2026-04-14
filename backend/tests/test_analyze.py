"""Integration tests for the /api/analyze endpoint."""

from unittest.mock import AsyncMock, patch

import pytest

from app.models import AnalysisResult
from tests.conftest import MOCK_ANALYSIS_RESULT, VALID_IMAGE_B64, client  # noqa: F401


@pytest.mark.anyio
async def test_analyze_success(client):  # noqa: F811
    """Valid request returns 200 with AnalyzeResponse."""
    mock_result = AnalysisResult(**MOCK_ANALYSIS_RESULT)
    with patch("app.main.analyze_food", new_callable=AsyncMock) as mock_af:
        mock_af.return_value = (mock_result, "gemini")
        response = await client.post(
            "/api/analyze",
            json={
                "image": VALID_IMAGE_B64,
                "mime_type": "image/jpeg",
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["provider"] == "gemini"
    assert data["data"]["food_name"] == "Masala Dosa"
    assert data["data"]["general_health_score"] == 65
    assert data["data"]["personal_health_score"] == 40
    assert len(data["data"]["meal_items"]) == 2


@pytest.mark.anyio
async def test_analyze_invalid_mime(client):  # noqa: F811
    """Invalid MIME type returns 422 validation error."""
    response = await client.post(
        "/api/analyze",
        json={
            "image": VALID_IMAGE_B64,
            "mime_type": "text/html",
        },
    )
    assert response.status_code == 422


@pytest.mark.anyio
async def test_analyze_missing_image(client):  # noqa: F811
    """Missing image field returns 422."""
    response = await client.post(
        "/api/analyze",
        json={"mime_type": "image/jpeg"},
    )
    assert response.status_code == 422


@pytest.mark.anyio
async def test_analyze_with_profile(client):  # noqa: F811
    """Request with profile passes it through to vision."""
    mock_result = AnalysisResult(**MOCK_ANALYSIS_RESULT)
    with patch("app.main.analyze_food", new_callable=AsyncMock) as mock_af:
        mock_af.return_value = (mock_result, "groq")
        response = await client.post(
            "/api/analyze",
            json={
                "image": VALID_IMAGE_B64,
                "mime_type": "image/jpeg",
                "profile": {
                    "conditions": ["diabetic"],
                    "goals": ["reduce_sugar"],
                    "allergies": [],
                },
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Verify profile was passed to analyze_food
    call_args = mock_af.call_args
    assert call_args.kwargs["profile"].conditions == ["diabetic"]


@pytest.mark.anyio
async def test_analyze_vision_failure(client):  # noqa: F811
    """When vision fails, response has success=false with error message."""
    with patch("app.main.analyze_food", new_callable=AsyncMock) as mock_af:
        mock_af.side_effect = RuntimeError("Both providers failed")
        response = await client.post(
            "/api/analyze",
            json={
                "image": VALID_IMAGE_B64,
                "mime_type": "image/jpeg",
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "failed" in data["error"].lower()


@pytest.mark.anyio
async def test_rate_limiting(client):  # noqa: F811
    """Rapid requests eventually trigger 429 rate limit."""
    mock_result = AnalysisResult(**MOCK_ANALYSIS_RESULT)
    hit_429 = False
    with patch("app.main.analyze_food", new_callable=AsyncMock) as mock_af:
        mock_af.return_value = (mock_result, "gemini")
        for _ in range(20):
            response = await client.post(
                "/api/analyze",
                json={
                    "image": VALID_IMAGE_B64,
                    "mime_type": "image/jpeg",
                },
            )
            if response.status_code == 429:
                hit_429 = True
                break

    assert hit_429, "Rate limiter should return 429 after exceeding limit"
