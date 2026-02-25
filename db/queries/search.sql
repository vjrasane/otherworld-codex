-- name: Search :many
SELECT
    type,
    code,
    name,
    image_url
FROM search_view
WHERE full_text_search @@ to_tsquery('english', $1)
ORDER BY ts_rank(full_text_search, to_tsquery('english', $1)) DESC
LIMIT $2;
