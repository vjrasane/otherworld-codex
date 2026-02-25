package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ville/otherworld-codex/internal/db"
)

type arkhamDBCard struct {
	Code              string  `json:"code"`
	Name              string  `json:"name"`
	RealName          *string `json:"real_name"`
	TypeCode          string  `json:"type_code"`
	TypeName          string  `json:"type_name"`
	FactionCode       string  `json:"faction_code"`
	FactionName       string  `json:"faction_name"`
	EncounterCode     *string `json:"encounter_code"`
	EncounterName     *string `json:"encounter_name"`
	EncounterPosition *int32  `json:"encounter_position"`
	Position          *int32  `json:"position"`
	Text              *string `json:"text"`
	BackText          *string `json:"back_text"`
	Flavor            *string `json:"flavor"`
	Traits            *string `json:"traits"`
	URL               string  `json:"url"`
	ImageSrc          *string `json:"imagesrc"`
	BackImageSrc      *string `json:"backimagesrc"`
	BackFlavor        *string `json:"back_flavor"`
	PackCode          *string `json:"pack_code"`
	PackName          *string `json:"pack_name"`
	Quantity          *int32  `json:"quantity"`
}

type scenario struct {
	ScenarioCode   string   `json:"scenarioCode"`
	ScenarioName   string   `json:"scenarioName"`
	ScenarioPrefix *string  `json:"scenarioPrefix"`
	EncounterCodes []string `json:"encounterCodes"`
}

type campaign struct {
	CampaignCode string     `json:"campaignCode"`
	CampaignName string     `json:"campaignName"`
	Scenarios    []scenario `json:"scenarios"`
}

func parseTraits(raw *string) []string {
	if raw == nil || *raw == "" {
		return []string{}
	}
	var traits []string
	for _, t := range strings.Split(*raw, ".") {
		t = strings.TrimSpace(t)
		if t != "" {
			traits = append(traits, t)
		}
	}
	return traits
}

func textVal(s *string) pgtype.Text {
	if s == nil {
		return pgtype.Text{}
	}
	return pgtype.Text{String: *s, Valid: true}
}

func int4Val(i *int32) pgtype.Int4 {
	if i == nil {
		return pgtype.Int4{}
	}
	return pgtype.Int4{Int32: *i, Valid: true}
}

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}
	defer pool.Close()

	queries := db.New(pool)

	if err := seedCards(ctx, queries); err != nil {
		log.Fatal("failed to seed cards:", err)
	}

	if err := seedCampaigns(ctx, queries); err != nil {
		log.Fatal("failed to seed campaigns:", err)
	}

	fmt.Println("done")
}

func seedCards(ctx context.Context, q *db.Queries) error {
	data, err := os.ReadFile("data/cards.json")
	if err != nil {
		return fmt.Errorf("reading cards.json: %w", err)
	}

	var cards []arkhamDBCard
	if err := json.Unmarshal(data, &cards); err != nil {
		return fmt.Errorf("parsing cards.json: %w", err)
	}

	for _, c := range cards {
		if c.PackCode == nil {
			continue
		}
		packName := *c.PackCode
		if c.PackName != nil {
			packName = *c.PackName
		}
		rawData, _ := json.Marshal(c)

		if err := q.UpsertCard(ctx, db.UpsertCardParams{
			CardCode:          c.Code,
			CardName:          c.Name,
			RealName:          textVal(c.RealName),
			TypeCode:          c.TypeCode,
			TypeName:          c.TypeName,
			FactionCode:       c.FactionCode,
			FactionName:       c.FactionName,
			EncounterCode:     textVal(c.EncounterCode),
			EncounterName:     textVal(c.EncounterName),
			EncounterPosition: int4Val(c.EncounterPosition),
			Position:          int4Val(c.Position),
			Text:              textVal(c.Text),
			BackText:          textVal(c.BackText),
			Flavor:            textVal(c.Flavor),
			Traits:            parseTraits(c.Traits),
			Url:               c.URL,
			Imagesrc:          textVal(c.ImageSrc),
			Backimagesrc:      textVal(c.BackImageSrc),
			BackFlavor:        textVal(c.BackFlavor),
			RawData:           rawData,
			PackCode:          *c.PackCode,
			PackName:          packName,
			Quantity:          int4Val(c.Quantity),
		}); err != nil {
			return fmt.Errorf("upserting card %s: %w", c.Code, err)
		}
	}

	fmt.Printf("seeded %d cards\n", len(cards))
	return nil
}

func seedCampaigns(ctx context.Context, q *db.Queries) error {
	data, err := os.ReadFile("data/campaigns.json")
	if err != nil {
		return fmt.Errorf("reading campaigns.json: %w", err)
	}

	var campaigns []campaign
	if err := json.Unmarshal(data, &campaigns); err != nil {
		return fmt.Errorf("parsing campaigns.json: %w", err)
	}

	for _, c := range campaigns {
		if err := q.UpsertCampaign(ctx, db.UpsertCampaignParams{
			CampaignCode: c.CampaignCode,
			CampaignName: c.CampaignName,
		}); err != nil {
			return fmt.Errorf("upserting campaign %s: %w", c.CampaignCode, err)
		}

		for i, s := range c.Scenarios {
			if err := q.UpsertScenario(ctx, db.UpsertScenarioParams{
				ScenarioCode:   s.ScenarioCode,
				ScenarioName:   s.ScenarioName,
				ScenarioPrefix: textVal(s.ScenarioPrefix),
				CampaignCode: pgtype.Text{String: c.CampaignCode, Valid: true},
				Position:       int32(i + 1),
			}); err != nil {
				return fmt.Errorf("upserting scenario %s: %w", s.ScenarioCode, err)
			}

			for j, ec := range s.EncounterCodes {
				if err := q.UpsertEncounterSetScenario(ctx, db.UpsertEncounterSetScenarioParams{
					EncounterCode: ec,
					ScenarioCode:  s.ScenarioCode,
					Position:      int32(j + 1),
				}); err != nil {
					return fmt.Errorf("upserting encounter set %s -> %s: %w", ec, s.ScenarioCode, err)
				}
			}
		}
	}

	fmt.Printf("seeded %d campaigns\n", len(campaigns))
	return nil
}
