import type { ProviderQuote, QuoteRequest } from "@/types";

export function formatQuoteText(
  quote: ProviderQuote,
  request: QuoteRequest,
  distanceMiles: number
): string {
  const customerLine = request.customerName
    ? `Hi ${request.customerName},`
    : "Hi,";

  const breakdownLines = quote.breakdown
    .filter((b) => b.amount !== 0)
    .map((b) => `  - ${b.label}: ${b.amount < 0 ? "\u2212" : ""}$${Math.abs(b.amount).toLocaleString()}`)
    .join("\n");

  const includesList = quote.includes.map((i) => `  - ${i}`).join("\n");

  return `${customerLine}

Here's a quote for your move from ${request.originCity} to ${request.destinationCity} (~${distanceMiles.toLocaleString()} miles):

Provider: ${quote.providerName}
Containers: ${quote.containerLabel}
Estimated Price Range: $${quote.priceRange.low.toLocaleString()} \u2013 $${quote.priceRange.high.toLocaleString()}

Price Breakdown:
${breakdownLines}

Includes:
${includesList}

Est. Transit Time: ${quote.transitDays}
${quote.notes.length > 0 ? `\nNotes:\n${quote.notes.map(n => `  - ${n}`).join("\n")}\n` : ""}
This is an estimated quote based on industry data. Final pricing may vary based on exact addresses, availability, and current promotions. Visit ${quote.bookingUrl} for an exact quote.

\u2014 APM Moving Services`;
}
