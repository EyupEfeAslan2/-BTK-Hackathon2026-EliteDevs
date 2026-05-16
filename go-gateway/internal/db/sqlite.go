package db

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB() {
	var err error
	// Create database in the current working directory, or a specific path
	// Assuming running from go-gateway root
	dbPath := "analysis_cache.db"

	// Ensure the directory exists if we decide to place it elsewhere, but we'll use root
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open SQLite database: %v", err)
	}

	// Create table if not exists
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
