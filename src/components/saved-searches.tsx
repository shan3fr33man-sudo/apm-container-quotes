import { format } from "date-fns";
import { X, Bookmark } from "lucide-react";
import type { SavedSearch, SerializedQuoteRequest } from "@/hooks/use-saved-searches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SavedSearchesProps {
  searches: SavedSearch[];
  onSelect: (request: SerializedQuoteRequest) => void;
  onDelete: (id: string) => void;
}

export function SavedSearches({ searches, onSelect, onDelete }: SavedSearchesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bookmark className="size-4" />
            Saved Searches
            {searches.length > 0 && (
              <Badge variant="secondary">{searches.length}</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {searches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved searches yet</p>
        ) : (
          <div className="space-y-2">
            {searches.map((search) => (
              <div
                key={search.id}
                role="button"
                tabIndex={0}
                className="group flex items-start justify-between gap-2 rounded-md border p-3 transition-colors hover:bg-accent cursor-pointer"
                onClick={() => onSelect(search.request)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(search.request);
                  }
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{search.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {search.request.originCity} → {search.request.destinationCity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Saved {format(new Date(search.savedAt), "MMM d, yyyy")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(search.id);
                  }}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
