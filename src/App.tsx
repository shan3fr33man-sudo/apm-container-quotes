import { useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/layout";
import { QuoteForm } from "@/components/quote-form";
import { QuoteResults } from "@/components/quote-results";
import { useTheme } from "@/hooks/use-theme";
import { useQuotes } from "@/hooks/use-quotes";
import type { QuoteRequest } from "@/types";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { result, isLoading, error, getQuotes } = useQuotes();
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleSubmit(request: QuoteRequest) {
    getQuotes(request);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <Layout theme={theme} onToggleTheme={toggleTheme}>
      <div className="space-y-8">
        <QuoteForm onSubmit={handleSubmit} isLoading={isLoading} />
        <div ref={resultsRef}>
          <QuoteResults result={result} isLoading={isLoading} error={error} />
        </div>
      </div>
      <Toaster />
    </Layout>
  );
}
