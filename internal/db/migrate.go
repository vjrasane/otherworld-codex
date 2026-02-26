package db

import (
	"database/sql"
	"embed"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed migrations
var migrationsFS embed.FS

func RunMigrations(conn *sql.DB) (uint, bool, error) {
	sourceDriver, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		return 0, false, fmt.Errorf("creating migration source: %w", err)
	}

	dbDriver, err := postgres.WithInstance(conn, &postgres.Config{})
	if err != nil {
		return 0, false, fmt.Errorf("creating database driver: %w", err)
	}

	m, err := migrate.NewWithInstance("iofs", sourceDriver, "postgres", dbDriver)
	if err != nil {
		return 0, false, fmt.Errorf("creating migrate instance: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return 0, false, fmt.Errorf("running migrations: %w", err)
	}

	version, dirty, err := m.Version()
	if err != nil {
		return version, dirty, fmt.Errorf("getting migration version: %w", err)
	}

	return version, dirty, nil
}
