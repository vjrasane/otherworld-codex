import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const searchQuery = `-- name: Search :many
SELECT
    type,
    code,
    name,
    image_url
FROM search_view
WHERE full_text_search @@ to_tsquery('english', $1)
ORDER BY ts_rank(full_text_search, to_tsquery('english', $1)) DESC
LIMIT $2`;

export interface SearchArgs {
    toTsquery: string;
    limit: string;
}

export interface SearchRow {
    type: string;
    code: string;
    name: string;
    imageUrl: string | null;
}

export async function search(client: Client, args: SearchArgs): Promise<SearchRow[]> {
    const result = await client.query({
        text: searchQuery,
        values: [args.toTsquery, args.limit],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            type: row[0],
            code: row[1],
            name: row[2],
            imageUrl: row[3]
        };
    });
}

