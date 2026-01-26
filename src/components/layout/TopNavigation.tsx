import processiaLogo from "@/assets/processia-logo-new.png";

// Simplified header - no search, only logo
export function TopNavigation() {
  return <header className="h-16 border-b border-border bg-background flex items-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img alt="Processia" className="h-10 w-auto" src={processiaLogo} />
      </div>
    </header>;
}