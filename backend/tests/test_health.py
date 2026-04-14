"""Tests for the health check endpoint."""

import pytest

from tests.conftest import client  # noqa: F401


@pytest.mark.anyio
async def test_health_returns_ok(client):  # noqa: F811
    """GET /api/health returns 200 with status and timestamp."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "timestamp" in data
