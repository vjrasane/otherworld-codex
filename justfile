set dotenv-load

fetch-cards:
    curl -sL https://arkhamdb.com/api/public/cards/?encounter=1 | jq '.' > data/cards.json

build:
    npx astro build

dev:
    npx astro dev
