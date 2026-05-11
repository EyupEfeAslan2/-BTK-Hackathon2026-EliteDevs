package models

// AnalyzeRequest represents the incoming JSON request payload
type AnalyzeRequest struct {
	Symbols []string `json:"symbols"`
	Period  string   `json:"period"`
}

// AnalyzeResponse handles the deep and dynamic JSON from the Python AI microservice
type AnalyzeResponse map[string]interface{}
