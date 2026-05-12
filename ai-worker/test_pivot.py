from core.orchestrator import get_orchestrator
import json

if __name__ == "__main__":
    result = get_orchestrator().analyze_stocks(symbols=["AAPL"], analysis_period="3mo", use_crew=False)
    print(json.dumps(result["credit_committee_memo"], indent=2))
