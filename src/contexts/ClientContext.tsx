import { createContext, useContext, useState, ReactNode } from "react";

interface ClientContextType {
  selectedClient: string | null;
  setSelectedClient: (client: string | null) => void;
  activateClientWithContext: (clientName: string, issue?: string) => void;
  pendingContext: { clientName: string; issue?: string } | null;
  clearPendingContext: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [pendingContext, setPendingContext] = useState<{ clientName: string; issue?: string } | null>(null);

  const activateClientWithContext = (clientName: string, issue?: string) => {
    setSelectedClient(clientName);
    setPendingContext({ clientName, issue });
  };

  const clearPendingContext = () => {
    setPendingContext(null);
  };

  return (
    <ClientContext.Provider value={{ 
      selectedClient, 
      setSelectedClient, 
      activateClientWithContext, 
      pendingContext, 
      clearPendingContext 
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClientContext must be used within a ClientProvider");
  }
  return context;
}
