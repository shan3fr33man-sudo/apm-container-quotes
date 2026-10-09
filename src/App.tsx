import { useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/layout";
import { QuoteForm } from "@/components/quote-form";
import { QuoteResults } from "@/components/quote-results";
import { SavedSearches } from "@/components/saved-searches";
import { useTheme } from "@/hooks/use-theme";
import { useQuotes } from "@/hooks/use-quotes";
import { useSavedSearches, deserializeRequest } from "@/hooks/use-saved-searches";
import type { QuoteRequest } from "@/types";
import type { SerializedQuoteRequest } from "@/hooks/use-saved-searches";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { result, isLoading, error, getQuotes } = useQuotes();
  const { searches, saveSearch, deleteSearch } = useSavedSearches();
  const [selectedSearch, setSelectedSearch] = useState<QuoteRequest | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleSubmit(request: QuoteRequest) {
    getQuotes(request);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleSave(request: QuoteRequest) {
    const name =
      request.customerName ||
      `${request.originCity} → ${request.destinationCity}`;
    saveSearch(name, request);
    toast.success(`Search saved as "${name}"`);
  }

  function handleSelectSearch(serialized: SerializedQuoteRequest) {
    setSelectedSearch(deserializeRequest(serialized));
  }

  return (
    <Layout
      theme={theme}
      onToggleTheme={toggleTheme}
      sidebar={
        <SavedSearches
          searches={searches}
          onSelect={handleSelectSearch}
          onDelete={deleteSearch}
        />
      }
    >
      <div className="space-y-8">
        <QuoteForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={selectedSearch}
          onSave={handleSave}
        />
        <div ref={resultsRef}>
          <QuoteResults result={result} isLoading={isLoading} error={error} />
        </div>
      </div>
      <Toaster />
    </Layout>
  );
}
