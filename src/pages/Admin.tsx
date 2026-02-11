import { useState, useMemo, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Search,
  Users,
  AlertTriangle,
  Mail,
  Edit2,
  StickyNote,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  Send,
  RefreshCw,
  Database,
  Trash2,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { useNoteContext } from "@/contexts/NoteContext";
import { Button } from "@/components/ui/button";
import { StatusDot, Status } from "@/components/dashboard/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { HeaderNavigation } from "@/components/layout/HeaderNavigation";
import { NoteForm } from "@/components/admin/NoteForm";
import { CEONotificationBell } from "@/components/admin/CEONotificationBell";
import { TruncatedCell } from "@/components/admin/TruncatedCell";
import { ClientFormModal } from "@/components/admin/ClientFormModal";
import { seedClients } from "@/components/admin/seedData";
import { ColumnVisibilityToggle, useColumnVisibility } from "@/components/admin/ColumnVisibilityToggle";
import { DualScrollTable } from "@/components/admin/DualScrollTable";
import { DeleteClientDialog } from "@/components/admin/DeleteClientDialog";
import { ClientChatModal } from "@/components/ai/ClientChatModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  name: string;
  status: Status;
  email: string;
  phone: string;
  address: string;
  contact_name: string;
  project_type: string;
  work_description: string;
  budget: string;
  project_dates: string;
  project_manager: string;
  pending_tasks: string;
  incidents: string;
  last_contact: string;
}

interface Note {
  id: string;
  title?: string;
  content: string;
  visibility: "team" | "ceo" | "both";
  createdAt: string;
  author: string;
  targetDate?: Date;
  clientName?: string;
}

// Extended sort fields to cover all columns
type SortField = 
  | "name" 
  | "status" 
  | "contact_name" 
  | "email" 
  | "phone" 
  | "project_type" 
  | "work_description" 
  | "budget" 
  | "project_dates" 
  | "project_manager" 
  | "pending_tasks" 
  | "incidents" 
  | "last_contact";

type SortDirection = "asc" | "desc";

const statusOrder: Record<Status, number> = {
  red: 0,
  orange: 1,
  yellow: 2,
  green: 3,
};

