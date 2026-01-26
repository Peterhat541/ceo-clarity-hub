import { useState } from "react";
import { CEOLayout } from "@/components/layout/CEOLayout";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { IncidentRow } from "@/components/dashboard/IncidentRow";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Calendar,
  AlertOctagon
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

const criticalDates = [
  {
    title: "Entrega proyecto Startup Lab",
    subtitle: "Fase 2 del desarrollo",
    days: 2,
  },
  {
    title: "Reunión trimestral BlueSky",
    subtitle: "Seguimiento de objetivos",
    days: 4,
  },
];

export default function Index() {
  const [activeFilter, setActiveFilter] = useState("today");

  const handleCardClick = (type: string) => {
    // Update filter based on card clicked
    if (type === "danger" || type === "warning") {
      setActiveFilter("red-clients");
    } else if (type === "incidents") {
      setActiveFilter("incidents");
    }
  };

  const handleClientClick = (clientName: string) => {
    // Navigate to client detail or show in AI chat
    console.log("Navigate to client:", clientName);
  };

  const handleIncidentClick = (clientName: string) => {
    // Navigate to incident or show in AI chat
    console.log("Navigate to incident for:", clientName);
  };

  // Filter content based on active filter
  const renderContent = () => {
    switch (activeFilter) {
      case "incidents":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Todas las incidencias</h2>
            <div className="space-y-3">
              {recentIncidents.map((incident, index) => (
                <IncidentRow 
                  key={index} 
                  {...incident} 
                  onClick={() => handleIncidentClick(incident.clientName)}
                />
              ))}
            </div>
          </div>
        );

      case "red-clients":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Clientes que requieren intervención</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientsAttention.map((client) => (
                <ClientCard 
                  key={client.name} 
                  {...client} 
                  onClick={() => handleClientClick(client.name)}
                />
              ))}
            </div>
          </div>
        );

      case "dates":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Fechas críticas</h2>
            <div className="space-y-3">
              {criticalDates.map((date, index) => (
                <div 
                  key={index}
                  onClick={() => console.log("Navigate to date:", date.title)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-lg bg-status-orange/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-status-orange" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{date.title}</p>
                    <p className="text-sm text-muted-foreground">{date.subtitle}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-status-orange/20 text-status-orange text-sm font-medium">
                    {date.days}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default: // "today"
        return (
          <div className="space-y-6">
            {/* Summary Cards - All clickable */}
            <div className="grid grid-cols-4 gap-4">
              <SummaryCard
                title="Intervención necesaria"
                value={1}
                subtitle="Nexus Tech"
                icon={<AlertTriangle className="w-5 h-5" />}
                variant="danger"
                onClick={() => setActiveFilter("red-clients")}
              />
              <SummaryCard
                title="En riesgo"
                value={2}
                subtitle="Esta semana"
                icon={<AlertTriangle className="w-5 h-5" />}
                variant="warning"
                onClick={() => setActiveFilter("red-clients")}
              />
              <SummaryCard
                title="Clientes activos"
                value={18}
                subtitle="3 nuevos este mes"
                icon={<Users className="w-5 h-5" />}
                onClick={() => console.log("Show all clients")}
              />
              <SummaryCard
                title="Todo en orden"
                value={15}
                subtitle="Sin acción requerida"
                icon={<CheckCircle2 className="w-5 h-5" />}
                variant="success"
                onClick={() => console.log("Show healthy clients")}
              />
            </div>

            {/* Clients needing attention - Always visible */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Clientes que requieren atención
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clientsAttention.map((client) => (
                  <ClientCard 
                    key={client.name} 
                    {...client} 
                    onClick={() => handleClientClick(client.name)}
                  />
                ))}
              </div>
            </section>

            {/* Collapsible Sections */}
            <div className="space-y-3">
              <CollapsibleSection
                title="Incidencias activas"
                icon={<AlertOctagon className="w-5 h-5 text-status-orange" />}
                count={recentIncidents.length}
                variant="warning"
              >
                <div className="space-y-3">
                  {recentIncidents.map((incident, index) => (
                    <IncidentRow 
                      key={index} 
                      {...incident} 
                      onClick={() => handleIncidentClick(incident.clientName)}
                    />
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Próximas fechas críticas"
                icon={<Calendar className="w-5 h-5 text-muted-foreground" />}
                count={criticalDates.length}
              >
                <div className="space-y-3">
                  {criticalDates.map((date, index) => (
                    <div 
                      key={index}
                      onClick={() => console.log("Navigate to date:", date.title)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-lg bg-status-orange/20 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-status-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{date.title}</p>
                        <p className="text-sm text-muted-foreground">{date.subtitle}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-status-orange/20 text-status-orange text-sm font-medium">
                        {date.days}d
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          </div>
        );
    }
  };

  return (
    <CEOLayout activeFilter={activeFilter} onFilterChange={setActiveFilter}>
      <div className="max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Buenos días
          </h1>
          <p className="text-muted-foreground">
            Tienes <span className="text-status-red font-medium">1 cliente</span> que requiere tu intervención hoy.
          </p>
        </div>

        {/* Dynamic Content */}
        {renderContent()}
      </div>
    </CEOLayout>
  );
}
