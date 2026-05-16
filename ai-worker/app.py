import logging
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from core.orchestrator import get_orchestrator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="FinWell Financial Analysis API",
    version="1.0.0",
    description="Headless multi-agent financial analysis service.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    symbols: List[str] = Field(..., min_length=1, description="Stock symbols to analyze.")
    period: str = Field(default="1y", description="Analysis period supported by the data provider.")
    use_crew: bool = Field(default=False, description="Run the CrewAI workflow instead of direct orchestration.")
    requested_amount: Optional[str] = Field(default=None, description="Optional loan amount for What-If simulation.")

    @field_validator("symbols")
    @classmethod
    def normalize_symbols(cls, symbols: List[str]) -> List[str]:
        normalized = [symbol.strip().upper() for symbol in symbols if symbol and symbol.strip()]
        if not normalized:
            raise ValueError("At least one non-empty stock symbol is required.")
        return normalized


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/history")
def history() -> List[Any]:
    return []


@app.post("/api/v1/analyze", response_model=None)
def analyze(request: AnalyzeRequest) -> Dict[str, Any]:
    try:
        result = get_orchestrator().analyze_stocks(
            symbols=request.symbols,
            analysis_period=request.period,
            use_crew=request.use_crew,
            requested_amount=request.requested_amount,
        )
    except ValueError as exc:
        logger.warning("Analysis setup failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Unexpected analysis failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analysis failed unexpectedly.",
        ) from exc

    if result.get("status") == "failed":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result,
        )

    return result
