set dotenv-load

fetch-cards:
    go run ./cmd/fetch

db-generate:
    sqlc generate

db-seed:
    go run ./cmd/seed
