import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search,
  Users,
  FolderOpen,
  AlertTriangle,
  Mail,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot, Status } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  status: Status;
  contacts: number;
  projects: number;
  incidents: number;
  lastActivity: string;
}

const clients: Client[] = [
  { id: "1", name: "Nexus Tech", status: "red", contacts: 3, projects: 2, incidents: 1, lastActivity: "Hace 3 días" },
  { id: "2", name: "Global Media", status: "orange", contacts: 2, projects: 1, incidents: 1, lastActivity: "Hace 1 día" },
  { id: "3", name: "Startup Lab", status: "orange", contacts: 4, projects: 3, incidents: 0, lastActivity: "Hace 2 días" },
  { id: "4", name: "CoreData", status: "yellow", contacts: 2, projects: 1, incidents: 1, lastActivity: "Hace 5 días" },
  { id: "5", name: "BlueSky Ventures", status: "green", contacts: 3, projects: 2, incidents: 0, lastActivity: "Hoy" },
  { id: "6", name: "TechFlow Solutions", status: "green", contacts: 2, projects: 1, incidents: 0, lastActivity: "Ayer" },
  { id: "7", name: "Digital Nomads Co", status: "green", contacts: 1, projects: 1, incidents: 0, lastActivity: "Hace 3 días" },
  { id: "8", name: "Innovate Labs", status: "green", contacts: 4, projects: 2, incidents: 0, lastActivity: "Hace 1 semana" },
];

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for this view */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-teal flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">P</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Processia</span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Administración
          </p>
          <nav className="space-y-1">
            <a href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
              ← Volver al dashboard
            </a>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Client list */}
        <div className="w-96 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Clientes</h2>
              <Button size="sm" className="h-8">
                <Plus className="w-4 h-4 mr-1" />
                Nuevo
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={cn(
                  "p-4 border-b border-border cursor-pointer hover:bg-card transition-colors",
                  selectedClient?.id === client.id && "bg-card"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusDot status={client.status} />
                    <span className="font-medium text-foreground">{client.name}</span>
                  </div>
                  <button className="p-1 hover:bg-secondary rounded">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {client.contacts}
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {client.projects}
                  </span>
                  {client.incidents > 0 && (
                    <span className="flex items-center gap-1 text-status-orange">
                      <AlertTriangle className="w-3 h-3" />
                      {client.incidents}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client detail */}
        <div className="flex-1 p-6">
          {selectedClient ? (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-foreground">
                        {selectedClient.name}
                      </h1>
                      <StatusDot status={selectedClient.status} />
                    </div>
                    <p className="text-muted-foreground">
                      Última actividad: {selectedClient.lastActivity}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar email
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva nota
                  </Button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Contactos</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedClient.contacts}</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <FolderOpen className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Proyectos</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedClient.projects}</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Incidencias</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedClient.incidents}</p>
                </div>
              </div>

              {/* Timeline placeholder */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Historial</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-status-orange" />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-card border border-border">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Incidencia registrada
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Error en la facturación del mes de enero
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hace 3 días • Por: María García
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-card border border-border">
                      <p className="text-sm font-medium text-foreground mb-1">
                        Email enviado
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Seguimiento proyecto Q1 - Confirmación de entregables
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hace 1 semana • Por: Carlos López
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona un cliente para ver su información</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
