package handlers

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"hackaton-gateway/internal/models"
	"hackaton-gateway/internal/services"

	"github.com/gofiber/fiber/v2"
)

type cacheEntry struct {
	Response models.AnalyzeResponse
	Expiry   time.Time
}

var (
	analyzeCache = make(map[string]cacheEntry)
	cacheMutex   sync.RWMutex
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

	// Check cache
	cacheMutex.RLock()
	entry, found := analyzeCache[cacheKey]
	cacheMutex.RUnlock()

	if found && time.Now().Before(entry.Expiry) {
		fmt.Printf("\033[32m[Gateway] Cache hit for %v over period '%s'. Returning instantly.\033[0m\n", req.Symbols, req.Period)
		return c.JSON(entry.Response)
	}

	// Mock architectural layer for hackathon flair
	// Terminal glow colors (Cyan)
	fmt.Printf("\033[36m[Gateway] Correlating merchant RF data for %v over period '%s'...\033[0m\n", req.Symbols, req.Period)
	time.Sleep(500 * time.Millisecond) // Slight delay to emphasize the log

	// Call the AI worker
	resp, err := services.CallAIWorker(req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Save to cache with 10-minute TTL
	cacheMutex.Lock()
	analyzeCache[cacheKey] = cacheEntry{
		Response: resp,
		Expiry:   time.Now().Add(10 * time.Minute),
	}
	cacheMutex.Unlock()

	// Return the JSON directly to the frontend
	return c.JSON(resp)
}
