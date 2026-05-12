package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"sort"
	"strings"
	"time"

	"hackaton-gateway/internal/db"
	"hackaton-gateway/internal/models"
	"hackaton-gateway/internal/services"

	"github.com/gofiber/fiber/v2"
)

// generateCacheKey creates a consistent key for given symbols and period
func generateCacheKey(symbols []string, period string) string {
	sortedSymbols := make([]string, len(symbols))
	copy(sortedSymbols, symbols)
	sort.Strings(sortedSymbols)

	return fmt.Sprintf("%s|%s", strings.Join(sortedSymbols, ","), period)
}

// HandleAnalyze handles the incoming API request
func HandleAnalyze(c *fiber.Ctx) error {
	var req models.AnalyzeRequest

	// Parse incoming JSON body
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	cacheKey := generateCacheKey(req.Symbols, req.Period)

	// Check SQLite cache
	var responseJSON string
	var createdAt time.Time

	err := db.DB.QueryRow("SELECT response_json, created_at FROM analyses WHERE ticker = ?", cacheKey).Scan(&responseJSON, &createdAt)

	if err == nil {
		// Record exists, check if it is less than 24 hours old
		if time.Since(createdAt) < 24*time.Hour {
			fmt.Printf("\033[32m[Gateway] Cache hit for %v over period '%s'. Returning instantly.\033[0m\n", req.Symbols, req.Period)

			var responseData models.AnalyzeResponse
			if err := json.Unmarshal([]byte(responseJSON), &responseData); err == nil {
				c.Set(fiber.HeaderContentType, fiber.MIMEApplicationJSONCharsetUTF8)
				return c.SendString(responseJSON)
			} else {
				log.Printf("Unmarshal error: %v", err)
			}
			// If unmarshaling fails, proceed to call AI worker
		}
	} else if err != sql.ErrNoRows {
		// Log error but proceed to fetch from AI worker
		fmt.Printf("Error querying cache: %v\n", err)
	}

	// Mock architectural layer for hackathon flair
	// Terminal glow colors (Cyan)
	fmt.Printf("\033[36m[Gateway] Correlating merchant RF data for %v over period '%s'...\033[0m\n", req.Symbols, req.Period)
	time.Sleep(500 * time.Millisecond) // Slight delay to emphasize the log

	// Call the AI worker
	resp, rawResp, err := services.CallAIWorker(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	_, dbErr := db.DB.Exec(
		"REPLACE INTO analyses (ticker, response_json, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
		cacheKey, string(rawResp),
	)
	if dbErr != nil {
		fmt.Printf("Error saving to cache: %v\n", dbErr)
	}

	// Return the JSON directly to the frontend
	return c.JSON(resp)
}
