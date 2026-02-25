package api

import (
	"net/http"
	"strconv"
	"strings"

	db "github.com/ville/otherworld-codex/internal/db"
)

type searchResult struct {
	Type     string  `json:"type"`
	Code     string  `json:"code"`
	Name     string  `json:"name"`
	ImageURL *string `json:"imageUrl"`
}

func (h *Handler) search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "q parameter is required"})
		return
	}

	limit := int32(20)
	if l := r.URL.Query().Get("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 100 {
			limit = int32(n)
		}
	}

	tsquery := strings.Join(strings.Fields(q), " & ")

	rows, err := h.q.Search(r.Context(), db.SearchParams{
		ToTsquery: tsquery,
		Limit:     limit,
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "search failed"})
		return
	}

	results := make([]searchResult, len(rows))
	for i, row := range rows {
		results[i] = searchResult{
			Type:     row.Type,
			Code:     row.Code,
			Name:     row.Name,
			ImageURL: textPtr(row.ImageUrl),
		}
	}

	w.Header().Set("Cache-Control", "public, max-age=60")
	writeJSON(w, http.StatusOK, results)
}
