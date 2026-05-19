package services

import (
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"hackaton-gateway/internal/models"

	"github.com/go-resty/resty/v2"
)

// client is configured with a 180-second (3 min) timeout for the multi-agent consensus
var client = resty.New().SetTimeout(3 * time.Minute)

var markdownJSONFencePattern = regexp.MustCompile("(?is)^\\s*```(?:json)?\\s*(.*?)\\s*```\\s*$")

func stripMarkdownJSONFence(body []byte) []byte {
	// The Python worker normally returns JSON, but CrewAI/LLM paths may leak markdown fences.
	cleaned := strings.TrimSpace(string(body))
	matches := markdownJSONFencePattern.FindStringSubmatch(cleaned)
	if len(matches) == 2 {
		cleaned = matches[1]
	}
	cleaned = strings.TrimPrefix(cleaned, "```json")
	cleaned = strings.TrimPrefix(cleaned, "```JSON")
	cleaned = strings.TrimPrefix(cleaned, "```")
	cleaned = strings.TrimSuffix(cleaned, "```")
	return []byte(strings.TrimSpace(cleaned))
}

// CallAIWorker makes a POST request to the Python AI microservice
func CallAIWorker(req models.AnalyzeRequest) (models.AnalyzeResponse, []byte, error) {
	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(req).
		Post("http://ai-worker:8000/api/analyze")

	var aiResp models.AnalyzeResponse

	if err != nil {
		return aiResp, nil, fmt.Errorf("failed to call AI worker: %w", err)
	}

	if resp.IsError() {
		return aiResp, nil, fmt.Errorf("AI worker returned error status: %d - %s", resp.StatusCode(), resp.String())
	}

	body := stripMarkdownJSONFence(resp.Body())
	if err := json.Unmarshal(body, &aiResp); err != nil {
		log.Printf("Unmarshal error: %v", err)
		return aiResp, nil, fmt.Errorf("failed to parse AI worker response: %w", err)
	}

	if aiResp.CommitteeDecision == "" && aiResp.DefaultRiskLevel == "" && aiResp.JustificationSummary == "" {
		// Backwards compatibility for older worker responses that nested the memo.
		var wrapped struct {
			CreditCommitteeMemo models.AnalyzeResponse `json:"credit_committee_memo"`
		}
		if err := json.Unmarshal(body, &wrapped); err != nil {
			log.Printf("Unmarshal error: %v", err)
			return aiResp, nil, fmt.Errorf("failed to parse AI worker response wrapper: %w", err)
		}
		if wrapped.CreditCommitteeMemo.CommitteeDecision != "" ||
			wrapped.CreditCommitteeMemo.DefaultRiskLevel != "" ||
			wrapped.CreditCommitteeMemo.JustificationSummary != "" {
			aiResp = wrapped.CreditCommitteeMemo
			// Store the normalized shape so future cache hits do not repeat wrapper parsing.
			body, err = json.Marshal(aiResp)
			if err != nil {
				log.Printf("Marshal error: %v", err)
				return aiResp, nil, fmt.Errorf("failed to normalize AI worker response: %w", err)
			}
		}
	}

	return aiResp, body, nil
}
