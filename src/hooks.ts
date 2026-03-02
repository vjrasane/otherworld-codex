import { kebabCase } from "lodash-es";
import { useEffect, useState } from "react";
import { SITE_TITLE } from "./config";

const cache: Record<string, any> = {};

export function useCachedData<T>(route: string, hash: string): T | null {
  const prefix = [kebabCase(SITE_TITLE), route].join(":");
  const cacheKey = [prefix, hash].join(":");

  const [data, setData] = useState<T | null>((cache[cacheKey] as T) ?? null);

  const fetchData = async () => {
    const res = await fetch(route);
    const data = await res.json();
    clearStaleCache(prefix);
    localStorage.setItem(cacheKey, JSON.stringify(data));
    cache[cacheKey] = data;
    setData(data);
  };

  const getCached = (): T | null => {
    let cached = cache[cacheKey];
    if (cached) return cached;
    cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    return null;
  };

  useEffect(() => {
    const cached = getCached();
    if (!cached) fetchData();
    else setData(cached);
  }, []);

  return data;
}

function clearStaleCache(prefix: string) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) localStorage.removeItem(key);
  }
}
