import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ProviderQuote, QuoteRequest } from "@/types";
import { formatQuoteText } from "@/lib/format-quote";

interface CopyQuoteButtonProps {
  quote: ProviderQuote;
  request: QuoteRequest;
  distanceMiles: number;
}

export function CopyQuoteButton({
  quote,
  request,
  distanceMiles,
}: CopyQuoteButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = formatQuoteText(quote, request, distanceMiles);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Quote copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please try again.");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="mr-1 size-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-1 size-3" />
          Copy Quote
        </>
      )}
    </Button>
  );
}
