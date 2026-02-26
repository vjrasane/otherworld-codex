-- name: Search :many
SELECT
    type,
    code,
    name,
    image_url,
    type_code,
    pack_name
FROM search_view
WHERE word_similarity($1, name) > 0.3
ORDER BY word_similarity($1, name) DESC, name ASC
LIMIT $2;
