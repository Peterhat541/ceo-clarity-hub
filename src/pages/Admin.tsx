import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Search,
  Users,
  FolderOpen,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Eye,
  X,
  StickyNote,
  LayoutDashboard,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot, Status } from "@/components/dashboard/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";

interface Client {
  id: string;
  name: string;
  status: Status;
  email: string;
  phone: string;
  address: string;
  mainContact: string;
  contacts: number;
  projects: number;
  incidents: number;
  lastActivity: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  startDate: string;
}

interface Incident {
  id: string;
  description: string;
  status: Status;
  createdAt: string;
}

const clients: Client[] = [
  { 
    id: "1", 
    name: "Nexus Tech", 
    status: "red", 
    email: "info@nexustech.com",
    phone: "+34 912 345 678",
    address: "Calle Gran Vía 45, Madrid",
    mainContact: "Carlos Rodríguez",
    contacts: 3, 
    projects: 2, 
    incidents: 1, 
    lastActivity: "Hace 3 días" 
  },
  { 
    id: "2", 
    name: "Global Media", 
    status: "orange", 
    email: "contact@globalmedia.es",
    phone: "+34 933 456 789",
    address: "Av. Diagonal 200, Barcelona",
    mainContact: "Ana Martínez",
    contacts: 2, 
    projects: 1, 
    incidents: 1, 
    lastActivity: "Hace 1 día" 
  },
  { 
    id: "3", 
    name: "Startup Lab", 
    status: "orange", 
    email: "hello@startuplab.io",
    phone: "+34 916 789 012",
    address: "Calle Serrano 100, Madrid",
    mainContact: "Miguel Sánchez",
    contacts: 4, 
    projects: 3, 
    incidents: 0, 
    lastActivity: "Hace 2 días" 
  },
  { 
    id: "4", 
    name: "CoreData", 
    status: "yellow", 
    email: "support@coredata.com",
    phone: "+34 945 678 901",
    address: "Plaza España 15, Bilbao",
    mainContact: "Laura García",
    contacts: 2, 
    projects: 1, 
    incidents: 1, 
    lastActivity: "Hace 5 días" 
  },
  { 
    id: "5", 
    name: "BlueSky Ventures", 
    status: "green", 
    email: "info@bluesky.vc",
    phone: "+34 961 234 567",
    address: "Calle Colón 50, Valencia",
    mainContact: "Pablo Fernández",
    contacts: 3, 
    projects: 2, 
    incidents: 0, 
    lastActivity: "Hoy" 
  },
  { 
    id: "6", 
    name: "TechFlow Solutions", 
    status: "green", 
    email: "contact@techflow.es",
    phone: "+34 952 345 678",
    address: "Av. Ricardo Soriano 20, Marbella",
    mainContact: "Elena López",
    contacts: 2, 
    projects: 1, 
    incidents: 0, 
    lastActivity: "Ayer" 
  },
];

const mockContacts: Contact[] = [
  { id: "1", name: "Carlos Rodríguez", role: "CEO", email: "carlos@nexustech.com", phone: "+34 612 345 678" },
  { id: "2", name: "María García", role: "CTO", email: "maria@nexustech.com", phone: "+34 623 456 789" },
  { id: "3", name: "Juan López", role: "Project Manager", email: "juan@nexustech.com", phone: "+34 634 567 890" },
];

const mockProjects: Project[] = [
  { id: "1", name: "Migración Cloud", status: "En progreso", startDate: "15 Nov 2025" },
  { id: "2", name: "App Móvil v2", status: "Planificación", startDate: "01 Feb 2026" },
];

const mockIncidents: Incident[] = [
  { id: "1", description: "Error en la facturación del mes de enero", status: "red", createdAt: "23 Ene 2026" },
];

