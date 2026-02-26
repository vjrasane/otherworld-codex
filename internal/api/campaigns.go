package api

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type campaignResponse struct {
	CampaignCode string             `json:"campaignCode"`
	CampaignName string             `json:"campaignName"`
	ImageURL     *string            `json:"imageUrl"`
	Scenarios    []campaignScenario `json:"scenarios"`
}

type campaignScenario struct {
	ScenarioCode   string  `json:"scenarioCode"`
	ScenarioName   string  `json:"scenarioName"`
	ScenarioPrefix *string `json:"scenarioPrefix"`
	Position       int32   `json:"position"`
	ImageURL       *string `json:"imageUrl"`
}

type campaignListItem struct {
	CampaignCode string  `json:"campaignCode"`
	CampaignName string  `json:"campaignName"`
	ImageURL     *string `json:"imageUrl"`
}

func (h *Handler) listCampaigns(w http.ResponseWriter, r *http.Request) {
	rows, err := h.q.ListCampaigns(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to list campaigns"})
		return
	}

	items := make([]campaignListItem, len(rows))
	for i, row := range rows {
		items[i] = campaignListItem{
			CampaignCode: row.CampaignCode,
			CampaignName: row.CampaignName,
			ImageURL:     textPtr(row.ImageUrl),
		}
	}

	w.Header().Set("Cache-Control", h.cache)
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) getCampaign(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")

	campaign, err := h.q.GetCampaignByCode(r.Context(), code)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "campaign not found"})
		return
	}

	scenarios, err := h.q.GetCampaignScenarios(r.Context(), pgtype.Text{String: code, Valid: true})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load scenarios"})
		return
	}

	resp := campaignResponse{
		CampaignCode: campaign.CampaignCode,
		CampaignName: campaign.CampaignName,
		ImageURL:     textPtr(campaign.ImageUrl),
		Scenarios:    make([]campaignScenario, len(scenarios)),
	}
	for i, s := range scenarios {
		resp.Scenarios[i] = campaignScenario{
			ScenarioCode:   s.ScenarioCode,
			ScenarioName:   s.ScenarioName,
			ScenarioPrefix: textPtr(s.ScenarioPrefix),
			Position:       s.Position,
			ImageURL:       textPtr(s.ImageUrl),
		}
	}

	w.Header().Set("Cache-Control", h.cache)
	writeJSON(w, http.StatusOK, resp)
}
