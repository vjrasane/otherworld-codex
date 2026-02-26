package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/lib/pq"
	"github.com/ville/otherworld-codex/internal/api"
	db "github.com/ville/otherworld-codex/internal/db"
)

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	conn, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatal("failed to connect for migrations:", err)
	}

	log.Println("running migrations")
	version, _, err := db.RunMigrations(conn)
	if err != nil {
		log.Fatal("failed to run migrations:", err)
	}
	log.Printf("migrations at version %d", version)
	conn.Close()

	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}
	defer pool.Close()

	cacheMaxAge := 86400
	if os.Getenv("ENV") == "development" {
		cacheMaxAge = 5
	}

	queries := db.New(pool)
	handler := api.NewHandler(queries, cacheMaxAge)

	log.Printf("listening on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
