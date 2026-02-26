import prossiumLogo from "@/assets/prossium-logo.png";

// Simplified header - no search, only logo
export function TopNavigation() {
  return <header className="h-12 border-b border-border bg-background flex items-center px-4">
      <img alt="Prossium" className="h-8 w-auto" src={prossiumLogo} />
    </header>;
}