export default function Admin() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalType, setModalType] = useState<"contacts" | "projects" | "incidents" | "edit" | "newClient" | "newNote" | "email" | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.mainContact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (type: typeof modalType, client?: Client) => {
    if (client) setSelectedClient(client);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setEditingClient(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-teal flex items-center justify-center glow">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Processia</span>
          <span className="text-sm text-muted-foreground ml-2">/ Administración</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cliente, email, contacto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button onClick={() => openModal("newClient")}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo cliente
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">Base de datos de clientes</h1>
            <p className="text-muted-foreground">{filteredClients.length} clientes registrados</p>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="w-[50px]">Estado</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto principal</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-center">Contactos</TableHead>
                  <TableHead className="text-center">Proyectos</TableHead>
                  <TableHead className="text-center">Incidencias</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-card">
                    <TableCell>
                      <StatusDot status={client.status} pulse={client.status === "red"} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{client.mainContact}</TableCell>
                    <TableCell className="text-muted-foreground">{client.email}</TableCell>
                    <TableCell className="text-muted-foreground">{client.phone}</TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => openModal("contacts", client)}
                        className="px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
                      >
                        {client.contacts}
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => openModal("projects", client)}
                        className="px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
                      >
                        {client.projects}
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => openModal("incidents", client)}
                        className={cn(
                          "px-2 py-1 rounded-md text-sm font-medium transition-colors",
                          client.incidents > 0 
                            ? "bg-status-orange/20 text-status-orange hover:bg-status-orange/30" 
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        )}
                      >
                        {client.incidents}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openModal("newNote", client)}
                          title="Nueva nota"
                        >
                          <StickyNote className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openModal("email", client)}
                          title="Enviar email"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingClient(client);
                            openModal("edit", client);
                          }}
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* View Switcher */}
      <ViewSwitcher />

      {/* Contacts Modal */}
      <Dialog open={modalType === "contacts"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contactos de {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {mockContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-foreground">{contact.email}</p>
                  <p className="text-muted-foreground">{contact.phone}</p>
                </div>
              </div>
            ))}
            <Button className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Añadir contacto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Projects Modal */}
      <Dialog open={modalType === "projects"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Proyectos de {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {mockProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{project.name}</p>
                  <p className="text-sm text-muted-foreground">Inicio: {project.startDate}</p>
                </div>
                <span className="px-2 py-1 rounded-full bg-status-green/20 text-status-green text-xs font-medium">
                  {project.status}
                </span>
              </div>
            ))}
            <Button className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Añadir proyecto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Incidents Modal */}
      <Dialog open={modalType === "incidents"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Incidencias de {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedClient?.incidents === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay incidencias registradas</p>
            ) : (
              mockIncidents.map((incident) => (
                <div key={incident.id} className="flex items-start gap-4 p-3 rounded-lg bg-secondary">
                  <div className="w-10 h-10 rounded-lg bg-status-red/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-status-red" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{incident.description}</p>
                    <p className="text-sm text-muted-foreground">Creada: {incident.createdAt}</p>
                  </div>
                  <StatusDot status={incident.status} pulse />
                </div>
              ))
            )}
            <Button className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Registrar incidencia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Client Modal */}
      <Dialog open={modalType === "newClient"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre de la empresa</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ej: Acme Corp"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="info@empresa.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Teléfono</label>
              <input 
                type="tel" 
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+34 912 345 678"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Dirección</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Calle, número, ciudad"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Contacto principal</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nombre y apellidos"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
              <Button className="flex-1">Crear cliente</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={modalType === "edit"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar {editingClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Nombre de la empresa</label>
              <input 
                type="text" 
                defaultValue={editingClient?.name}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input 
                type="email" 
                defaultValue={editingClient?.email}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Teléfono</label>
              <input 
                type="tel" 
                defaultValue={editingClient?.phone}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Dirección</label>
              <input 
                type="text" 
                defaultValue={editingClient?.address}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Contacto principal</label>
              <input 
                type="text" 
                defaultValue={editingClient?.mainContact}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
              <Button className="flex-1">Guardar cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Note Modal */}
      <Dialog open={modalType === "newNote"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva nota para {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Contenido de la nota</label>
              <textarea 
                rows={4}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Escribe la nota aquí..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Visibilidad</label>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg border border-primary bg-primary/10 text-primary text-sm font-medium">
                  Solo equipo
                </button>
                <button className="flex-1 px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:border-primary/50 transition-colors">
                  Visible para CEO
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
              <Button className="flex-1">Guardar nota</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Modal */}
      <Dialog open={modalType === "email"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar email a {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Para</label>
              <input 
                type="email" 
                defaultValue={selectedClient?.email}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Asunto</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Asunto del email..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mensaje</label>
              <textarea 
                rows={6}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Escribe el mensaje aquí..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
              <Button className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Enviar email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
