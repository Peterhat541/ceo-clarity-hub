import processiaLogo from "@/assets/processia-logo.png";

// Simplified header - no search, only logo
export function TopNavigation() {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={processiaLogo} alt="Processia" className="h-10 w-auto" />
      </div>
    </header>
  );
}
