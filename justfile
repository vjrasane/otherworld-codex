set dotenv-load

fetch-cards:
    curl -sL https://arkhamdb.com/api/public/cards/?encounter=1 | jq '.' > data/cards.json

fetch-images: 
    ./scripts/fetch-images.sh

build:
    npx astro build

dev:
    npx astro dev
