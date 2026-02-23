import { ExternalLink, AlertTriangle, Info, ShieldAlert, ShieldCheck, ShieldMinus } from "lucide-react";
import type { ProviderQuote, QuoteRequest } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyQuoteButton } from "./copy-quote-button";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  quote: ProviderQuote;
  request: QuoteRequest;
  distanceMiles: number;
}

export function ProviderCard({
  quote,
  request,
  distanceMiles,
}: ProviderCardProps) {
  if (quote.unavailable) {
    return (
      <Card className="flex flex-col border-dashed opacity-75">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <img
              src={`/logos/${quote.provider}.svg`}
              alt={quote.providerName}
              className="size-10 rounded object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <CardTitle className="text-lg">{quote.providerName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center space-y-3 py-8">
          <AlertTriangle className="size-8 text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground">
            {quote.unavailableReason}
          </p>
        </CardContent>
        <CardFooter className="pt-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <a href={quote.bookingUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 size-3" />
              Visit {quote.providerName}
            </a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const weightIcon =
    quote.capacity.weightStatus === "over" ? ShieldAlert :
    quote.capacity.weightStatus === "tight" ? ShieldMinus :
    ShieldCheck;
  const WeightIcon = weightIcon;

  return (
    <Card
      className={cn(
        "flex flex-col transition-shadow hover:shadow-lg",
        quote.isCheapest && "ring-2 ring-green-500 dark:ring-green-400"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <img
              src={`/logos/${quote.provider}.svg`}
              alt={quote.providerName}
              className="size-10 rounded object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <CardTitle className="text-lg">{quote.providerName}</CardTitle>
          </div>
          {quote.isCheapest && (
            <Badge className="bg-green-600 text-white hover:bg-green-700 shrink-0">
              BEST PRICE
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Price Range */}
        <div
          className={cn(
            "rounded-lg p-4 text-center",
            quote.isCheapest
              ? "bg-green-50 dark:bg-green-950/30"
              : "bg-muted/50"
          )}
        >
          <p className="text-sm text-muted-foreground">Estimated Range</p>
          <p
            className={cn(
              "text-2xl font-bold",
              quote.isCheapest && "text-green-600 dark:text-green-400"
            )}
          >
            ${quote.priceRange.low.toLocaleString()} – ${quote.priceRange.high.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Midpoint: ${quote.priceRange.mid.toLocaleString()}
          </p>
          {quote.seasonalMultiplier !== 1.0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              {quote.seasonalMultiplier > 1.0 ? "+" : ""}
              {Math.round((quote.seasonalMultiplier - 1) * 100)}% seasonal adjustment
            </p>
          )}
        </div>

        {/* Container Config */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Containers</span>
            <span className="text-right font-medium">{quote.containerLabel}</span>
          </div>
          {quote.containerConfig.map((cfg, i) => (
            <div key={i} className="flex justify-between text-xs text-muted-foreground">
              <span>{cfg.count} x {cfg.size}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Est. Transit</span>
            <span>{quote.transitDays}</span>
          </div>
        </div>

        {/* Capacity Info */}
        <div className="rounded-md border p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Capacity</span>
            <span>{quote.capacity.totalCubicFeet.toLocaleString()} cu ft</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Buffer</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              +{quote.capacity.bufferPercent}%
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <WeightIcon className={cn(
              "size-3.5",
              quote.capacity.weightStatus === "ok" && "text-green-500",
              quote.capacity.weightStatus === "tight" && "text-amber-500",
              quote.capacity.weightStatus === "over" && "text-red-500",
            )} />
            <span className={cn(
              quote.capacity.weightStatus === "ok" && "text-green-600 dark:text-green-400",
              quote.capacity.weightStatus === "tight" && "text-amber-600 dark:text-amber-400",
              quote.capacity.weightStatus === "over" && "text-red-600 dark:text-red-400",
            )}>
              {quote.capacity.weightMessage}
            </span>
          </div>
        </div>

        {/* Alternative Config (PODS) */}
        {quote.alternativeConfig && (
          <div className="rounded-md border border-dashed p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Alternative option</p>
            <p className="text-sm font-medium">{quote.alternativeConfig.label}</p>
            <p className="text-sm">
              ${quote.alternativeConfig.priceRange.low.toLocaleString()} – ${quote.alternativeConfig.priceRange.high.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {quote.alternativeConfig.capacity.totalCubicFeet.toLocaleString()} cu ft | +{quote.alternativeConfig.capacity.bufferPercent}% buffer
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Price Breakdown</p>
          {quote.breakdown.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className={cn("font-medium", item.amount < 0 && "text-green-600 dark:text-green-400")}>
                {item.amount < 0 ? "\u2212" : ""}${Math.abs(item.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        {/* Notes */}
        {quote.notes.length > 0 && (
          <div className="space-y-1.5">
            {quote.notes.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <Info className="mt-0.5 size-3 shrink-0" />
                {note}
              </div>
            ))}
          </div>
        )}

        {/* Includes */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Includes</p>
          <ul className="space-y-1">
            {quote.includes.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="mt-0.5 text-green-500">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <a
            href={quote.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-1 size-3" />
            Get Exact Quote
          </a>
        </Button>
        <CopyQuoteButton
          quote={quote}
          request={request}
          distanceMiles={distanceMiles}
        />
      </CardFooter>
    </Card>
  );
}
