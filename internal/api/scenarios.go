package api

import (
	"net/http"
)

type scenarioResponse struct {
	ScenarioCode   string              `json:"scenarioCode"`
	ScenarioName   string              `json:"scenarioName"`
	ScenarioPrefix *string             `json:"scenarioPrefix"`
	CampaignCode   *string             `json:"campaignCode"`
	Position       int32               `json:"position"`
	ImageURL       *string             `json:"imageUrl"`
	EncounterSets  []scenarioEncounter `json:"encounterSets"`
	Cards          []scenarioCard      `json:"cards"`
}

type scenarioEncounter struct {
	EncounterCode *string `json:"encounterCode"`
	EncounterName *string `json:"encounterName"`
	Position      int32   `json:"position"`
}

type scenarioCard struct {
	CardCode      string   `json:"cardCode"`
	CardName      string   `json:"cardName"`
	TypeCode      string   `json:"typeCode"`
	TypeName      string   `json:"typeName"`
	EncounterCode *string  `json:"encounterCode"`
	Traits        []string `json:"traits"`
	Quantity      *int32   `json:"quantity"`
	ImageURL      *string  `json:"imageUrl"`
	IsHorizontal  bool     `json:"isHorizontal"`
}

func (h *Handler) getScenario(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")

	scenario, err := h.q.GetScenarioByCode(r.Context(), code)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "scenario not found"})
		return
	}

	encounterSets, err := h.q.GetScenarioEncounterSets(r.Context(), code)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load encounter sets"})
		return
	}

	cards, err := h.q.GetScenarioCards(r.Context(), code)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load cards"})
		return
	}

	resp := scenarioResponse{
		ScenarioCode:   scenario.ScenarioCode,
		ScenarioName:   scenario.ScenarioName,
		ScenarioPrefix: textPtr(scenario.ScenarioPrefix),
		CampaignCode:   textPtr(scenario.CampaignCode),
		Position:       scenario.Position,
		ImageURL:       textPtr(scenario.ImageUrl),
		EncounterSets:  make([]scenarioEncounter, len(encounterSets)),
		Cards:          make([]scenarioCard, len(cards)),
	}

	for i, es := range encounterSets {
		resp.EncounterSets[i] = scenarioEncounter{
			EncounterCode: textPtr(es.EncounterCode),
			EncounterName: textPtr(es.EncounterName),
			Position:      es.Position,
		}
	}

	for i, c := range cards {
		traits := c.Traits
		if traits == nil {
			traits = []string{}
		}
		resp.Cards[i] = scenarioCard{
			CardCode:      c.CardCode,
			CardName:      c.CardName,
			TypeCode:      c.TypeCode,
			TypeName:      c.TypeName,
			EncounterCode: textPtr(c.EncounterCode),
			Traits:        traits,
			Quantity:      int4Ptr(c.Quantity),
			ImageURL:      textPtr(c.ImageUrl),
		}
	}

	w.Header().Set("Cache-Control", h.cache)
	writeJSON(w, http.StatusOK, resp)
}
