"use client";
import { SearchResult } from "@/db/db-client";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import { useRouter } from "next/navigation";
import { stringify } from "querystring";

const useAsyncSearchList = () => {
  return useAsyncList<SearchResult>({
    async load({ signal, filterText }) {
      if (!filterText || filterText.length < 3) return { items: [] };
      try {
        const searchParams = stringify({ query: filterText, limit: 5 });
        const res = await fetch(`/api/search?${searchParams}`, { signal });
        const results: SearchResult[] = await res.json();

        return {
          items: results,
        };
      } catch (error) {
        if (!(error instanceof Error)) return { items: [] };
        if (error.name === "AbortError") return { items: [] };
        console.error(error);
        return { items: [] };
      }
    },
  });
};

export const SearchField = () => {
  const router = useRouter();
  const { filterText, isLoading, items, setFilterText } = useAsyncSearchList();

  const onSelect = (item: SearchResult) => {
    router.push(`/${item.type}/${item.code}`);
  };

  const onSearch = (query: string) => {
    router.push(`/?search=${query}`);
  };

  return (
    <Autocomplete
      className="max-w-xs"
      inputValue={filterText}
      isLoading={isLoading}
      items={items}
      label="Search"
      placeholder="Type to search..."
      menuTrigger="input"
      variant="bordered"
      onInputChange={setFilterText}
      allowsEmptyCollection
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        if (!filterText) return;
        onSearch(filterText);
      }}
      onSelectionChange={(key) => {
        const selectedItem = items.find((item) => item.code === key);
        if (!selectedItem) return;
        onSelect(selectedItem);
      }}
    >
      {(item) => (
        <AutocompleteItem key={item.code} className="capitalize">
          {item.name} {item.type}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};
