"""FoodLens FastAPI backend — food analysis powered by Gemini + Groq Vision."""

import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.models import AnalyzeRequest, AnalyzeResponse
from app.vision import analyze_food

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="FoodLens API",
    description="AI-powered food health analyzer",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — restrict to allowed origins only
origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check() -> dict:
    """Health check endpoint for Cloud Run."""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/api/analyze", response_model=AnalyzeResponse)
@limiter.limit(settings.rate_limit)
async def analyze(request: Request, body: AnalyzeRequest) -> AnalyzeResponse:
    """Analyze a food image and return health insights."""
    try:
        result, provider = await analyze_food(
            image_b64=body.image,
            mime_type=body.mime_type,
            profile=body.profile,
            daily_intake=body.daily_intake,
        )
        return AnalyzeResponse(success=True, data=result, provider=provider)
    except Exception as e:
        logger.error("Analysis failed: %s", str(e))
        return AnalyzeResponse(success=False, error=str(e))


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all error handler — never expose stack traces."""
    logger.error("Unhandled error: %s", str(exc))
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"},
    )
