import { CEOLayout } from "@/components/layout/CEOLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { IncidentRow } from "@/components/dashboard/IncidentRow";
import { 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Calendar,
  ArrowRight
} from "lucide-react";

// Mock data
const clientsAttention = [
  {
    name: "Nexus Tech",
    status: "red" as const,
    lastActivity: "Hace 3 días",
    issue: "Incidencia de facturación sin resolver. El cliente ha enviado 2 emails sin respuesta.",
    projectCount: 2,
  },
  {
    name: "Global Media",
    status: "orange" as const,
    lastActivity: "Hace 1 día",
    issue: "Solicitud de llamada urgente pendiente de confirmar.",
    projectCount: 1,
  },
  {
    name: "Startup Lab",
    status: "orange" as const,
    lastActivity: "Hace 2 días",
    issue: "Fecha límite de entrega del proyecto en 48 horas.",
    projectCount: 3,
  },
];

const recentIncidents = [
  {
    clientName: "Nexus Tech",
    description: "Error en la facturación del mes de enero - cliente esperando resolución",
    status: "red" as const,
    daysOpen: 3,
  },
  {
    clientName: "Global Media",
    description: "Cambio de alcance solicitado por el cliente - pendiente de valorar",
    status: "orange" as const,
    daysOpen: 1,
  },
  {
    clientName: "CoreData",
    description: "Retraso en entrega de contenidos por parte del cliente",
    status: "yellow" as const,
    daysOpen: 5,
  },
];

export default function Index() {
  return (
    <CEOLayout>
      <div className="max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Buenos días
          </h1>
          <p className="text-muted-foreground">
            Tienes <span className="text-status-red font-medium">1 cliente</span> que requiere tu intervención hoy.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Intervención necesaria"
            value={1}
            subtitle="Nexus Tech"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="danger"
          />
          <SummaryCard
            title="En riesgo"
            value={2}
            subtitle="Esta semana"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="warning"
          />
          <SummaryCard
            title="Clientes activos"
            value={18}
            subtitle="3 nuevos este mes"
            icon={<Users className="w-5 h-5" />}
          />
          <SummaryCard
            title="Todo en orden"
            value={15}
            subtitle="Sin acción requerida"
            icon={<CheckCircle2 className="w-5 h-5" />}
            variant="success"
          />
        </div>

        {/* Clients needing attention */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Clientes que requieren atención
            </h2>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientsAttention.map((client) => (
              <ClientCard key={client.name} {...client} />
            ))}
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Incidencias activas
            </h2>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentIncidents.map((incident, index) => (
              <IncidentRow key={index} {...incident} />
            ))}
          </div>
        </section>

        {/* Upcoming dates */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Próximas fechas críticas
            </h2>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-status-orange/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-status-orange" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Entrega proyecto Startup Lab</p>
                <p className="text-sm text-muted-foreground">En 2 días • Fase 2 del desarrollo</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-status-orange/20 text-status-orange text-sm font-medium">
                48h
              </span>
            </div>
          </div>
        </section>
      </div>
    </CEOLayout>
  );
}
