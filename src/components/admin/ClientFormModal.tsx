import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Status } from "@/components/dashboard/StatusBadge";

interface ClientFormData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contact_name: string;
  status: Status;
  // New business fields
  project_type: string;
  work_description: string;
  budget: string;
  project_dates: string;
  project_manager: string;
  pending_tasks: string;
  incidents: string;
  last_contact: string;
}

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  client?: ClientFormData | null;
  onSaved?: () => void;
}

const emptyFormData: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  contact_name: "",
  status: "green",
  project_type: "",
  work_description: "",
  budget: "",
  project_dates: "",
  project_manager: "",
  pending_tasks: "",
  incidents: "",
  last_contact: "",
};

export function ClientFormModal({ open, onClose, client, onSaved }: ClientFormModalProps) {
  const [formData, setFormData] = useState<ClientFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);

  const isEditing = !!client?.id;

  useEffect(() => {
    if (client) {
      setFormData({
        ...emptyFormData,
        ...client,
      });
    } else {
      setFormData(emptyFormData);
    }
  }, [client, open]);

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre de la empresa es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        contact_name: formData.contact_name.trim() || null,
        status: formData.status,
        project_type: formData.project_type.trim() || null,
        work_description: formData.work_description.trim() || null,
        budget: formData.budget.trim() || null,
        project_dates: formData.project_dates.trim() || null,
        project_manager: formData.project_manager.trim() || null,
        pending_tasks: formData.pending_tasks.trim() || null,
        incidents: formData.incidents.trim() || null,
        last_contact: formData.last_contact.trim() || null,
      };

      if (isEditing && client?.id) {
        const { error } = await supabase
          .from("clients")
          .update(dataToSave)
          .eq("id", client.id);

        if (error) throw error;
        toast.success("Cliente actualizado correctamente");
      } else {
        const { error } = await supabase
          .from("clients")
          .insert(dataToSave);

        if (error) throw error;
        toast.success("Cliente creado correctamente");
      }

      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Error al guardar el cliente");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editar ${client?.name}` : "Nuevo cliente / proyecto"}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 mt-4">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                📋 Datos básicos del cliente
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Nombre de la empresa <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={inputClass}
                    placeholder="Ej: Carpintería López"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Estado</label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v as Status)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">🟢 Todo en orden</SelectItem>
                      <SelectItem value="yellow">🟡 Atención</SelectItem>
                      <SelectItem value="orange">🟠 En riesgo</SelectItem>
                      <SelectItem value="red">🔴 Intervención necesaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Contacto principal</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => handleChange("contact_name", e.target.value)}
                    className={inputClass}
                    placeholder="Nombre y apellidos"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={inputClass}
                    placeholder="info@empresa.com"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={inputClass}
                    placeholder="+34 612 345 678"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className={inputClass}
                    placeholder="Calle, número, ciudad"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                🔧 Datos del proyecto
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Tipo de proyecto</label>
                  <input
                    type="text"
                    value={formData.project_type}
                    onChange={(e) => handleChange("project_type", e.target.value)}
                    className={inputClass}
                    placeholder="Ej: Cambio de ventanas, Cerramiento..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Responsable interno</label>
                  <input
                    type="text"
                    value={formData.project_manager}
                    onChange={(e) => handleChange("project_manager", e.target.value)}
                    className={inputClass}
                    placeholder="Ej: Pedro, María..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Descripción del trabajo</label>
                  <Textarea
                    value={formData.work_description}
                    onChange={(e) => handleChange("work_description", e.target.value)}
                    className="min-h-[80px]"
                    placeholder="Descripción detallada: qué se hace, materiales, medidas..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Budget and Dates Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                💰 Presupuesto y fechas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Presupuesto</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    className={inputClass}
                    placeholder="Total: 4.800€ | Señal: 1.500€ | Pendiente: 3.300€"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Fechas del proyecto</label>
                  <input
                    type="text"
                    value={formData.project_dates}
                    onChange={(e) => handleChange("project_dates", e.target.value)}
                    className={inputClass}
                    placeholder="Medición: 15/02 | Fab: 20/02-10/03 | Inst: 18/03"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Tasks and Incidents Section */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                ⚡ Estado actual
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Tareas pendientes</label>
                  <Textarea
                    value={formData.pending_tasks}
                    onChange={(e) => handleChange("pending_tasks", e.target.value)}
                    className="min-h-[60px]"
                    placeholder="Confirmar fecha instalación, recibir material, cobrar pago final..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Incidencias o retrasos</label>
                  <Textarea
                    value={formData.incidents}
                    onChange={(e) => handleChange("incidents", e.target.value)}
                    className="min-h-[60px]"
                    placeholder="Problemas, cambios del cliente, retrasos... (dejar vacío si no hay)"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Último contacto con el cliente</label>
                  <input
                    type="text"
                    value={formData.last_contact}
                    onChange={(e) => handleChange("last_contact", e.target.value)}
                    className={inputClass}
                    placeholder="10/02 – Llamada. Cliente conforme. Pendiente fechas."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
                {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear cliente"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
