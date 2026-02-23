import { useState, useCallback } from "react";
import type { QuoteRequest, QuoteResult } from "@/types";
import { calculateDistanceAsync } from "@/lib/distance";
import { getEstimates } from "@/lib/estimation-engine";
import { LOCAL_MOVE_THRESHOLD_MILES } from "@/lib/constants";

interface UseQuotesReturn {
  result: QuoteResult | null;
  isLoading: boolean;
  error: string | null;
  getQuotes: (request: QuoteRequest) => void;
  reset: () => void;
}

export function useQuotes(): UseQuotesReturn {
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuotes = useCallback((request: QuoteRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    setTimeout(async () => {
      try {
        const distanceMiles = await calculateDistanceAsync(
          request.originCity,
          request.destinationCity
        );

        if (distanceMiles === null) {
          setError(
            "Could not calculate distance. Please check that both cities are valid US cities in the format 'City, State'."
          );
          setIsLoading(false);
          return;
        }

        const { quotes, moveEstimate, seasonalMultiplier, seasonLabel, recommendation } =
          getEstimates(request, distanceMiles);
        const isLocalMove = distanceMiles < LOCAL_MOVE_THRESHOLD_MILES;

        setResult({
          request,
          quotes,
          distanceMiles,
          isLocalMove,
          moveEstimate,
          seasonalMultiplier,
          seasonLabel,
          recommendation,
        });
      } catch (e) {
        setError("An error occurred while generating quotes. Please try again.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, getQuotes, reset };
}
