"""Tests for the prompt builder."""

from app.models import DailyIntake, UserProfile
from app.prompt import build_prompt


def test_prompt_without_profile():
    """Default prompt includes general analysis instruction."""
    prompt = build_prompt(None)
    assert "No specific health profile" in prompt
    assert "FoodLens" in prompt
    assert "general_health_score" in prompt
    assert "personal_health_score" in prompt


def test_prompt_with_profile():
    """Profile conditions, goals, and allergies appear in prompt."""
    profile = UserProfile(
        conditions=["diabetic", "hypertension"],
        goals=["reduce_sugar"],
        allergies=["peanuts"],
    )
    prompt = build_prompt(profile)
    assert "diabetic" in prompt
    assert "hypertension" in prompt
    assert "reduce_sugar" in prompt
    assert "peanuts" in prompt
    assert "personal_health_score MUST differ" in prompt
    assert "allergen_alert" in prompt


def test_prompt_with_empty_profile():
    """Empty profile lists show 'none' fallbacks."""
    profile = UserProfile(conditions=[], goals=[], allergies=[])
    prompt = build_prompt(profile)
    assert "none" in prompt
    assert "general wellness" in prompt


def test_prompt_contains_json_schema():
    """Prompt includes the expected JSON output structure."""
    prompt = build_prompt(None)
    assert '"food_name"' in prompt
    assert '"general_health_score"' in prompt
    assert '"personal_health_score"' in prompt
    assert '"allergen_alerts"' in prompt
    assert '"meal_items"' in prompt
    assert '"daily_impact"' in prompt
    assert '"swaps"' in prompt


def test_prompt_with_daily_intake():
    """Daily intake context appears in prompt."""
    profile = UserProfile(conditions=["diabetic"], goals=[], allergies=[])
    intake = DailyIntake(
        total_calories=1200,
        total_sugar_g=45,
        total_sodium_mg=1500,
        total_protein_g=30,
        meals_logged=2,
        items=["poha", "chai"],
    )
    prompt = build_prompt(profile, intake)
    assert "1200" in prompt
    assert "45" in prompt
    assert "poha" in prompt
    assert "chai" in prompt
    assert "daily_impact" in prompt


def test_prompt_without_daily_intake():
    """No daily intake section when not provided."""
    prompt = build_prompt(None, None)
    assert "TODAY'S INTAKE" not in prompt


def test_prompt_indian_food_awareness():
    """Prompt includes Indian food references."""
    prompt = build_prompt(None)
    assert "Indian" in prompt
    assert "thali" in prompt.lower() or "Thali" in prompt
    assert "Yoga Bar" in prompt or "Raw Pressery" in prompt
