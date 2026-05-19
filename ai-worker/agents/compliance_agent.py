import logging
from crewai import Agent, Task
from typing import Dict, List, Any
from core.gemini import get_gemini
from tools.news_sentiment import news_sentiment_tool

try:
    from langchain.tools import tool
except ImportError:
    from crewai.tools import tool

logger = logging.getLogger(__name__)

@tool("Search Legal and Compliance News")
def search_compliance_news(symbol: str) -> str:
    """Useful to search recent news for GDPR, KVKK violations, lawsuits, or data breaches for a specific company symbol."""
    try:
        # Limit the tool to recent news so the compliance vote reflects current lending risk.
        news = news_sentiment_tool.get_stock_news(symbol, days_back=30)
        result = []
        for n in news:
            result.append(f"Title: {n.get('title')}\nSummary: {n.get('summary')}")
        return "\n\n".join(result) if result else "No recent news found."
    except Exception as e:
        return f"Error fetching news: {str(e)}"

class ComplianceAgent:
    def __init__(self):
        self.agent = Agent(
            role="Strict Corporate Compliance & Legal Officer",
            goal="Scrape recent news and regulatory databases for the given company symbols to find GDPR/KVKK violations, pending lawsuits, or data breaches.",
            backstory="You are a ruthless, detail-oriented auditor. You NEVER hallucinate. If you cannot find concrete evidence of legal trouble, you explicitly state 'No current legal risks detected'.",
            verbose=True,
            allow_delegation=False,
            llm=get_gemini(),
            tools=[search_compliance_news]
        )
    
    def create_compliance_analysis_task(self, analysis_results: Dict[str, Any]) -> Task:
        symbols = analysis_results.get("symbols", [])
        return Task(
            description=f"""
            Conduct a strict legal and compliance audit for the following symbols: {', '.join(symbols)}
            
            Your tasks:
            1. Search for recent news regarding data breaches, GDPR/KVKK violations, or pending lawsuits using the provided tool.
            2. Analyze the severity of any legal issues found.
            3. Determine if the legal issues are critical enough to warrant a veto on investment.
            
            IMPORTANT: You NEVER hallucinate. If you cannot find concrete evidence of legal trouble, you explicitly state 'No current legal risks detected'.
            
            Output your final result as a JSON block with exactly these two keys inside a 'compliance_and_legal' object, or just the two keys directly:
            - "veto_flag": boolean (true if critical legal issues exist, false otherwise)
            - "legal_summary": string detailing your findings.
            """,
            agent=self.agent,
            expected_output="A JSON object containing 'veto_flag' (boolean) and 'legal_summary' (string) outlining compliance risks."
        )

    def execute_compliance_analysis(self, symbols: List[str]) -> Dict[str, Any]:
        logger.info(f"Starting compliance analysis for symbols: {symbols}")
        
        try:
            results = {}
            for symbol in symbols:
                news = news_sentiment_tool.get_stock_news(symbol, days_back=30)
                has_issue = False
                summary = "No current legal risks detected."
                
                for item in news:
                    text = (item.get('title', '') + " " + item.get('summary', '')).lower()
                    # Keyword match is intentionally conservative: a hit triggers manual/legal review.
                    if any(keyword in text for keyword in ['lawsuit', 'breach', 'gdpr', 'kvkk', 'violation', 'fraud', 'investigation', ' sec ', 'sec filing', 'sec probe']):
                        has_issue = True
                        summary = f"Potential legal risks detected in recent news for {symbol}. Review regulatory and news sources for details."
                        break
                        
                results[symbol] = {
                    "veto_flag": has_issue,
                    "legal_summary": summary
                }
                
            # A single entity-level legal concern vetoes the aggregated committee memo.
            any_veto = any(res["veto_flag"] for res in results.values())
            overall_summary = " | ".join([f"{sym}: {res['legal_summary']}" for sym, res in results.items()])
            
            return {
                "veto_flag": any_veto,
                "legal_summary": overall_summary,
                "details": results,
                "status": "success"
            }
        except Exception as e:
            logger.error(f"Error in compliance analysis: {str(e)}")
            return {
                "error": str(e),
                "status": "failed"
            }

compliance_agent = ComplianceAgent()
