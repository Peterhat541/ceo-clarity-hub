import processiaLogo from "@/assets/processia-logo-new.png";

// Simplified header - no search, only logo
export function TopNavigation() {
  return <header className="h-12 border-b border-border bg-background flex items-center px-4">
      <img alt="Processia" className="h-8 w-auto" src={processiaLogo} />
    </header>;
}