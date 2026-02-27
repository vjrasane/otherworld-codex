import React, { useState, useEffect, useRef, useMemo, type PropsWithChildren } from "react";
import MiniSearch, { type SearchResult } from "minisearch";
import { getCard, type SearchEntry } from "@/src/data";
import { Search as SearchIcon, X } from "lucide-react";
import { routes } from "@/src/routes";
import type { Card } from "../data/card";
import { capitalize, compact } from "lodash-es";

const HORIZONTAL_TYPES = new Set(["act", "agenda", "investigator"]);
const ICON_FILTER =
  "invert(73%) sepia(15%) saturate(497%) hue-rotate(169deg) brightness(95%) contrast(88%)";

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [active, setActive] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 200);

  const miniSearch = useMemo(() => {
    if (entries.length === 0) return null;
    const ms = new MiniSearch<SearchEntry>({
      fields: ["name"],
      storeFields: [
        "type",
        "code",
        "name",
        "packName",
        "campaignName"
      ],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
      },
    });
    ms.addAll(entries);
    return ms;
  }, [entries]);

  useEffect(() => {
    fetch(routes.searchIndex)
      .then((r) => r.json())
      .then(setEntries);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const results = useMemo(() => {
    if (!miniSearch || !debouncedQuery.trim()) return [];
    return miniSearch.search(debouncedQuery).slice(0, 20);
  }, [miniSearch, debouncedQuery]);

  useEffect(() => {
    setActive(-1);
  }, [results]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      window.location.href = href(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function href(result: Record<string, string>) {
    switch (result.type) {
      case "campaign":
        return routes.campaign(result.code);
      case "scenario":
        return routes.scenario(result.code);
      case "encounter":
        return routes.encounter(result.code);
      default:
        return routes.card(result.code);
    }
  }

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 600 }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "var(--bg-2)",
          borderRadius: 6,
          padding: "0.4rem 0.6rem",
          border: "1px solid var(--border)",
          cursor: "text",
        }}
      >
        <SearchIcon size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          style={{
            background: "none",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            font: "inherit",
            width: "100%",
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 0,
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        )}
      </label>

      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--bg-1)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            maxHeight: 400,
            overflowY: "auto",
            zIndex: 200,
          }}
        >
          {results.map((res, i) => {
            return (
              <a
                key={res.id}
                href={href(res)}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                onMouseEnter={() => setActive(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 0.75rem",
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--border)",
                  background: i === active ? "var(--bg-2)" : undefined,
                }}
              >
                <SearchResultItem result={res} />
              </a>
            )
          })}
        </div>
      )}
    </div>
  );
}

const SearchResultText: React.FC<{ title: string, subtitle: string }> = ({ title, subtitle }) => {
  return <div style={{ minWidth: 0 }}>
    <div
      style={{
        fontWeight: 500,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {title}

    </div>
    <div
      style={{
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {subtitle}
    </div>
  </div>

}

const SearchResultItem: React.FC<{ result: SearchResult }> = ({ result }) => {
  const { type, code } = result
  switch (type) {
    case "card": {
      const card = getCard(code)
      if (!card) return null
      return <CardSearchResultItem card={card} />
    }

    default: {
      return <IconSearchResultItem result={result} />
    }
  }
}

const IconSearchResultItem: React.FC<{ result: SearchResult }> = ({ result }) => {
  const { type, code, name, packName, campaignName } = result
  const subtitle = compact([capitalize(type), packName && `· ${packName}`, campaignName && `· ${campaignName}`]).join(" ")
  return <>
    <img
      src={routes.icon(code)}
      alt=""
      style={{
        width: 28,
        height: 28,
        flexShrink: 0,
        filter: ICON_FILTER,
      }}
    />
    <SearchResultText title={name} subtitle={subtitle} />
  </>
}


const CardSearchResultItem: React.FC<{ card: Card }> = ({
  card
}) => {
  const { name, xp, subname, packName } = card
  const title = compact([name, xp && `(${xp})`, subname && `· ${subname}`]).join(" ")
  const subtitle = compact(["Card", packName && `· ${packName}`]).join(" ")
  return <>
    <CardSearchResultImage card={card} />
    <SearchResultText title={title} subtitle={subtitle} />
  </>
}


const CardSearchResultImage: React.FC<{ card: Card }> = ({
  card
}) => {
  if (card.imageUrl) {
    return (
      <div
        style={{
          width: 40,
          height: HORIZONTAL_TYPES.has(card.typeCode ?? "") ? 28 : 56,
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        <img
          src={card.imageUrl}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: 3,
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: 40,
        height: 56,
        flexShrink: 0,
        background: "var(--bg-3)",
        borderRadius: 3,
      }}
    />
  )

}
