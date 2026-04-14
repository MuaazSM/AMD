"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """FoodLens backend configuration."""

    gemini_api_key: str = ""
    groq_api_key: str = ""
    allowed_origins: str = "http://localhost:3000"
    max_image_size_mb: int = 5
    rate_limit: str = "10/minute"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
