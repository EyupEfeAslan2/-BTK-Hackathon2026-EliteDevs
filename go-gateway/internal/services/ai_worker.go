package services

import (
	"fmt"
	"time"

	"hackaton-gateway/internal/models"

	"github.com/go-resty/resty/v2"
)

// client is configured with a 120-second timeout for the multi-agent consensus
var client = resty.New().SetTimeout(120 * time.Second)

// CallAIWorker makes a POST request to the Python AI microservice
func CallAIWorker(req models.AnalyzeRequest) (map[string]interface{}, error) {
	var aiResp models.AnalyzeResponse

	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(req).
		SetResult(&aiResp).
		Post("http://ai-worker:8000/api/analyze")

	if err != nil {
		return nil, fmt.Errorf("failed to call AI worker: %w", err)
	}

	if resp.IsError() {
		return nil, fmt.Errorf("AI worker returned error status: %d - %s", resp.StatusCode(), resp.String())
	}

	return aiResp, nil
}
