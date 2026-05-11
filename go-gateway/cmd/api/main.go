package main

import (
	"fmt"
	"log"

	"hackaton-gateway/internal/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	// Setup the Fiber app
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true, // Disable default to show our cool banner
	})

	// Add CORS middleware (allow all for hackathon)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Mount a POST route
	app.Post("/api/v1/analyze", handlers.HandleAnalyze)

	// ASCII Banner for EliteDevs AI Gateway
	banner := `
  ______ _ _ _       _____                 
 |  ____| (_) |     |  __ \                
 | |__  | |_| |_ ___| |  | | _____   _____ 
 |  __| | | | __/ _ \ |  | |/ _ \ \ / / __|
 | |____| | | ||  __/ |__| |  __/\ V /\__ \
 |______|_|_|\__\___|_____/ \___| \_/ |___/
                                           
        :: AI Gateway is Live ::           
`
	// Print in magenta
	fmt.Printf("\033[35m%s\033[0m\n", banner)
	// Print in green
	fmt.Printf("\033[32m[+] Starting multi-agent consensus proxy on port 3030...\033[0m\n")

	// Start the server on port 3030
	log.Fatal(app.Listen(":3030"))
}
