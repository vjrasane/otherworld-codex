package api

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type encounterSetResponse struct {
	EncounterCode string                 `json:"encounterCode"`
	EncounterName string                 `json:"encounterName"`
	ImageURL      *string                `json:"imageUrl"`
	Scenarios     []encounterSetScenario `json:"scenarios"`
	Cards         []encounterSetCard     `json:"cards"`
}

type encounterSetScenario struct {
	ScenarioCode string  `json:"scenarioCode"`
	ScenarioName string  `json:"scenarioName"`
	CampaignCode *string `json:"campaignCode"`
	CampaignName string  `json:"campaignName"`
}

type encounterSetCard struct {
	CardCode string   `json:"cardCode"`
	CardName string   `json:"cardName"`
	TypeCode string   `json:"typeCode"`
	TypeName string   `json:"typeName"`
	Traits   []string `json:"traits"`
	Quantity *int32   `json:"quantity"`
	ImageURL *string  `json:"imageUrl"`
}

func (h *Handler) getEncounterSet(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")
	pgCode := pgtype.Text{String: code, Valid: true}

	es, err := h.q.GetEncounterSetByCode(r.Context(), pgCode)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "encounter set not found"})
		return
	}

	scenarios, err := h.q.GetEncounterSetScenarios(r.Context(), code)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load scenarios"})
		return
	}

	cards, err := h.q.GetEncounterSetCards(r.Context(), pgCode)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load cards"})
		return
	}

	resp := encounterSetResponse{
		EncounterCode: es.EncounterCode.String,
		EncounterName: es.EncounterName.String,
		ImageURL:      textPtr(es.ImageUrl),
		Scenarios:     make([]encounterSetScenario, len(scenarios)),
		Cards:         make([]encounterSetCard, len(cards)),
	}

	for i, s := range scenarios {
		resp.Scenarios[i] = encounterSetScenario{
			ScenarioCode: s.ScenarioCode,
			ScenarioName: s.ScenarioName,
			CampaignCode: textPtr(s.CampaignCode),
			CampaignName: s.CampaignName,
		}
	}

	for i, c := range cards {
		traits := c.Traits
		if traits == nil {
			traits = []string{}
		}
		resp.Cards[i] = encounterSetCard{
			CardCode: c.CardCode,
			CardName: c.CardName,
			TypeCode: c.TypeCode,
			TypeName: c.TypeName,
			Traits:   traits,
			Quantity: int4Ptr(c.Quantity),
			ImageURL: textPtr(c.ImageUrl),
		}
	}

	w.Header().Set("Cache-Control", h.cache)
	writeJSON(w, http.StatusOK, resp)
}
