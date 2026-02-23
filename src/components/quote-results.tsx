import { format } from "date-fns";
import { MapPin, Calendar, Ruler, Package, Weight, TrendingUp, Home, Lightbulb } from "lucide-react";
import type { QuoteResult } from "@/types";
import { PRICING_LAST_UPDATED } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProviderCard } from "./provider-card";

interface QuoteResultsProps {
  result: QuoteResult | null;
  isLoading: boolean;
  error: string | null;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[500px] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function QuoteResults({ result, isLoading, error }: QuoteResultsProps) {
  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5 p-6 text-center">
        <p className="font-medium text-destructive">{error}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please verify your city names and try again.
        </p>
      </Card>
    );
  }

  if (!result) return null;

  const { request, quotes, distanceMiles, isLocalMove, moveEstimate, seasonalMultiplier, seasonLabel, recommendation } = result;

  return (
    <div className="space-y-6">
      {/* Route Summary Bar */}
      <Card className="bg-muted/50 p-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="font-medium">{request.originCity}</span>
            <span className="text-muted-foreground">&rarr;</span>
            <span className="font-medium">{request.destinationCity}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="size-4 text-muted-foreground" />
            <span>~{distanceMiles.toLocaleString()} miles</span>
            {isLocalMove && (
              <Badge variant="secondary" className="text-xs">
                Local Move
              </Badge>
            )}
          </div>
          {request.moveDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 text-muted-foreground" />
              <span>{format(request.moveDate, "MMM d, yyyy")}</span>
            </div>
          )}
          {seasonalMultiplier !== 1.0 && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-muted-foreground" />
              <Badge
                variant="secondary"
                className={
                  seasonalMultiplier > 1.0
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                    : "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300"
                }
              >
                {seasonLabel} ({seasonalMultiplier > 1.0 ? "+" : ""}{Math.round((seasonalMultiplier - 1) * 100)}%)
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Move Estimate Summary */}
      <Card className="bg-muted/30 p-4">
        <div className="flex items-start gap-2">
          <Home className="mt-0.5 size-4 text-muted-foreground shrink-0" />
          <div className="space-y-1 text-sm">
            <p className="font-medium">
              {moveEstimate.homeSizeLabel} — {moveEstimate.furnishingLabel} Furnishings
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Package className="size-3.5" />
                <strong>{moveEstimate.cubicFeet.toLocaleString()}</strong> cu ft
              </span>
              <span className="flex items-center gap-1">
                <Weight className="size-3.5" />
                <strong>{moveEstimate.weightLbs.toLocaleString()}</strong> lbs
              </span>
              <span>~{moveEstimate.rooms} rooms</span>
            </div>
            <p className="text-xs text-muted-foreground">{moveEstimate.typicalItems}</p>
          </div>
        </div>
      </Card>

      {/* Recommendation */}
      {recommendation && (
        <Card className="border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 size-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">{recommendation}</p>
          </div>
        </Card>
      )}

      {/* Provider Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {quotes.map((quote) => (
          <ProviderCard
            key={quote.provider}
            quote={quote}
            request={request}
            distanceMiles={distanceMiles}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="space-y-1 text-center text-xs text-muted-foreground">
        <p>
          Prices are estimates based on industry data (last updated: {PRICING_LAST_UPDATED}).
          Get exact quotes at each provider's website.
          Actual pricing depends on exact addresses, availability, current promotions, and seasonal demand.
        </p>
        <Separator className="mx-auto max-w-xs" />
        <p>
          Get exact quotes:
          {" "}<a href="https://www.uhaul.com/UBox/" target="_blank" rel="noopener noreferrer" className="underline">U-Box</a>
          {" · "}<a href="https://www.pods.com/moving-services" target="_blank" rel="noopener noreferrer" className="underline">PODS</a> (or call 877-350-7637)
          {" · "}<a href="https://www.upack.com/quote" target="_blank" rel="noopener noreferrer" className="underline">U-Pack</a>
        </p>
      </div>
    </div>
  );
}
