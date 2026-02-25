package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

const cardsURL = "https://arkhamdb.com/api/public/cards?encounter=1"

func main() {
	resp, err := http.Get(cardsURL)
	if err != nil {
		log.Fatal("failed to fetch cards:", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("unexpected status: %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal("failed to read response:", err)
	}

	var raw []json.RawMessage
	if err := json.Unmarshal(body, &raw); err != nil {
		log.Fatal("failed to parse JSON:", err)
	}

	out, err := json.MarshalIndent(raw, "", "  ")
	if err != nil {
		log.Fatal("failed to marshal JSON:", err)
	}

	outPath := filepath.Join("data", "cards.json")
	if err := os.MkdirAll(filepath.Dir(outPath), 0o755); err != nil {
		log.Fatal("failed to create directory:", err)
	}

	if err := os.WriteFile(outPath, out, 0o644); err != nil {
		log.Fatal("failed to write file:", err)
	}

	fmt.Printf("wrote %d cards to %s\n", len(raw), outPath)
}
