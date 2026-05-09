import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-base font-bold tracking-tight">TripSync AI</span>
        </Link>
        <nav className="flex items-center gap-2">
          {right ?? (
            <>
              <Link to="/create" className="btn-outline-purple px-4 py-1.5 text-sm">Sign in</Link>
              <Link to="/create" className="btn-primary px-5 py-2 text-sm">Create Trip</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
