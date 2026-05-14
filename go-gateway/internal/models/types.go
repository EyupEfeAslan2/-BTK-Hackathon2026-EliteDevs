package models

// AnalyzeRequest represents the incoming JSON request payload
type AnalyzeRequest struct {
	Symbols         []string `json:"symbols"`
	Period          string   `json:"period"`
	RequestedAmount string   `json:"requested_amount,omitempty"`
}

type RecommendedLoanTerms struct {
	MaxAmount string   `json:"max_amount"`
	Tenor     string   `json:"tenor"`
	Covenants []string `json:"covenants"`
}

type AgentVote struct {
	AgentName   string `json:"agent_name"`
	Vote        string `json:"vote"`
	BriefReason string `json:"brief_reason"`
}

type AnalyzeResponse struct {
	CommitteeDecision    string               `json:"committee_decision"`
	DefaultRiskLevel     string               `json:"default_risk_level"`
	RecommendedLoanTerms RecommendedLoanTerms `json:"recommended_loan_terms"`
	JustificationSummary string               `json:"justification_summary"`
	RawTelemetry         map[string]any       `json:"raw_telemetry"`
	AgentVotes           []AgentVote          `json:"agent_votes"`
}

type HistoryItem struct {
	Ticker            string `json:"ticker"`
	CreatedAt         string `json:"created_at"`
	CommitteeDecision string `json:"committee_decision"`
}
