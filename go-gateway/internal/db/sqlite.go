package db

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB() {
	var err error
	// Keep the demo cache local to the gateway container/process.
	dbPath := "analysis_cache.db"

	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open SQLite database: %v", err)
	}

	// The cache stores the exact normalized worker response used by the frontend.
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS analyses (
		ticker TEXT PRIMARY KEY,
		response_json TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	_, err = DB.Exec(createTableQuery)
	if err != nil {
		log.Fatalf("Failed to create analyses table: %v", err)
	}

	log.Println("SQLite database initialized successfully")
}
