import type { ReactNode } from "react";
import { Package } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface LayoutProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  children: ReactNode;
}

export function Layout({ theme, onToggleTheme, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Package className="size-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              ContainerQuotes
            </h1>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              by APM Moving Services
            </span>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
