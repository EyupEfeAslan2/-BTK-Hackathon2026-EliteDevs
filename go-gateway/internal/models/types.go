package models

// AnalyzeRequest represents the incoming JSON request payload
type AnalyzeRequest struct {
	Symbols []string `json:"symbols"`
	Period  string   `json:"period"`
}

type RecommendedLoanTerms struct {
	MaxAmount string   `json:"max_amount"`
	Tenor     string   `json:"tenor"`
	Covenants []string `json:"covenants"`
}

type AnalyzeResponse struct {
	CommitteeDecision    string               `json:"committee_decision"`
	DefaultRiskLevel     string               `json:"default_risk_level"`
	RecommendedLoanTerms RecommendedLoanTerms `json:"recommended_loan_terms"`
	JustificationSummary string               `json:"justification_summary"`
}
