"use client";

import { useCallback, useEffect, useState } from "react";
import type { StoreProfile } from "./types";

const STORAGE_KEY = "everytable:activeStoreId";

function readStoredId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Ignore storage failures (private browsing, etc.) — the app still
    // works for the current page load, it just won't remember next time.
  }
}

export function useActiveStore() {
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores");
      const data = await res.json();
      const fetchedStores: StoreProfile[] = data.stores ?? [];
      setStores(fetchedStores);

      const stored = readStoredId();
      const validStored = fetchedStores.find((s) => s.id === stored);
      setActiveStoreIdState(validStored ? stored : fetchedStores[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStores();
  }, [refreshStores]);

  const setActiveStoreId = useCallback((id: string) => {
    writeStoredId(id);
    setActiveStoreIdState(id);
  }, []);

  const activeStore = stores.find((s) => s.id === activeStoreId) ?? null;

  return { stores, activeStore, activeStoreId, setActiveStoreId, loading, refreshStores };
}
