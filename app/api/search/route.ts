import { search } from "@/db/db-client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SearchParams = z.object({
    query: z.string(),
    limit: z.coerce.number().max(10).default(5),
});
type SearchParams = z.infer<typeof SearchParams>;

export const GET = async (req: NextRequest) => {
    try {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams)
        const result = SearchParams.safeParse(searchParams);
        if (!result.success) {
            console.log(result.error);
            return new NextResponse("Bad request", { status: 400 });
        }
        const { query, limit } = result.data;
        const searchResult = await search(query, limit);
        return NextResponse.json(searchResult);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err }, { status: 500 });
    }
};