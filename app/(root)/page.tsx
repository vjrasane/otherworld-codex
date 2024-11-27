import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { FunctionComponent } from "react";

import { search, SearchResult } from "@/db/db-client";
import { Page } from "@/lib/pagination";
import Link from "next/link";

const getSearchResults = async (
  searchTerm: string | undefined,
  { page, size }: Page
): Promise<SearchResult[]> => {
  if (!searchTerm) {
    return [];
  }
  return search(searchTerm ?? "");
};

const SearchResultCard: FunctionComponent<{
  result: SearchResult;
}> = async ({ result }) => {

  const imageUrl = result.imagesrc
    ? "https://arkhamdb.com" + result.imagesrc
    : "";
  return (
    <Card className="flex flex-col cursor-pointer hover:bg-secondary/75 transition-colors">
      <Link href={`/card/${result.code}`}>
        <CardHeader>
          <CardTitle>{result.name}</CardTitle>
          {/* <CardDescription>{result.description}</CardDescription> */}
        </CardHeader>
        <CardContent>
          <AspectRatio ratio={16 / 9}>
            <Image
              className="rounded-md object-cover"
              src={imageUrl}
              alt={result.name}
              fill
            />
          </AspectRatio>
        </CardContent>
      </Link>
    </Card>
  );
};

const SearchResultsGrid: FunctionComponent<{
  results: SearchResult[];
}> = async ({ results }) => {
  return (
    <div className="grid grid-cols-1 min-[500px]:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {results.map((c) => (
        <SearchResultCard key={c.id} result={c} />
      ))}
    </div>
  );
};

const SearchPage: FunctionComponent<{
  searchParams: Promise<{
    search: string | undefined;
    page: number | undefined;
  }>;
}> = async ({ searchParams }) => {
  const { search, page } = await searchParams;
  const results = await getSearchResults(search, { page: page ?? 0, size: 20 });

  return (
    <div className="h-full w-full p-2  mx-auto">
      <SearchResultsGrid results={results} />
    </div>
  );
};

export default SearchPage;
