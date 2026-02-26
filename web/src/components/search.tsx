import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { SearchIcon } from "lucide-react";
import { api } from "@/utils/api";
import { CardImage } from "@/components/card-image";
import css from "./search.module.css";

function useDebouncedValue<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

function typeHref(type: string, code: string) {
  switch (type) {
    case "card":
      return `/cards/${code}`;
    case "campaign":
      return `/campaigns/${code}`;
    case "scenario":
      return `/scenarios/${code}`;
    case "encounter":
      return `/encounters/${code}`;
    default:
      return `/cards/${code}`;
  }
}

export function Search() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query);
  const containerRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  const { data: results } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => api.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  useEffect(() => {
    setQuery("");
    setOpen(false);
  }, [location]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const showResults = open && debouncedQuery.length >= 2 && results;

  return (
    <div className={css.container} ref={containerRef}>
      <label className={css.searchBox}>
        <SearchIcon size={16} />
        <input
          className={css.input}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </label>

      {showResults && (
        <ul className={css.results}>
          {results.length === 0 ? (
            <li className={css.empty}>No results found.</li>
          ) : (
            results.map((r) => (
              <li key={`${r.type}-${r.code}`}>
                <Link href={typeHref(r.type, r.code)} className={css.result}>
                  {r.imageUrl && r.cardTypeCode && (
                    <CardImage
                      src={r.imageUrl}
                      alt=""
                      typeCode={r.cardTypeCode}
                      className={css.thumb}
                    />
                  )}
                  <div className={css.resultInfo}>
                    <span className={css.resultName}>{r.name}</span>
                    <span className={css.resultType}>
                      {r.type}
                      {r.packName && ` · ${r.packName}`}
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
