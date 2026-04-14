"""Pydantic data contracts for all API request/response types."""

import base64
import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_PROFILE_ITEMS = 10
MAX_ITEM_LENGTH = 50


def _strip_html(value: str) -> str:
    """Remove HTML tags from a string."""
    return re.sub(r"<[^>]+>", "", value)


class UserProfile(BaseModel):
    """User health profile for personalized analysis."""

    conditions: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)

    @field_validator("conditions", "goals", "allergies", mode="before")
    @classmethod
    def validate_string_list(cls, v: list[str]) -> list[str]:
        if len(v) > MAX_PROFILE_ITEMS:
            raise ValueError(f"Maximum {MAX_PROFILE_ITEMS} items allowed")
        cleaned = []
        for item in v:
            item = _strip_html(str(item).strip())
            if len(item) > MAX_ITEM_LENGTH:
                raise ValueError(
                    f"Each item must be {MAX_ITEM_LENGTH} characters or less"
                )
            if item:
                cleaned.append(item)
        return cleaned


class DailyIntake(BaseModel):
    """What the user has already eaten today — for cumulative analysis."""

    total_calories: int = 0
    total_sugar_g: float = 0
    total_sodium_mg: float = 0
    total_protein_g: float = 0
    meals_logged: int = 0
    items: list[str] = Field(default_factory=list)


class AnalyzeRequest(BaseModel):
    """Request body for food analysis endpoint."""

    image: str = Field(..., description="Base64-encoded image without data: prefix")
    mime_type: str = Field(..., description="Image MIME type")
    profile: UserProfile | None = None
    daily_intake: DailyIntake | None = None

    @field_validator("mime_type")
    @classmethod
    def validate_mime_type(cls, v: str) -> str:
        if v not in ALLOWED_MIME_TYPES:
            raise ValueError(
                f"Unsupported MIME type: {v}. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
            )
        return v

    @field_validator("image")
    @classmethod
    def validate_image(cls, v: str) -> str:
        if not v:
            raise ValueError("Image data is required")
        try:
            decoded = base64.b64decode(v)
        except Exception:
            raise ValueError("Invalid base64 encoding")
        size_mb = len(decoded) / (1024 * 1024)
        if size_mb > 5:
            raise ValueError(f"Image size {size_mb:.1f}MB exceeds 5MB limit")
        return v


class AdditiveWarning(BaseModel):
    """A harmful additive found in the food."""

    name: str
    risk: Literal["low", "medium", "high"]
    description: str


class SwapSuggestion(BaseModel):
    """A healthier alternative suggestion."""

    original: str
    suggestion: str
    benefit: str


class AllergenAlert(BaseModel):
    """Allergen detected that matches user's allergy list."""

    allergen: str
    severity: Literal["warning", "danger"]
    message: str


class MealItem(BaseModel):
    """Individual food item detected in a meal/plate."""

    name: str
    health_score: int = Field(ge=0, le=100)
    calories_estimate: int
    brief: str


class AnalysisResult(BaseModel):
    """Structured food analysis from the vision AI."""

    food_name: str
    category: str
    general_health_score: int = Field(ge=-1, le=100)
    personal_health_score: int = Field(ge=-1, le=100)
    verdict: str
    personal_verdict: str
    ingredients: list[str]
    harmful_additives: list[AdditiveWarning]
    positives: list[str]
    concerns: list[str]
    swaps: list[SwapSuggestion]
    allergen_alerts: list[AllergenAlert] = Field(default_factory=list)
    meal_items: list[MealItem] = Field(default_factory=list)
    daily_impact: str = ""


class AnalyzeResponse(BaseModel):
    """API response wrapper for food analysis."""

    success: bool
    data: AnalysisResult | None = None
    provider: str | None = None
    error: str | None = None
