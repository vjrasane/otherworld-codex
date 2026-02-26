package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	db "github.com/ville/otherworld-codex/internal/db"
)

type Handler struct {
	q     *db.Queries
	cache string
}

func NewHandler(q *db.Queries, cacheMaxAge int) http.Handler {
	h := &Handler{
		q:     q,
		cache: fmt.Sprintf("public, max-age=%d", cacheMaxAge),
	}
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/search", h.search)
	mux.HandleFunc("GET /api/campaigns", h.listCampaigns)
	mux.HandleFunc("GET /api/campaigns/{code}", h.getCampaign)
	mux.HandleFunc("GET /api/scenarios/{code}", h.getScenario)
	mux.HandleFunc("GET /api/encounters/{code}", h.getEncounterSet)
	mux.HandleFunc("GET /api/cards/{code}", h.getCard)

	return cors(mux)
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func textPtr(t pgtype.Text) *string {
	if !t.Valid {
		return nil
	}
	return &t.String
}

func int4Ptr(i pgtype.Int4) *int32 {
	if !i.Valid {
		return nil
	}
	return &i.Int32
}
