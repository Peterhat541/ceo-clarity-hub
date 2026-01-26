import { useState } from "react";
import { Search, AlertTriangle, AlertOctagon, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TopNavigationProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const filters = [
  { id: "today", label: "Hoy", icon: null },
  { id: "incidents", label: "Incidencias", icon: AlertTriangle, count: 3 },
  { id: "red-clients", label: "Clientes en rojo", icon: AlertOctagon, count: 1 },
  { id: "dates", label: "Fechas críticas", icon: Calendar, count: 2 },
];

export function TopNavigation({ activeFilter = "today", onFilterChange }: TopNavigationProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const mockClients = [
    { name: "Nexus Tech", status: "red" },
    { name: "Global Media", status: "orange" },
    { name: "Startup Lab", status: "orange" },
    { name: "CoreData", status: "yellow" },
    { name: "BlueSky Ventures", status: "green" },
  ];

  const filteredClients = mockClients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-teal flex items-center justify-center glow">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Processia</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange?.(filter.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {filter.icon && <filter.icon className="w-4 h-4" />}
              {filter.label}
              {filter.count && filter.count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs",
                  activeFilter === filter.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Icon */}
        <button 
          onClick={() => setSearchOpen(true)}
          className="p-2.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buscar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nombre del cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
            {searchQuery && (
              <div className="space-y-1">
                {filteredClients.map((client) => (
                  <button
                    key={client.name}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      client.status === "red" && "bg-status-red",
                      client.status === "orange" && "bg-status-orange",
                      client.status === "yellow" && "bg-status-yellow",
                      client.status === "green" && "bg-status-green",
                    )} />
                    <span className="font-medium text-foreground">{client.name}</span>
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No se encontraron clientes
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
