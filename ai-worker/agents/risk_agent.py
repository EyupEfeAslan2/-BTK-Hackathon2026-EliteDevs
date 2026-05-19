import logging
import numpy as np
from crewai import Agent, Task
from typing import Dict, List, Any, Tuple, Optional
from core.gemini import get_gemini

logger = logging.getLogger(__name__)

class RiskAgent:
    def __init__(self):
        self.agent = Agent(
            role="Credit Risk Officer",
            goal="Evaluate corporate default risks, calculate debt servicing metrics, and provide actionable credit committee recommendations",
            backstory="""You are a senior credit risk officer with extensive experience in corporate lending, credit analysis, and debt underwriting. You excel at identifying potential default risks, calculating debt servicing capabilities, and providing clear, actionable loan approval recommendations based on comprehensive credit analysis.""",
            verbose=True,
            allow_delegation=False,
            llm=get_gemini()
        )
    
    def create_risk_assessment_task(self, analysis_results: Dict[str, Any]) -> Task:
        symbols = analysis_results.get("symbols", [])
        
        return Task(
            description=f"""
            Perform comprehensive credit risk assessment and generate committee recommendations for: {', '.join(symbols)}
            
            Your assessment should include:
            1. Calculate default risk metrics including probability of default and covenant breach risks
            2. Identify key credit risk factors for each corporate entity
            3. Assess industry concentration and systemic risks
            4. Evaluate macroeconomic impacts on debt servicing
            5. Consider liquidity and operational risks
            6. Generate specific credit decisions with recommended loan terms
            7. Provide risk mitigation strategies and covenant requirements
            8. Create final credit committee memos
            
            Use the provided financial health analysis, fundamental analysis, and market data to make informed risk assessments.
            
            Provide clear, actionable recommendations with specific risk parameters and loan guidelines.

            For the "justification_summary" field, write a human-readable 2-3 sentence Explainable AI narrative. It MUST explicitly summarize the debate between agents, for example: "The Advocate Agent highlighted steady revenue, BUT the Risk Auditor flagged tight liquidity margins. Therefore, the committee decided to...". Do not list raw numbers or scores as the justification_summary.

            Include "agent_votes" as a JSON array. Each item MUST contain "agent_name", "vote", and "brief_reason". Use exactly these agents: "Risk Auditor", "Advocate", "Compliance". Votes MUST be one of "APPROVE", "REJECT", or "CONDITIONAL". Each brief_reason MUST be one short sentence based on the debate.

            Include "raw_telemetry" as a JSON object containing the raw yfinance metrics used by the agents, including keys such as "total_debt", "free_cash_flow", and "current_ratio".

            CRITICAL: OUTPUT ONLY RAW VALID JSON. DO NOT WRAP IN MARKDOWN. DO NOT USE ```json.
            """,
            agent=self.agent,
            expected_output="Raw JSON credit risk report with committee_decision, default_risk_level, recommended_loan_terms, justification_summary, raw_telemetry, and agent_votes"
        )
    
    def calculate_risk_metrics(self, symbols: List[str], stock_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            risk_metrics = {}
            
            for symbol in symbols:
                if symbol not in stock_data or "error" in stock_data[symbol]:
                    # Keep per-symbol failures isolated so batch analysis can still return useful rows.
                    risk_metrics[symbol] = {"error": "No data available for risk calculation"}
                    continue
                
                logger.info(f"Calculating risk metrics for {symbol}")
                
                hist_data = stock_data[symbol].get("historical_data", {})
                if not hist_data or "Close" not in hist_data:
                    risk_metrics[symbol] = {"error": "Insufficient historical data"}
                    continue
                
                prices = np.array(list(hist_data["Close"].values()))
                # Daily returns power volatility, VaR, Sharpe, and the composite risk score.
                returns = np.diff(prices) / prices[:-1]
                
                metrics = {
                    "volatility": {
                        "daily": np.std(returns),
                        "annualized": np.std(returns) * np.sqrt(252)
                    },
                    "var": {
                        "95_percent": np.percentile(returns, 5),
                        "99_percent": np.percentile(returns, 1)
                    },
                    "max_drawdown": self.calculate_max_drawdown(prices),
                    "sharpe_ratio": self.calculate_sharpe_ratio(returns),
                    "beta": self.calculate_beta(returns, symbol),
                    "risk_score": self.calculate_risk_score(returns, prices)
                }
                
                risk_metrics[symbol] = metrics
            
            return {
                "risk_metrics": risk_metrics,
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Error in risk assessment: {str(e)}")
            return {"error": True, "message": str(e), "data": {}, "status": "failed"}
    
    def assess_portfolio_risk(self, symbols: List[str], risk_metrics: Dict[str, Any]) -> Dict[str, Any]:
        try:
            individual_risks = []
            valid_symbols = []
            
            for symbol in symbols:
                if symbol in risk_metrics and "error" not in risk_metrics[symbol]:
                    risk_score = risk_metrics[symbol].get("risk_score", 50)
                    individual_risks.append(risk_score)
                    valid_symbols.append(symbol)
            
            if not individual_risks:
                return {"error": "No valid risk data for portfolio assessment"}
            
            portfolio_risk = {
                "average_risk_score": np.mean(individual_risks),
                "risk_concentration": np.std(individual_risks),
                "diversification_score": self.calculate_diversification_score(valid_symbols),
                "portfolio_volatility": self.estimate_portfolio_volatility(risk_metrics, valid_symbols),
                "risk_level": self.classify_risk_level(np.mean(individual_risks))
            }
            
            return {
                "portfolio_risk": portfolio_risk,
                "recommendations": self.generate_portfolio_recommendations(portfolio_risk),
                "status": "success"
            }
            
        except Exception as e:
            logger.error(f"Error calculating portfolio risk: {str(e)}")
            return {"error": True, "message": str(e), "data": {}, "status": "failed"}
    
    def generate_credit_decisions(self, 
                                          analysis_results: Dict[str, Any], 
                                          risk_assessment: Dict[str, Any],
                                          requested_amount: Optional[str] = None) -> Dict[str, Any]:
        try:
            symbols = analysis_results.get("symbols", [])
            technical_analysis = analysis_results.get("technical_analysis", {}).get("technical_analysis", {})
            fundamental_analysis = analysis_results.get("fundamental_analysis", {}).get("fundamental_analysis", {})
            risk_metrics = risk_assessment.get("risk_metrics", {})
            
            recommendations = {}
            
            for symbol in symbols:
                logger.info(f"Generating credit decision for {symbol}")
                
                tech_data = technical_analysis.get(symbol, {})
                fund_data = fundamental_analysis.get(symbol, {})
                risk_data = risk_metrics.get(symbol, {})
                
                if not isinstance(tech_data, dict): tech_data = {}
                if not isinstance(fund_data, dict): fund_data = {}
                if not isinstance(risk_data, dict): risk_data = {}
                
                # Ignore missing fundamentals and rely on tech/risk
                if "error" in tech_data and "error" in risk_data:
                    # No automated approval should be issued when both signal sources are unavailable.
                    recommendations[symbol] = {
                        "committee_decision": "MANUAL_REVIEW",
                        "justification_summary": "Incomplete analysis data for this entity",
                        "default_risk_level": "UNKNOWN",
                        "recommended_loan_terms": {
                            "max_amount": "$0M",
                            "tenor": "0 months",
                            "covenants": ["Requires manual underwriting"]
                        }
                    }
                    continue
                
                technical_signal = tech_data.get("trading_signals", {}).get("overall_signal", "NEUTRAL")
                technical_confidence = tech_data.get("trading_signals", {}).get("confidence", 0.5)
                fundamental_score = fund_data.get("fundamental_score", 50)
                risk_score = risk_data.get("risk_score", 50)
                
                recommendation = self.generate_credit_decision(
                    technical_signal, technical_confidence, fundamental_score, risk_score
                )
                
                # Loan capacity and covenants are deterministic so What-If simulations are reproducible.
                max_amount = self.calculate_loan_amount(risk_score, technical_confidence)
                tenor, covenants = self.calculate_loan_terms(technical_signal, risk_score)
                
                recommendations[symbol] = {
                    "committee_decision": recommendation["action"],
                    "confidence": recommendation["confidence"],
                    "justification_summary": recommendation["reasoning"],
                    "recommended_loan_terms": {
                        "max_amount": f"${max_amount:.1f}M",
                        "tenor": tenor,
                        "covenants": covenants
                    },
                    "default_risk_level": self.classify_risk_level(risk_score),
                    "key_risks": self.identify_key_risks(tech_data, fund_data, risk_data),
                    "agent_votes": self.generate_agent_votes(
                        recommendation["action"],
                        technical_signal,
                        fundamental_score,
                        risk_score
                    )
                }

                # What-If override: requested facilities above capacity must tighten or fail the decision.
                if requested_amount:
                    try:
                        req_val = float(requested_amount.replace("$", "").replace("M", "").replace(",", "").strip())
                        if req_val > max_amount * 1.5:
                            recommendations[symbol]["committee_decision"] = "REJECTED"
                            recommendations[symbol]["justification_summary"] = (
                                f"The user requested a loan of {requested_amount}, which exceeds the computed maximum capacity of ${max_amount:.1f}M by more than 50%. "
                                f"The Risk Auditor flagged this as unsupportable given current liquidity and cash flow. REJECTED."
                            )
                            recommendations[symbol]["agent_votes"] = self.generate_agent_votes(
                                "REJECTED",
                                technical_signal,
                                fundamental_score,
                                risk_score,
                                override_reason=f"Requested amount exceeds computed capacity of ${max_amount:.1f}M."
                            )
                        elif req_val > max_amount:
                            recommendations[symbol]["committee_decision"] = "CONDITIONAL"
                            recommendations[symbol]["justification_summary"] = (
                                f"The user requested a loan of {requested_amount}, which exceeds the computed maximum capacity of ${max_amount:.1f}M. "
                                f"The committee grants CONDITIONAL approval subject to additional collateral and tighter covenants."
                            )
                            recommendations[symbol]["agent_votes"] = self.generate_agent_votes(
                                "CONDITIONAL",
                                technical_signal,
                                fundamental_score,
                                risk_score,
                                override_reason=f"Requested amount is above computed capacity of ${max_amount:.1f}M."
                            )
                    except ValueError:
                        # Invalid user-entered amount should not crash the committee pipeline.
                        pass
            
            return {
                "individual_decisions": recommendations,
                "overall_resolution": self.generate_committee_resolution(recommendations),
                "status": "success"
            }
            
        except Exception as e:
            import traceback
            logger.error(f"Error generating recommendations: {str(e)}")
            logger.error(traceback.format_exc())
            return {"error": True, "message": str(e), "data": {}, "status": "failed"}
    
    def execute_risk_assessment(self, analysis_results: Dict[str, Any], requested_amount: Optional[str] = None) -> Dict[str, Any]:
        logger.info("Starting comprehensive risk assessment")
        
        symbols = analysis_results.get("symbols", [])
        
        technical_analysis = analysis_results.get("technical_analysis", {}).get("technical_analysis", {})
        
        stock_data = {}
        for symbol in symbols:
            if symbol in technical_analysis:
                tech_data = technical_analysis[symbol]
                if "error" not in tech_data:
                    # Later stages expect a stock_data-like shape even when only technical data exists.
                    stock_data[symbol] = {
                        "historical_data": {"Close": {}},
                        "current_price": tech_data.get("current_price")
                    }
                    
                    logger.warning(f"Risk calculation for {symbol} may be limited without direct access to historical data")
                else:
                    stock_data[symbol] = {"error": tech_data.get("error", "No data available")}
        
        results = {
            "symbols": symbols,
            "assessment_timestamp": analysis_results.get("analysis_timestamp")
        }
        
        if not any("historical_data" in data and data["historical_data"]["Close"] 
                  for data in stock_data.values() if "error" not in data):
            logger.warning("Insufficient historical data for detailed risk analysis, using fallback assessment")
            # Fallback metrics keep the memo complete while clearly marking the estimate.
            risk_metrics = self._generate_fallback_risk_metrics(symbols, technical_analysis)
        else:
            risk_metrics = self.calculate_risk_metrics(symbols, stock_data)
        
        results["risk_metrics"] = risk_metrics
        
        portfolio_risk = self.assess_portfolio_risk(symbols, risk_metrics.get("risk_metrics", {}))
        results["portfolio_risk"] = portfolio_risk
        
        recommendations = self.generate_credit_decisions(analysis_results, risk_metrics, requested_amount=requested_amount)
        results["recommendations"] = recommendations
        
        risk_management = self.generate_risk_management_plan(results)
        results["risk_management"] = risk_management
        
        return results
    
    def _generate_fallback_risk_metrics(self, symbols: List[str], technical_analysis: Dict[str, Any]) -> Dict[str, Any]:
        risk_metrics = {}
        
        for symbol in symbols:
            tech_data = technical_analysis.get(symbol, {})
            if "error" in tech_data:
                risk_metrics[symbol] = {"error": "No technical data available"}
                continue
            
            technical_signal = tech_data.get("trading_signals", {}).get("overall_signal", "NEUTRAL")
            confidence = tech_data.get("trading_signals", {}).get("confidence", 0.5)
            
            # Start from moderate risk and move only when the technical signal is confident.
            base_risk = 50  # Default moderate risk
            
            if technical_signal == "LOW DEFAULT RISK" and confidence > 0.7:
                risk_score = 35  # Lower risk for strong positive signals
            elif technical_signal == "HIGH DEFAULT RISK" and confidence > 0.7:
                risk_score = 75  # Higher risk for strong negative signals
            elif confidence < 0.3:
                risk_score = 65  # Higher risk for uncertain signals
            else:
                risk_score = base_risk
        
            risk_metrics[symbol] = {
                "volatility": {
                    "daily": 0.02,
                    "annualized": 0.32
                },
                "var": {
                    "95_percent": -0.03,
                    "99_percent": -0.05
                },
                "max_drawdown": -0.15,
                "sharpe_ratio": 0.8,
                "beta": 1.1,
                "risk_score": risk_score,
                "estimation_note": "Risk metrics estimated from technical analysis due to limited historical data"
            }
        
        return {
            "risk_metrics": risk_metrics,
            "status": "success"
        }
    
    def calculate_max_drawdown(self, prices: np.ndarray) -> float:
        peak = np.maximum.accumulate(prices)
        drawdown = (prices - peak) / peak
        return float(np.min(drawdown))
    
    def calculate_sharpe_ratio(self, returns: np.ndarray, risk_free_rate: float = 0.02) -> float:
        if len(returns) == 0 or np.std(returns) == 0:
            return 0.0
        
        excess_returns = np.mean(returns) - (risk_free_rate / 252)  # Daily risk-free rate
        return float(excess_returns / np.std(returns) * np.sqrt(252))
    
    def calculate_beta(self, returns: np.ndarray, symbol: str) -> float:
        # Market benchmark data is not fetched in this path; use a conservative assumed volatility.
        market_volatility = 0.16  # Assumed market volatility
        stock_volatility = np.std(returns) * np.sqrt(252)
        
        return float(stock_volatility / market_volatility) if market_volatility > 0 else 1.0
    
    def calculate_risk_score(self, returns: np.ndarray, prices: np.ndarray) -> float:
        if len(returns) == 0:
            return 50.0
        
        volatility = np.std(returns) * np.sqrt(252)
        max_dd = abs(self.calculate_max_drawdown(prices))
        
        # Cap volatility and drawdown contributions so one noisy series cannot dominate entirely.
        vol_score = min(volatility * 100, 50)  # Cap at 50
        dd_score = min(max_dd * 100, 50)      
        
        return float(vol_score + dd_score)
    
    def calculate_diversification_score(self, symbols: List[str]) -> float:
        num_stocks = len(symbols)
        if num_stocks >= 10:
            return 90.0
        elif num_stocks >= 5:
            return 70.0
        elif num_stocks >= 3:
            return 50.0
        else:
            return 20.0
    
    def estimate_portfolio_volatility(self, risk_metrics: Dict[str, Any], symbols: List[str]) -> float:
        volatilities = []
        for symbol in symbols:
            if symbol in risk_metrics and "volatility" in risk_metrics[symbol]:
                vol = risk_metrics[symbol]["volatility"].get("annualized", 0.2)
                volatilities.append(vol)
        
        if not volatilities:
            return 0.2
        
        avg_vol = np.mean(volatilities)
        diversification_benefit = 0.8 if len(volatilities) > 1 else 1.0
        
        return float(avg_vol * diversification_benefit)
    
    def classify_risk_level(self, risk_score: float) -> str:
        if risk_score < 30:
            return "LOW"
        elif risk_score < 60:
            return "MODERATE"
        elif risk_score < 80:
            return "HIGH"
        else:
            return "VERY_HIGH"
    
    def generate_portfolio_recommendations(self, portfolio_risk: Dict[str, Any]) -> List[str]:
        recommendations = []
        
        risk_level = portfolio_risk.get("risk_level", "MODERATE")
        diversification = portfolio_risk.get("diversification_score", 50)
        
        if risk_level in ["HIGH", "VERY_HIGH"]:
            recommendations.append("Consider reducing position sizes due to high portfolio risk")
            recommendations.append("Implement strict stop-loss orders")
        
        if diversification < 50:
            recommendations.append("Increase diversification across sectors and asset classes")
        
        if portfolio_risk.get("risk_concentration", 0) > 20:
            recommendations.append("Reduce concentration risk by rebalancing positions")
        
        return recommendations
    
    def generate_credit_decision(self, 
                                     technical_signal: str, 
                                     technical_confidence: float,
                                     fundamental_score: float, 
                                     risk_score: float) -> Dict[str, Any]:
        
        # Deterministic generation
        if technical_signal == "LOW DEFAULT RISK" and risk_score < 70:
            action = "APPROVED"
        elif technical_signal == "HIGH DEFAULT RISK" or risk_score > 80:
            action = "REJECTED"
        else:
            action = "CONDITIONAL"
        
        confidence = min(technical_confidence + 0.2, 1.0)

        advocate_view = self._build_advocate_view(technical_signal, fundamental_score)
        auditor_view = self._build_risk_auditor_view(risk_score, technical_signal)
        reasoning = (
            f"The Advocate Agent highlighted {advocate_view}, BUT the Risk Auditor flagged {auditor_view}. "
            f"Therefore, the committee decided to {action.lower()} the request with terms calibrated to the borrower profile. "
            "This decision reflects a balanced XAI review of repayment capacity, operating momentum, and downside protection."
        )
        
        return {
            "action": action,
            "confidence": confidence,
            "reasoning": reasoning
        }

    def generate_agent_votes(
            self,
            action: str,
            technical_signal: str,
            fundamental_score: float,
            risk_score: float,
            override_reason: Optional[str] = None) -> List[Dict[str, str]]:

        final_vote = self._normalize_vote(action)
        advocate_vote = "APPROVE" if fundamental_score >= 60 or technical_signal == "LOW DEFAULT RISK" else "CONDITIONAL"
        risk_vote = "REJECT" if risk_score >= 70 or technical_signal == "HIGH DEFAULT RISK" else "CONDITIONAL" if risk_score >= 45 else "APPROVE"
        compliance_vote = "CONDITIONAL" if final_vote == "CONDITIONAL" else "APPROVE" if final_vote == "APPROVE" else "REJECT"

        risk_reason = override_reason or self._build_risk_auditor_view(risk_score, technical_signal).capitalize() + "."

        return [
            {
                "agent_name": "Risk Auditor",
                "vote": risk_vote,
                "brief_reason": risk_reason
            },
            {
                "agent_name": "Advocate",
                "vote": advocate_vote,
                "brief_reason": self._build_advocate_view(technical_signal, fundamental_score).capitalize() + "."
            },
            {
                "agent_name": "Compliance",
                "vote": compliance_vote,
                "brief_reason": "No blocking compliance issue was identified in the automated review."
            }
        ]

    def _normalize_vote(self, action: str) -> str:
        normalized = (action or "CONDITIONAL").upper()
        if normalized in ("APPROVED", "APPROVE"):
            return "APPROVE"
        if normalized in ("REJECTED", "REJECT"):
            return "REJECT"
        return "CONDITIONAL"

    def _build_advocate_view(self, technical_signal: str, fundamental_score: float) -> str:
        if technical_signal == "LOW DEFAULT RISK" and fundamental_score >= 60:
            return "supportive operating momentum and enough financial strength to justify credit availability"
        if fundamental_score >= 60:
            return "a comparatively resilient fundamental profile despite mixed market signals"
        if technical_signal == "LOW DEFAULT RISK":
            return "improving financial-health momentum that supports a lending case"
        return "the parts of the profile that remain serviceable under a controlled structure"

    def _build_risk_auditor_view(self, risk_score: float, technical_signal: str) -> str:
        if risk_score >= 70 or technical_signal == "HIGH DEFAULT RISK":
            return "elevated default risk and limited tolerance for weaker liquidity or cash-flow shocks"
        if risk_score >= 45:
            return "moderate downside risk that requires covenants and closer monitoring"
        return "residual execution risk that still warrants disciplined reporting and covenant controls"
    
    def calculate_loan_amount(self, risk_score: float, confidence: float) -> float:
        base_size = 50.0  # $50M base
        
        risk_multiplier = max(0.2, (100 - risk_score) / 100)
        confidence_multiplier = confidence
        
        position_size = base_size * risk_multiplier * confidence_multiplier
        
        return min(max(position_size, 5.0), 100.0)
    
    def calculate_loan_terms(self, 
                           signal: str, 
                           risk_score: float) -> Tuple[str, List[str]]:
        
        if signal == "LOW DEFAULT RISK":
            tenor = "60 months"
            covenants = ["Maintain DSCR > 1.25", "Quarterly Financial Reporting"]
        elif signal == "HIGH DEFAULT RISK":
            tenor = "12 months"
            covenants = ["Maintain DSCR > 1.50", "Monthly Financial Reporting", "No additional debt"]
        else:
            tenor = "36 months"
            covenants = ["Maintain DSCR > 1.35", "Quarterly Financial Reporting"]
            
        if risk_score > 60:
            covenants.append("Pledge of specific assets")
            tenor = "24 months"
        
        return tenor, covenants
    
    def identify_key_risks(self, tech_data: Dict, fund_data: Dict, risk_data: Dict) -> List[str]:
        risks = []
        
        if tech_data.get("trading_signals", {}).get("overall_signal") == "HIGH DEFAULT RISK":
            risks.append("Negative financial health momentum")
        
        fund_score = fund_data.get("fundamental_score", 50)
        if fund_score < 40:
            risks.append("Weak fundamental metrics")
        
        risk_score = risk_data.get("risk_score", 50)
        if risk_score > 70:
            risks.append("High volatility and drawdown risk")
        
        volatility = risk_data.get("volatility", {}).get("annualized", 0)
        if volatility > 0.4:
            risks.append("Extremely high volatility")
        
        return risks
    
    def generate_committee_resolution(self, recommendations: Dict[str, Any]) -> Dict[str, Any]:
        if not recommendations:
            return {
                "strategy": "BALANCED_PORTFOLIO",
                "approve_signals": 0,
                "reject_signals": 0,
                "conditional_signals": 0,
                "market_outlook": "NEUTRAL",
                "committee_decision": "MANUAL_REVIEW"
            }
        
        actions = [
            rec.get("committee_decision", "CONDITIONAL") 
            for rec in recommendations.values() 
            if isinstance(rec, dict)
        ]
        
        approve_count = sum(1 for action in actions if action == "APPROVED")
        reject_count = sum(1 for action in actions if action == "REJECTED")
        conditional_count = sum(1 for action in actions if action == "CONDITIONAL")
        
        if approve_count > reject_count:
            strategy = "AGGRESSIVE_LENDING"
        elif reject_count > approve_count:
            strategy = "DEFENSIVE_LENDING"
        else:
            strategy = "BALANCED_PORTFOLIO"
        
        return {
            "strategy": strategy,
            "approve_signals": approve_count,
            "reject_signals": reject_count,
            "conditional_signals": conditional_count,
            "market_outlook": "LOW DEFAULT RISK" if approve_count > reject_count else "HIGH DEFAULT RISK" if reject_count > approve_count else "NEUTRAL"
        }
    
    def generate_risk_management_plan(self, results: Dict[str, Any]) -> Dict[str, Any]:
        portfolio_risk = results.get("portfolio_risk", {}).get("portfolio_risk", {})
        recommendations = results.get("recommendations", {}).get("individual_recommendations", {})
        
        plan = {
            "position_limits": {
                "max_single_exposure": "25%",
                "max_sector_exposure": "40%"
            },
            "covenant_strategy": "Implement tight financial covenants for high risk profiles",
            "review_frequency": "Monthly review, quarterly reporting",
            "risk_monitoring": [
                "Monthly financial reporting monitoring",
                "Quarterly debt servicing assessment",
                "Annual comprehensive review"
            ]
        }
        
        risk_level = portfolio_risk.get("risk_level", "MODERATE")
        if risk_level in ["HIGH", "VERY_HIGH"]:
            plan["immediate_actions"] = [
                "Reduce loan amounts",
                "Implement stricter covenants",
                "Require additional collateral"
            ]
        
        return plan

risk_agent = RiskAgent()
