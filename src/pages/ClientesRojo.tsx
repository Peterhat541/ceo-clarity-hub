import { CEOLayout } from "@/components/layout/CEOLayout";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { AlertOctagon } from "lucide-react";

const redClients = [
  {
    name: "Nexus Tech",
    status: "red" as const,
    lastActivity: "Hace 3 días",
    issue: "Incidencia de facturación sin resolver. El cliente ha enviado 2 emails sin respuesta.",
    projectCount: 2,
  },
];

const orangeClients = [
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

export default function ClientesRojo() {
  return (
    <CEOLayout>
      <div className="max-w-4xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Clientes en rojo
          </h1>
          <p className="text-muted-foreground">
            Clientes que requieren tu intervención directa
          </p>
        </div>

        {/* Critical Section */}
        {redClients.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertOctagon className="w-5 h-5 text-status-red" />
              <h2 className="text-lg font-semibold text-status-red">
                Intervención inmediata ({redClients.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {redClients.map((client) => (
                <ClientCard key={client.name} {...client} />
              ))}
            </div>
          </section>
        )}

        {/* At Risk Section */}
        {orangeClients.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertOctagon className="w-5 h-5 text-status-orange" />
              <h2 className="text-lg font-semibold text-status-orange">
                En riesgo ({orangeClients.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orangeClients.map((client) => (
                <ClientCard key={client.name} {...client} />
              ))}
            </div>
          </section>
        )}

        {redClients.length === 0 && orangeClients.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-status-green/20 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8 text-status-green" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Todo bajo control
            </h3>
            <p className="text-muted-foreground">
              No tienes clientes que requieran intervención inmediata.
            </p>
          </div>
        )}
      </div>
    </CEOLayout>
  );
}
