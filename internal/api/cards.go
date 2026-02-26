package api

import (
	"net/http"
)

type cardResponse struct {
	CardCode          string         `json:"cardCode"`
	CardName          string         `json:"cardName"`
	RealName          *string        `json:"realName"`
	TypeCode          string         `json:"typeCode"`
	TypeName          string         `json:"typeName"`
	FactionCode       string         `json:"factionCode"`
	FactionName       string         `json:"factionName"`
	EncounterCode     *string        `json:"encounterCode"`
	EncounterName     *string        `json:"encounterName"`
	EncounterPosition *int32         `json:"encounterPosition"`
	Position          *int32         `json:"position"`
	Text              *string        `json:"text"`
	BackText          *string        `json:"backText"`
	Flavor            *string        `json:"flavor"`
	Traits            []string       `json:"traits"`
	URL               string         `json:"url"`
	ImageSrc          *string        `json:"imageSrc"`
	BackImageSrc      *string        `json:"backImageSrc"`
	BackFlavor        *string        `json:"backFlavor"`
	PackCode          string         `json:"packCode"`
	PackName          string         `json:"packName"`
	Quantity          *int32         `json:"quantity"`
	ImageURL          *string        `json:"imageUrl"`
	Scenarios         []cardScenario `json:"scenarios"`
}

type cardScenario struct {
	ScenarioCode string  `json:"scenarioCode"`
	ScenarioName string  `json:"scenarioName"`
	CampaignCode *string `json:"campaignCode"`
	CampaignName string  `json:"campaignName"`
}

func (h *Handler) getCard(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")

	card, err := h.q.GetCardByCode(r.Context(), code)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "card not found"})
		return
	}

	var scenarios []cardScenario
	if card.EncounterCode.Valid {
		rows, err := h.q.GetCardScenarios(r.Context(), card.EncounterCode.String)
		if err == nil {
			scenarios = make([]cardScenario, len(rows))
			for i, s := range rows {
				scenarios[i] = cardScenario{
					ScenarioCode: s.ScenarioCode,
					ScenarioName: s.ScenarioName,
					CampaignCode: textPtr(s.CampaignCode),
					CampaignName: s.CampaignName,
				}
			}
		}
	}
	if scenarios == nil {
		scenarios = []cardScenario{}
	}

	traits := card.Traits
	if traits == nil {
		traits = []string{}
	}

	resp := cardResponse{
		CardCode:          card.CardCode,
		CardName:          card.CardName,
		RealName:          textPtr(card.RealName),
		TypeCode:          card.TypeCode,
		TypeName:          card.TypeName,
		FactionCode:       card.FactionCode,
		FactionName:       card.FactionName,
		EncounterCode:     textPtr(card.EncounterCode),
		EncounterName:     textPtr(card.EncounterName),
		EncounterPosition: int4Ptr(card.EncounterPosition),
		Position:          int4Ptr(card.Position),
		Text:              textPtr(card.Text),
		BackText:          textPtr(card.BackText),
		Flavor:            textPtr(card.Flavor),
		Traits:            traits,
		URL:               card.Url,
		ImageSrc:          textPtr(card.Imagesrc),
		BackImageSrc:      textPtr(card.Backimagesrc),
		BackFlavor:        textPtr(card.BackFlavor),
		PackCode:          card.PackCode,
		PackName:          card.PackName,
		Quantity:          int4Ptr(card.Quantity),
		ImageURL:          textPtr(card.ImageUrl),
		Scenarios:         scenarios,
	}

	w.Header().Set("Cache-Control", h.cache)
	writeJSON(w, http.StatusOK, resp)
}
