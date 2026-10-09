import { useState, useCallback } from "react";
import type { QuoteRequest } from "@/types";

export interface SerializedQuoteRequest {
  originCity: string;
  destinationCity: string;
  moveDate: string;
  deliveryDate?: string;
  homeSize: string;
  furnishingLevel: string;
  storageNeeded: boolean;
  storageMonths?: number;
  cubicFeetOverride?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  request: SerializedQuoteRequest;
  savedAt: string;
}

function serializeRequest(request: QuoteRequest): SerializedQuoteRequest {
  return {
    ...request,
    moveDate: request.moveDate.toISOString(),
    deliveryDate: request.deliveryDate?.toISOString(),
  };
}

export function deserializeRequest(serialized: SerializedQuoteRequest): QuoteRequest {
  return {
    ...serialized,
    moveDate: new Date(serialized.moveDate),
    deliveryDate: serialized.deliveryDate
      ? new Date(serialized.deliveryDate)
      : undefined,
  } as QuoteRequest;
}

const STORAGE_KEY = "saved-searches";

function loadSearches(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSearch[];
  } catch {
    return [];
  }
}

function persistSearches(searches: SavedSearch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

export function useSavedSearches() {
  const [searches, setSearches] = useState<SavedSearch[]>(loadSearches);

  const saveSearch = useCallback((name: string, request: QuoteRequest) => {
    const entry: SavedSearch = {
      id: Date.now().toString(),
      name,
      request: serializeRequest(request),
      savedAt: new Date().toISOString(),
    };
    setSearches((prev) => {
      const next = [entry, ...prev];
      persistSearches(next);
      return next;
    });
  }, []);

  const deleteSearch = useCallback((id: string) => {
    setSearches((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistSearches(next);
      return next;
    });
  }, []);

  return { searches, saveSearch, deleteSearch };
}
