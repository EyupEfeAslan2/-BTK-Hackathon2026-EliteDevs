import logging
import json
import math
import re  # <-- YZ markdown etiketlerini temizlemek için eklendi
from crewai import Crew, Process
from functools import lru_cache
from typing import Dict, List, Any, Optional
from datetime import datetime
from core.config import settings
from core.gemini import get_gemini
from agents.data_agent import DataAgent
from agents.analysis_agent import AnalysisAgent
from agents.risk_agent import RiskAgent
from agents.compliance_agent import ComplianceAgent

logger = logging.getLogger(__name__)

class FinancialAnalysisOrchestrator:
    def __init__(self):
        self.data_agent = DataAgent()
        self.analysis_agent = AnalysisAgent()
        self.risk_agent = RiskAgent()
        self.compliance_agent = ComplianceAgent()
        self.crew = None
        self.validate_setup()
    
    def validate_setup(self):
        if not settings.google_api_key:
            raise ValueError("Gemini not configured. Please set up API keys in .env file.")
        
        logger.info("Financial Analysis Orchestrator initialized successfully")
        logger.info(f"Available LLM providers: {get_gemini()}")
    
    def create_analysis_crew(self, symbols: List[str], analysis_period: str = "1y", requested_amount: Optional[str] = None) -> Crew:
        raw_json_instruction = "CRITICAL: OUTPUT ONLY RAW VALID JSON. DO NOT WRAP IN MARKDOWN. DO NOT USE ```json."
        data_task = self.data_agent.create_data_collection_task(symbols, analysis_period)
        
        compliance_task = self.compliance_agent.create_compliance_analysis_task({"symbols": symbols})
        compliance_task.context = [data_task]
        
        analysis_task = self.analysis_agent.create_analysis_task({"symbols": symbols})
        analysis_task.context = [data_task]
        
        risk_task = self.risk_agent.create_risk_assessment_task({"symbols": symbols})
        risk_task.description = f"{risk_task.description}\n\n{raw_json_instruction}"
        if requested_amount:
            risk_task.description += f"\n\nThe user is specifically requesting a loan of {requested_amount}. You MUST evaluate if their financial telemetry (liquidity, cash flow) can support this exact debt burden. If it is too high, you MUST REJECT or severely CONDITIONAL the request."
        risk_task.context = [data_task, analysis_task, compliance_task]
        
        crew = Crew(
            agents=[
                self.data_agent.agent,
                self.compliance_agent.agent,
                self.analysis_agent.agent,
                self.risk_agent.agent
            ],
            tasks=[data_task, compliance_task, analysis_task, risk_task],
            process=Process.sequential,
            verbose=False
        )
        
        return crew
    
    def analyze_stocks(self, 
                      symbols: List[str], 
                      analysis_period: str = "1y",
                      use_crew: bool = False,
                      requested_amount: Optional[str] = None) -> Dict[str, Any]:
        
        logger.info(f"Starting financial analysis for symbols: {symbols}")
        
        start_time = datetime.now()
        
        try:
            if use_crew:
                result = self.analyze_with_crew(symbols, analysis_period, requested_amount=requested_amount)
            else:
                result = self.analyze_direct(symbols, analysis_period, requested_amount=requested_amount)

            return self.make_json_safe(result)
                
        except Exception as e:
            logger.error(f"Error in stock analysis: {str(e)}")
            return {
                "error": str(e),
                "status": "failed",
                "timestamp": datetime.now().isoformat()
            }
        finally:
            end_time = datetime.now()
            logger.info(f"Analysis completed in {(end_time - start_time).total_seconds():.2f} seconds")
    
    def analyze_with_crew(self, symbols: List[str], analysis_period: str, requested_amount: Optional[str] = None) -> Dict[str, Any]:
        crew = self.create_analysis_crew(symbols, analysis_period, requested_amount=requested_amount)
        
        result = crew.kickoff()
        
        # Also ensure compliance_and_legal is available at the root level for consistency
        compliance_results = self.compliance_agent.execute_compliance_analysis(symbols)
        
        return {
            "symbols": symbols,
            "analysis_period": analysis_period,
            "crew_result": self.parse_crew_result(result),
            "compliance_and_legal": {
                "veto_flag": compliance_results.get("veto_flag", False),
                "legal_summary": compliance_results.get("legal_summary", "No data")
            },
            "method": "crew_orchestration",
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
    
    def analyze_direct(self, symbols: List[str], analysis_period: str, requested_amount: Optional[str] = None) -> Dict[str, Any]:
        logger.info("Step 1: Collecting financial data...")
        collected_data = self.data_agent.execute_data_collection(symbols, analysis_period)
        
        if "error" in collected_data:
            return {
                "error": f"Data collection failed: {collected_data['error']}",
                "status": "failed",
                "timestamp": datetime.now().isoformat()
            }
        
        logger.info("Step 2: Performing financial analysis...")
        analysis_results = self.analysis_agent.execute_comprehensive_analysis(collected_data)
        
        if "error" in analysis_results:
            return {
                "error": f"Analysis failed: {analysis_results['error']}",
                "status": "failed",
                "timestamp": datetime.now().isoformat()
            }
        
        logger.info("Step 3: Conducting risk assessment...")
        risk_results = self.risk_agent.execute_risk_assessment(analysis_results, requested_amount=requested_amount)
        
        if "error" in risk_results:
            return {
                "error": f"Risk assessment failed: {risk_results['error']}",
                "status": "failed",
                "timestamp": datetime.now().isoformat()
            }
            
        logger.info("Step 4: Conducting compliance and legal analysis...")
        compliance_results = self.compliance_agent.execute_compliance_analysis(symbols)
        
        if "error" in compliance_results:
            logger.warning(f"Compliance analysis failed: {compliance_results['error']}")
            compliance_results = {
                "veto_flag": False,
                "legal_summary": "Compliance analysis failed or unavailable."
            }
        
        final_results = {
            "symbols": symbols,
            "analysis_period": analysis_period,
            "data_collection": collected_data,
            "analysis": analysis_results,
            "risk_assessment": risk_results,
            "compliance_and_legal": {
                "veto_flag": compliance_results.get("veto_flag", False),
                "legal_summary": compliance_results.get("legal_summary", "No data")
            },
            "credit_committee_memo": self.generate_credit_committee_memo(
                symbols, collected_data, analysis_results, risk_results, compliance_results
            ),
            "method": "direct_orchestration",
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
        
        return final_results
    
    def generate_credit_committee_memo(self, 
                                  symbols: List[str],
                                  data: Dict[str, Any],
                                  analysis: Dict[str, Any], 
                                  risk: Dict[str, Any],
                                  compliance: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        
        # If no risk recommendations are available
        recommendations = risk.get("recommendations", {}).get("individual_decisions", {})
        
        if not recommendations and symbols:
            return {
                "committee_decision": "MANUAL_REVIEW",
                "default_risk_level": "UNKNOWN",
                "recommended_loan_terms": {
                    "max_amount": "$0M",
                    "tenor": "0 months",
                    "covenants": ["Requires manual underwriting"]
                },
                "justification_summary": "The Advocate Agent could not identify enough verified strengths to support an automated approval, BUT the Risk Auditor flagged the missing evidence as a material underwriting gap. Therefore, the committee decided to send the request to manual review until repayment capacity, liquidity, and covenant coverage can be confirmed.",
                "raw_telemetry": self.extract_raw_telemetry(symbols, data, analysis),
                "agent_votes": [
                    {
                        "agent_name": "Risk Auditor",
                        "vote": "CONDITIONAL",
                        "brief_reason": "Missing underwriting evidence requires manual risk review."
                    },
                    {
                        "agent_name": "Advocate",
                        "vote": "CONDITIONAL",
                        "brief_reason": "Potential credit support cannot be confirmed from available data."
                    },
                    {
                        "agent_name": "Compliance",
                        "vote": "CONDITIONAL",
                        "brief_reason": "Manual compliance confirmation is required before approval."
                    }
                ]
            }
            
        # For a single symbol (most common use case in this app)
        if len(symbols) == 1 or len(recommendations) == 1:
            symbol = symbols[0] if symbols else list(recommendations.keys())[0]
            rec = recommendations.get(symbol, {})
            
            agent_votes = self.apply_compliance_vote(
                rec.get("agent_votes", []),
                compliance
            )

            return {
                "committee_decision": rec.get("committee_decision", "CONDITIONAL"),
                "default_risk_level": rec.get("default_risk_level", "MEDIUM"),
                "recommended_loan_terms": rec.get("recommended_loan_terms", {
                    "max_amount": "$0M",
                    "tenor": "0 months",
                    "covenants": ["Standard covenants apply"]
                }),
                "justification_summary": rec.get("justification_summary", "Decision based on automated review."),
                "raw_telemetry": self.extract_raw_telemetry([symbol], data, analysis),
                "agent_votes": agent_votes
            }
        
        # If multiple symbols are requested, aggregate them into a portfolio memo
        overall_resolution = risk.get("recommendations", {}).get("overall_resolution", {})
        
        return {
            "committee_decision": "CONDITIONAL",
            "default_risk_level": overall_resolution.get("market_outlook", "MEDIUM"),
            "recommended_loan_terms": {
                "max_amount": "Portfolio Level",
                "tenor": "Various",
                "covenants": ["Portfolio covenants apply"]
            },
            "justification_summary": f"Portfolio analysis for {len(symbols)} entities. Strategy: {overall_resolution.get('strategy', 'BALANCED_PORTFOLIO')}.",
            "raw_telemetry": self.extract_raw_telemetry(symbols, data, analysis),
            "agent_votes": [
                {
                    "agent_name": "Risk Auditor",
                    "vote": "CONDITIONAL",
                    "brief_reason": "Portfolio exposure requires diversified covenants and monitoring."
                },
                {
                    "agent_name": "Advocate",
                    "vote": "CONDITIONAL",
                    "brief_reason": "A balanced portfolio structure can support selective lending."
                },
                {
                    "agent_name": "Compliance",
                    "vote": "CONDITIONAL",
                    "brief_reason": "Each borrower requires entity-level compliance confirmation."
                }
            ]
        }

    def extract_raw_telemetry(
            self,
            symbols: List[str],
            data: Dict[str, Any],
            analysis: Dict[str, Any]) -> Dict[str, Any]:

        stocks = data.get("stock_data", {}).get("stocks", {})
        fundamentals = analysis.get("fundamental_analysis", {}).get("fundamental_analysis", {})
        telemetry = {}

        for symbol in symbols:
            stock = stocks.get(symbol, {})
            info = stock.get("company_info", {}) if isinstance(stock, dict) else {}
            fundamental = fundamentals.get(symbol, {}) if isinstance(fundamentals, dict) else {}
            health = fundamental.get("financial_health", {}) if isinstance(fundamental, dict) else {}

            telemetry[symbol] = {
                "total_debt": health.get("total_debt", info.get("totalDebt")),
                "free_cash_flow": health.get("free_cashflow", info.get("freeCashflow")),
                "current_ratio": health.get("current_ratio", info.get("currentRatio")),
                "quick_ratio": health.get("quick_ratio", info.get("quickRatio")),
                "total_cash": health.get("total_cash", info.get("totalCash")),
                "debt_to_equity": health.get("debt_to_equity", info.get("debtToEquity")),
                "market_cap": stock.get("market_cap", info.get("marketCap")) if isinstance(stock, dict) else None,
                "current_price": stock.get("current_price") if isinstance(stock, dict) else None,
                "volume": stock.get("volume") if isinstance(stock, dict) else None,
                "pe_ratio": stock.get("pe_ratio", info.get("trailingPE")) if isinstance(stock, dict) else None
            }

        return telemetry

    def apply_compliance_vote(
            self,
            agent_votes: List[Dict[str, Any]],
            compliance: Optional[Dict[str, Any]]) -> List[Dict[str, str]]:

        votes = [
            {
                "agent_name": str(vote.get("agent_name", "")),
                "vote": str(vote.get("vote", "CONDITIONAL")),
                "brief_reason": str(vote.get("brief_reason", "Automated agent vote recorded."))
            }
            for vote in agent_votes
            if isinstance(vote, dict)
        ]

        if not any(vote.get("agent_name") == "Compliance" for vote in votes):
            votes.append({
                "agent_name": "Compliance",
                "vote": "APPROVE",
                "brief_reason": "No blocking compliance issue was identified in the automated review."
            })

        if compliance and compliance.get("veto_flag"):
            for vote in votes:
                if vote.get("agent_name") == "Compliance":
                    vote["vote"] = "REJECT"
                    vote["brief_reason"] = compliance.get("legal_summary", "Compliance veto requires rejection.")[:180]

        return votes

    def parse_crew_result(self, result: Any) -> Any:
        raw_result = getattr(result, "raw", result)

        if isinstance(raw_result, (dict, list)):
            return self.make_json_safe(raw_result)

        if hasattr(result, "to_dict"):
            try:
                return self.make_json_safe(result.to_dict())
            except Exception:
                logger.debug("Crew result to_dict() conversion failed", exc_info=True)

        if isinstance(raw_result, str):
            text = raw_result.strip()
            
            # --- ACIMASIZ MARKDOWN TEMİZLEYİCİ ---
            # LLM'nin araya sıkıştırdığı ```json veya ``` etiketlerini yok eder
            text = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
            text = re.sub(r'```\s*', '', text)
            text = text.strip()
            # ------------------------------------
            
            for candidate in (text, self.extract_json_payload(text)):
                if not candidate:
                    continue
                try:
                    return self.make_json_safe(json.loads(candidate))
                except json.JSONDecodeError:
                    continue
            
            logger.error(f"JSON Parse Error. Temizlenemeyen Metin: {text[:100]}...")
            return {"raw": text}

        return self.make_json_safe(raw_result)

    def extract_json_payload(self, text: str) -> str:
        object_start = text.find("{")
        object_end = text.rfind("}")
        array_start = text.find("[")
        array_end = text.rfind("]")

        candidates = []
        if object_start != -1 and object_end > object_start:
            candidates.append(text[object_start:object_end + 1])
        if array_start != -1 and array_end > array_start:
            candidates.append(text[array_start:array_end + 1])

        return max(candidates, key=len, default="")

    def make_json_safe(self, value: Any) -> Any:
        if isinstance(value, dict):
            return {str(key): self.make_json_safe(item) for key, item in value.items()}
        if isinstance(value, (list, tuple, set)):
            return [self.make_json_safe(item) for item in value]
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, float):
            return value if math.isfinite(value) else None
        if isinstance(value, (str, int, bool)) or value is None:
            return value
        if hasattr(value, "item"):
            try:
                return self.make_json_safe(value.item())
            except Exception:
                pass
        if hasattr(value, "to_dict"):
            try:
                return self.make_json_safe(value.to_dict())
            except Exception:
                pass
        return str(value)
    
    def get_quick_analysis(self, symbol: str) -> Dict[str, Any]:
        logger.info(f"Performing quick analysis for {symbol}")
        
        try:
            stock_data = self.data_agent.collect_stock_data([symbol], "3mo")
            news_data = self.data_agent.collect_news_sentiment([symbol])
            
            technical_analysis = self.analysis_agent.perform_technical_analysis([symbol], "3mo")
            
            risk_metrics = self.risk_agent.calculate_risk_metrics([symbol], 
                                                                stock_data.get("stocks", {}))
            
            compliance_results = self.compliance_agent.execute_compliance_analysis([symbol])
            
            return {
                "symbol": symbol,
                "quick_analysis": {
                    "current_price": stock_data.get("stocks", {}).get(symbol, {}).get("current_price"),
                    "price_change_percent": stock_data.get("stocks", {}).get(symbol, {}).get("price_change_percent"),
                    "technical_signal": technical_analysis.get("technical_analysis", {}).get(symbol, {}).get("trading_signals", {}).get("overall_signal"),
                    "risk_level": self.risk_agent.classify_risk_level(
                        risk_metrics.get("risk_metrics", {}).get(symbol, {}).get("risk_score", 50)
                    ),
                    "news_sentiment": news_data.get("market_sentiment", {}).get("symbol_sentiments", {}).get(symbol, {}).get("sentiment_label")
                },
                "compliance_and_legal": {
                    "veto_flag": compliance_results.get("veto_flag", False),
                    "legal_summary": compliance_results.get("legal_summary", "No data")
                },
                "status": "success",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in quick analysis for {symbol}: {str(e)}")
            return {
                "symbol": symbol,
                "error": str(e),
                "status": "failed",
                "timestamp": datetime.now().isoformat()
            }
    
@lru_cache(maxsize=1)
def get_orchestrator() -> FinancialAnalysisOrchestrator:
    return FinancialAnalysisOrchestrator()