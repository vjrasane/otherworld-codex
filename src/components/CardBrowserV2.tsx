import { QueryClientProvider } from "@tanstack/react-query";
import {
  queryClient,
  QueryOptionsContext,
  type QueryOptionsMap,
} from "../data/query-client";
import { MultiSelect } from "./MultiSelect";
import { SearchField } from "./SearchField";
import { useContext, useState } from "react";
import { Filter, Menu } from "lucide-react";
import { CardGrid } from "./CardGrid";
import { useCachedQuery } from "../hooks";

export const CardBrowser: React.FC = () => {
  const opts = useContext(QueryOptionsContext);
  const cards = useCachedQuery(opts.encounterCards);

  return (
    <div className="relative px-4">
      <Filters />
      <div className="py-4">
        <CardGrid cards={cards ?? []} />
      </div>
    </div>
  );
};

const Filters: React.FC = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  return (
    <div className="sticky top-0 bg-bg-0 flex flex-col gap-3 border-b border-border">
      <button
        onClick={() => setFiltersOpen((open) => !open)}
        className="md:hidden self-end text-text-muted hover:text-text-primary p-4"
      >
        <Filter size={32} />
      </button>
      <div
        className={`${filtersOpen ? "flex" : "hidden"} flex-col gap-3 pt-2 pb-4 md:grid md:grid-cols-3 lg:grid-cols-6`}
      >
        <MultiSelect
          label="Campaigns"
          placeholder="All campaigns"
          options={[]}
          onChange={() => {}}
          value={[]}
        />
        <MultiSelect
          label="Scenarios"
          placeholder="All scenarios"
          options={[]}
          onChange={() => {}}
          value={[]}
        />
        <MultiSelect
          label="Encounter Sets"
          placeholder="All encounter sets"
          options={[]}
          onChange={() => {}}
          value={[]}
        />
        <MultiSelect
          label="Traits"
          placeholder="All traits"
          options={[]}
          onChange={() => {}}
          value={[]}
        />
        <MultiSelect
          label="Types"
          placeholder="All types"
          options={[]}
          onChange={() => {}}
          value={[]}
        />
        <SearchField
          label="Text"
          placeholder="Search card text"
          value=""
          onChange={() => {}}
        />
      </div>
    </div>
  );
};

export default function ({ queryOptions }: { queryOptions: QueryOptionsMap }) {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryOptionsContext.Provider value={queryOptions}>
        <CardBrowser />
      </QueryOptionsContext.Provider>
    </QueryClientProvider>
  );
}