export default function Admin() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalType, setModalType] = useState<"contacts" | "projects" | "incidents" | "newNote" | "email" | "notes" | null>(null);
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [notes, setNotes] = useState<Note[]>([]);
  const { addNote } = useNoteContext();

  // Column visibility
  const { visibleColumns, toggleColumn, showAll, resetToDefault, isColumnVisible } = useColumnVisibility();

  // Delete client state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Chat state
  const [aiChatClient, setAiChatClient] = useState<Client | null>(null);

  // CEO pending notes per client
  const [ceoNotesByClient, setCeoNotesByClient] = useState<Record<string, number>>({});

  const fetchCeoNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("client_id")
        .eq("visible_to", "team")
        .eq("status", "pending")
        .not("client_id", "is", null);

      if (error) { console.error(error); return; }

      const counts: Record<string, number> = {};
      data?.forEach(n => {
        if (n.client_id) counts[n.client_id] = (counts[n.client_id] || 0) + 1;
      });
      setCeoNotesByClient(counts);
    } catch (e) { console.error(e); }
  };

  // Fetch clients from database
  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setClients(data?.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status as Status,
        email: c.email || "",
        phone: c.phone || "",
        address: c.address || "",
        contact_name: c.contact_name || "",
        project_type: c.project_type || "",
        work_description: c.work_description || "",
        budget: c.budget || "",
        project_dates: c.project_dates || "",
        project_manager: c.project_manager || "",
        pending_tasks: c.pending_tasks || "",
        incidents: c.incidents || "",
        last_contact: c.last_contact || "",
      })) || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchCeoNotes();

    const handleNoteCreated = () => fetchCeoNotes();
    window.addEventListener("processia:noteCreated", handleNoteCreated);
    return () => window.removeEventListener("processia:noteCreated", handleNoteCreated);
  }, []);

  // Seed demo data
  const handleSeedData = async () => {
    const existingNames = clients.map(c => c.name);
    const alreadySeeded = seedClients.some(sc => existingNames.includes(sc.name));
    
    if (alreadySeeded) {
      toast.info("Los datos de ejemplo ya existen en la base de datos");
      return;
    }

    setSeeding(true);
    try {
      const { error } = await supabase
        .from("clients")
        .insert(seedClients.map(client => ({
          name: client.name,
          status: client.status,
          email: client.email,
          phone: client.phone,
          address: client.address,
          contact_name: client.contact_name,
          project_type: client.project_type,
          work_description: client.work_description,
          budget: client.budget,
          project_dates: client.project_dates,
          project_manager: client.project_manager,
          pending_tasks: client.pending_tasks,
          incidents: client.incidents || null,
          last_contact: client.last_contact,
        })));

      if (error) throw error;
      
      toast.success(`Se han creado ${seedClients.length} clientes de ejemplo`);
      await fetchClients();
    } catch (error) {
      console.error("Error seeding data:", error);
      toast.error("Error al generar datos de ejemplo");
    } finally {
      setSeeding(false);
    }
  };

  // Delete client
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", clientToDelete.id);

      if (error) throw error;

      toast.success(`Cliente "${clientToDelete.name}" eliminado correctamente`);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      await fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Error al eliminar el cliente");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  // Generic sort function for all fields
  const getSortValue = (client: Client, field: SortField): string | number => {
    if (field === "status") {
      return statusOrder[client.status];
    }
    if (field === "incidents") {
      return client.incidents ? 1 : 0;
    }
    return (client[field] || "").toLowerCase();
  };

  // Filter and sort clients
  const filteredAndSortedClients = useMemo(() => {
    let result = clients.filter((client) => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      
      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [clients, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const SortableHeader = ({ field, children, className = "" }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <button 
      onClick={() => handleSort(field)}
      className={cn("flex items-center hover:text-foreground transition-colors whitespace-nowrap", className)}
    >
      {children}
      {getSortIcon(field)}
    </button>
  );

  const openModal = (type: typeof modalType, client?: Client) => {
    if (client) setSelectedClient(client);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setEditingClient(null);
  };

  const handleSaveNote = (data: {
    title: string;
    content: string;
    visibility: "team" | "ceo" | "both";
    targetDate: Date;
    clientName?: string;
  }) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: data.title,
      content: data.content,
      visibility: data.visibility,
      createdAt: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
      author: "María López",
      targetDate: data.targetDate,
      clientName: data.clientName,
    };
    setNotes([newNote, ...notes]);

    if (data.visibility === "ceo" || data.visibility === "both") {
      addNote({
        title: data.title,
        content: data.content,
        clientName: data.clientName,
        author: "María López",
        visibility: data.visibility,
        targetDate: data.targetDate,
        status: "pending",
      });
    }

    closeModal();
  };

  const ceoNotes = notes.filter(n => n.visibility === "ceo" || n.visibility === "both");

  return (
    <div className="flex flex-col min-h-screen bg-background bg-grid">
      {/* Header with Navigation */}
      <HeaderNavigation />

      {/* Additional Admin Controls */}
      <div className="h-14 border-b border-border bg-background flex items-center justify-end px-6 gap-3">
        <CEONotificationBell onOpenClientChat={(clientId, clientName) => {
          const client = clients.find(c => c.id === clientId);
          if (client) setAiChatClient(client);
        }} />
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
        
        {/* Column Visibility Toggle */}
        <ColumnVisibilityToggle
          visibleColumns={visibleColumns}
          toggleColumn={toggleColumn}
          showAll={showAll}
          resetToDefault={resetToDefault}
        />

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {statusFilter === "all" ? "Todos" : 
                  statusFilter === "red" ? "Rojos" :
                  statusFilter === "orange" ? "Naranjas" :
                  statusFilter === "yellow" ? "Amarillos" : "Verdes"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Todos los estados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("red")}>
                <span className="w-2 h-2 rounded-full bg-status-red mr-2" />
                Intervención necesaria
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("orange")}>
                <span className="w-2 h-2 rounded-full bg-status-orange mr-2" />
                En riesgo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("yellow")}>
                <span className="w-2 h-2 rounded-full bg-status-yellow mr-2" />
                Atención
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("green")}>
                <span className="w-2 h-2 rounded-full bg-status-green mr-2" />
                Todo en orden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          {(statusFilter !== "all" || searchQuery) && (
            <Button 
              variant="ghost" 
              onClick={() => { setStatusFilter("all"); setSearchQuery(""); }}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Limpiar: {statusFilter !== "all" && searchQuery 
                ? "Todo" 
                : statusFilter !== "all" 
                  ? (statusFilter === "red" ? "Rojos" : statusFilter === "orange" ? "Naranjas" : statusFilter === "yellow" ? "Amarillos" : "Verdes")
                  : "Búsqueda"}
            </Button>
          )}

        <Button onClick={() => {
          setEditingClient(null);
          setClientFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Base de datos de clientes</h1>
              <p className="text-muted-foreground">{filteredAndSortedClients.length} clientes {statusFilter !== "all" ? `(filtrado por estado)` : "registrados"}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {ceoNotes.length > 0 && (
                <button 
                  onClick={() => openModal("notes")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <StickyNote className="w-4 h-4" />
                  <span className="text-sm font-medium">{ceoNotes.length} notas para CEO</span>
                </button>
              )}
              <button 
                onClick={() => {
                  setSelectedClient(null);
                  openModal("newNote");
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-status-purple/10 text-status-purple hover:bg-status-purple/20 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm font-medium">Enviar nota</span>
              </button>
            </div>
          </div>

          {/* Table with dual scroll */}
          <div className="rounded-xl border border-border bg-card">
            <DualScrollTable>
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    {isColumnVisible("status") && (
                      <TableHead className="w-[60px] sticky left-0 bg-secondary/50 z-10">
                        <SortableHeader field="status">Estado</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("name") && (
                      <TableHead className="sticky left-[60px] bg-secondary/50 z-10 min-w-[180px]">
                        <SortableHeader field="name">Cliente</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("contact_name") && (
                      <TableHead className="min-w-[140px]">
                        <SortableHeader field="contact_name">Contacto</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("email") && (
                      <TableHead className="min-w-[160px]">
                        <SortableHeader field="email">Email</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("phone") && (
                      <TableHead className="min-w-[120px]">
                        <SortableHeader field="phone">Teléfono</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("project_type") && (
                      <TableHead className="min-w-[140px]">
                        <SortableHeader field="project_type">Tipo proyecto</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("work_description") && (
                      <TableHead className="min-w-[180px]">
                        <SortableHeader field="work_description">Descripción</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("budget") && (
                      <TableHead className="min-w-[160px]">
                        <SortableHeader field="budget">Presupuesto</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("project_dates") && (
                      <TableHead className="min-w-[160px]">
                        <SortableHeader field="project_dates">Fechas</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("project_manager") && (
                      <TableHead className="min-w-[100px]">
                        <SortableHeader field="project_manager">Responsable</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("pending_tasks") && (
                      <TableHead className="min-w-[160px]">
                        <SortableHeader field="pending_tasks">Tareas pend.</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("incidents") && (
                      <TableHead className="min-w-[160px]">
                        <SortableHeader field="incidents">Incidencias</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("last_contact") && (
                      <TableHead className="min-w-[160px]">
                        <SortableHeader field="last_contact">Último contacto</SortableHeader>
                      </TableHead>
                    )}
                    {isColumnVisible("actions") && (
                      <TableHead className="text-right min-w-[120px] sticky right-0 bg-secondary/50 z-10">Acciones</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-card">
                      {isColumnVisible("status") && (
                        <TableCell className="sticky left-0 bg-card z-10">
                          <StatusDot status={client.status} pulse={client.status === "red"} />
                        </TableCell>
                      )}
                      {isColumnVisible("name") && (
                        <TableCell className="sticky left-[60px] bg-card z-10">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 relative">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              {ceoNotesByClient[client.id] > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                  {ceoNotesByClient[client.id]}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{client.name}</p>
                              {client.address && (
                                <p className="text-xs text-muted-foreground truncate">{client.address}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {isColumnVisible("contact_name") && (
                        <TableCell>
                          <TruncatedCell value={client.contact_name} maxWidth="max-w-[130px]" />
                        </TableCell>
                      )}
                      {isColumnVisible("email") && (
                        <TableCell>
                          <TruncatedCell value={client.email} maxWidth="max-w-[150px]" className="text-muted-foreground" />
                        </TableCell>
                      )}
                      {isColumnVisible("phone") && (
                        <TableCell>
                          <TruncatedCell value={client.phone} maxWidth="max-w-[110px]" className="text-muted-foreground" />
                        </TableCell>
                      )}
                      {isColumnVisible("project_type") && (
                        <TableCell>
                          <TruncatedCell value={client.project_type} maxWidth="max-w-[130px]" />
                        </TableCell>
                      )}
                      {isColumnVisible("work_description") && (
                        <TableCell>
                          <TruncatedCell value={client.work_description} maxWidth="max-w-[170px]" />
                        </TableCell>
                      )}
                      {isColumnVisible("budget") && (
                        <TableCell>
                          <TruncatedCell value={client.budget} maxWidth="max-w-[150px]" />
                        </TableCell>
                      )}
                      {isColumnVisible("project_dates") && (
                        <TableCell>
                          <TruncatedCell value={client.project_dates} maxWidth="max-w-[150px]" />
                        </TableCell>
                      )}
                      {isColumnVisible("project_manager") && (
                        <TableCell>
                          <TruncatedCell value={client.project_manager} maxWidth="max-w-[90px]" />
                        </TableCell>
                      )}
                      {isColumnVisible("pending_tasks") && (
                        <TableCell>
                          <TruncatedCell value={client.pending_tasks} maxWidth="max-w-[150px]" />
                        </TableCell>
                      )}
                      {isColumnVisible("incidents") && (
                        <TableCell>
                          {client.incidents ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-status-orange/20 text-status-orange text-xs">
                              <AlertTriangle className="w-3 h-3" />
                              <TruncatedCell value={client.incidents} maxWidth="max-w-[120px]" className="text-status-orange" />
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}
                      {isColumnVisible("last_contact") && (
                        <TableCell>
                          <TruncatedCell value={client.last_contact} maxWidth="max-w-[150px]" />
                        </TableCell>
                      )}
                      {isColumnVisible("actions") && (
                        <TableCell className="sticky right-0 bg-card z-10">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => setAiChatClient(client)}
                              title="Hablar con IA sobre este cliente"
                            >
                              <Sparkles className="w-4 h-4" />
                            </Button>
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
                                setClientFormOpen(true);
                              }}
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => openDeleteDialog(client)}
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DualScrollTable>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteClientDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={handleDeleteClient}
        clientName={clientToDelete?.name || ""}
        isDeleting={isDeleting}
      />

      {/* Contacts Modal */}
      <Dialog open={modalType === "contacts"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contactos de {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedClient?.contact_name ? (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{selectedClient.contact_name}</p>
                  <p className="text-sm text-muted-foreground">Contacto principal</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-foreground">{selectedClient.email || "Sin email"}</p>
                  <p className="text-muted-foreground">{selectedClient.phone || "Sin teléfono"}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay contactos registrados</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Projects Modal */}
      <Dialog open={modalType === "projects"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Proyecto de {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedClient?.project_type ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de proyecto</p>
                  <p className="font-medium text-foreground">{selectedClient.project_type}</p>
                </div>
                {selectedClient.work_description && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Descripción</p>
                    <p className="text-foreground">{selectedClient.work_description}</p>
                  </div>
                )}
                {selectedClient.budget && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Presupuesto</p>
                    <p className="text-foreground">{selectedClient.budget}</p>
                  </div>
                )}
                {selectedClient.project_dates && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Fechas</p>
                    <p className="text-foreground">{selectedClient.project_dates}</p>
                  </div>
                )}
                {selectedClient.project_manager && (
                  <div className="p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Responsable</p>
                    <p className="text-foreground">{selectedClient.project_manager}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay información de proyecto registrada</p>
            )}
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
            {selectedClient?.incidents ? (
              <div className="p-3 rounded-lg bg-secondary">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-status-orange mt-0.5" />
                  <p className="text-foreground">{selectedClient.incidents}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay incidencias registradas</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CEO Notes Modal */}
      <Dialog open={modalType === "notes"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notas visibles para CEO</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
            {ceoNotes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay notas para el CEO</p>
            ) : (
              ceoNotes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-secondary">
                  <p className="text-foreground text-sm">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{note.author} · {note.createdAt}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      note.visibility === "ceo" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {note.visibility === "ceo" ? "Solo CEO" : "CEO + Equipo"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Form Modal */}
      <ClientFormModal
        open={clientFormOpen}
        onClose={() => {
          setClientFormOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
        onSaved={fetchClients}
      />

      {/* New Note Modal */}
      <Dialog open={modalType === "newNote"} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva nota{selectedClient ? ` para ${selectedClient.name}` : ""}</DialogTitle>
          </DialogHeader>
          <NoteForm 
            onClose={closeModal} 
            onSave={handleSaveNote}
            clientName={selectedClient?.name}
            clients={clients.map(c => ({ name: c.name }))}
          />
        </DialogContent>
      </Dialog>

      {/* AI Client Chat Modal */}
      <ClientChatModal
        open={!!aiChatClient}
        onOpenChange={(open) => { if (!open) setAiChatClient(null); }}
        clientId={aiChatClient?.id || null}
        clientName={aiChatClient?.name || ""}
        clientStatus={aiChatClient?.status || "green"}
        issue={aiChatClient?.incidents || undefined}
      />

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
