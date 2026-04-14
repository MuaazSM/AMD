"""Tests for Pydantic model validation."""

import pytest
from pydantic import ValidationError

from app.models import AnalyzeRequest, UserProfile


class TestUserProfile:
    def test_valid_profile(self):
        profile = UserProfile(
            conditions=["diabetic"],
            goals=["reduce_sugar"],
            allergies=["peanuts"],
        )
        assert profile.conditions == ["diabetic"]

    def test_empty_profile(self):
        profile = UserProfile()
        assert profile.conditions == []
        assert profile.goals == []
        assert profile.allergies == []

    def test_too_many_items_rejected(self):
        with pytest.raises(ValidationError, match="Maximum 10 items"):
            UserProfile(conditions=["item"] * 11)

    def test_long_item_rejected(self):
        with pytest.raises(ValidationError, match="50 characters"):
            UserProfile(conditions=["a" * 51])

    def test_html_stripped(self):
        profile = UserProfile(conditions=["<script>alert('xss')</script>diabetic"])
        assert profile.conditions == ["alert('xss')diabetic"]


class TestAnalyzeRequest:
    def test_invalid_mime_type_rejected(self):
        with pytest.raises(ValidationError, match="Unsupported MIME type"):
            AnalyzeRequest(image="dGVzdA==", mime_type="text/html")

    def test_valid_mime_types_accepted(self):
        for mime in ["image/jpeg", "image/png", "image/webp"]:
            req = AnalyzeRequest(image="dGVzdA==", mime_type=mime)
            assert req.mime_type == mime

    def test_invalid_base64_rejected(self):
        with pytest.raises(ValidationError, match="Invalid base64"):
            AnalyzeRequest(image="not-valid-base64!!!", mime_type="image/jpeg")

    def test_empty_image_rejected(self):
        with pytest.raises(ValidationError, match="Image data is required"):
            AnalyzeRequest(image="", mime_type="image/jpeg")
