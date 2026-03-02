import { kebabCase } from "lodash-es";
import { useEffect, useState } from "react";
import { SITE_TITLE } from "./config";

const cache: Record<string, any> = {};

export function useCachedData<T>(route: string, hash: string): T | null {
  const cacheKey = [kebabCase(SITE_TITLE), route, hash].join(":");

  const [data, setData] = useState<T | null>((cache[cacheKey] as T) ?? null);

  const fetchData = async () => {
    const res = await fetch(route);
    const data = await res.json();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    cache[cacheKey] = data;
    setData(data);
  };

  const getCached = (): T | null => {
    let cached = cache[cacheKey];
    if (cached) return cached;
    cached = localStorage.getItem(cacheKey);
    if (cached) JSON.parse(cached);
    return null;
  };

  useEffect(() => {
    const cached = getCached();
    if (!cached) fetchData();
    else setData(cached);
  }, []);

  return data;
}
