"""Shared prompt builder for food analysis — used by both Gemini and Groq."""

from app.models import DailyIntake, UserProfile


def build_prompt(
    profile: UserProfile | None, daily_intake: DailyIntake | None = None
) -> str:
    """Build the analysis prompt with profile context, daily intake, and Indian food awareness."""

    # --- Profile context ---
    profile_ctx = (
        "No specific health profile provided. "
        "Set personal_health_score equal to general_health_score. "
        "Set personal_verdict to the same as verdict. "
        "Leave allergen_alerts empty."
    )
    if profile:
        conditions = ", ".join(profile.conditions) or "none"
        goals = ", ".join(profile.goals) or "general wellness"
        allergies = ", ".join(profile.allergies) or "none"
        profile_ctx = (
            f"USER HEALTH PROFILE:\n"
            f"- Health conditions: {conditions}\n"
            f"- Dietary goals: {goals}\n"
            f"- Allergies: {allergies}\n\n"
            f"CRITICAL: The personal_health_score MUST differ from general_health_score "
            f"based on the user's conditions. For example, a mango lassi might be "
            f"65/100 generally but 15/100 for a diabetic.\n"
            f"The personal_verdict must explain WHY this food is specifically "
            f"good or bad for THIS user.\n"
            f"If ANY ingredient matches the user's allergies, add an allergen_alert "
            f"with severity 'danger'."
        )

    # --- Daily intake context ---
    daily_ctx = ""
    if daily_intake and daily_intake.meals_logged > 0:
        daily_ctx = (
            f"\nTODAY'S INTAKE SO FAR:\n"
            f"- Meals logged: {daily_intake.meals_logged}\n"
            f"- Total calories: {daily_intake.total_calories}\n"
            f"- Total sugar: {daily_intake.total_sugar_g}g\n"
            f"- Total sodium: {daily_intake.total_sodium_mg}mg\n"
            f"- Total protein: {daily_intake.total_protein_g}g\n"
            f"- Items eaten: {', '.join(daily_intake.items) or 'none'}\n"
            f"Factor this into daily_impact — e.g. 'Adding this pushes your "
            f"daily sugar to 85g, well above the recommended 50g for diabetics.'"
        )

    return (
        f"You are FoodLens, an expert nutritionist AI specializing in Indian "
        f"and global cuisines. Analyze the food in this image.\n\n"
        f"{profile_ctx}\n"
        f"{daily_ctx}\n\n"
        f"IMPORTANT RULES:\n"
        f"1. If you see a PLATE or THALI with multiple items (dal, rice, sabzi, "
        f"roti, chutney, etc.), identify EACH item separately in meal_items. "
        f"The main food_name should be the overall meal (e.g. 'North Indian Thali').\n"
        f"2. general_health_score is for an average healthy adult. "
        f"personal_health_score is tailored to this specific user's profile.\n"
        f"3. For swap suggestions, prefer Indian alternatives when applicable "
        f"(e.g. suggest jaggery instead of refined sugar, ragi roti instead of "
        f"maida naan, Yoga Bar/Raw Pressery/Epigamia as brand alternatives).\n"
        f"4. If the image is NOT food, set food_name to 'Not Food' and both scores to -1.\n\n"
        f"Respond with ONLY a JSON object (no markdown, no code fences):\n"
        f'{{\n'
        f'  "food_name": "string — name of the overall food/meal",\n'
        f'  "category": "string — Fast Food, Home Cooked, Street Food, Fruit, '
        f'Beverage, Packaged Snack, Dessert, Thali/Meal Plate",\n'
        f'  "general_health_score": "0-100 for average healthy adult",\n'
        f'  "personal_health_score": "0-100 for THIS user based on their profile",\n'
        f'  "verdict": "1-2 sentence general health verdict",\n'
        f'  "personal_verdict": "1-2 sentence verdict specific to this user — '
        f'reference their conditions/goals by name",\n'
        f'  "ingredients": ["array of likely ingredients"],\n'
        f'  "harmful_additives": [\n'
        f'    {{"name": "str", "risk": "low|medium|high", "description": "str"}}\n'
        f'  ],\n'
        f'  "positives": ["health benefits"],\n'
        f'  "concerns": ["health concerns for this user"],\n'
        f'  "swaps": [\n'
        f'    {{"original": "str", "suggestion": "str", "benefit": "str"}}\n'
        f'  ],\n'
        f'  "allergen_alerts": [\n'
        f'    {{"allergen": "str", "severity": "warning|danger", '
        f'"message": "what to watch out for"}}\n'
        f'  ],\n'
        f'  "meal_items": [\n'
        f'    {{"name": "item name", "health_score": 0-100, '
        f'"calories_estimate": 0, "brief": "one-line note"}}\n'
        f'  ],\n'
        f'  "daily_impact": "string — how this meal affects their daily totals '
        f'(empty string if no daily intake provided)"\n'
        f'}}\n\n'
        f"Scoring guide:\n"
        f"- Fresh fruits/vegetables: 80-95\n"
        f"- Home cooked balanced meals: 60-80\n"
        f"- Street food (pani puri, vada pav): 30-50\n"
        f"- Fast food (pizza, burger): 20-45\n"
        f"- Sugary drinks/desserts: 5-25\n"
        f"- Packaged snacks: varies by ingredients\n"
        f"Maximum 3 swap suggestions. Be specific and actionable."
    )
