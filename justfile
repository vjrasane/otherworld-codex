set dotenv-load

fetch-cards:
    go run ./cmd/fetch

db-migrate:
    dbmate up

db-generate:
    sqlc generate

db-reset:
    dbmate drop
    dbmate up

db-seed:
    go run ./cmd/seed
