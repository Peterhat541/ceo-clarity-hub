import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClientProvider } from "@/contexts/ClientContext";
import { EventProvider } from "@/contexts/EventContext";
import { NoteProvider } from "@/contexts/NoteContext";
import { ReminderProvider } from "@/contexts/ReminderContext";
import { CEONoteProvider } from "@/contexts/CEONoteContext";
import { AIChatProvider } from "@/contexts/AIChatContext";
import { UserProvider } from "@/contexts/UserContext";
import { DemoGuard } from "@/components/auth/DemoGuard";
import { UserGuard } from "@/components/auth/UserGuard";
import Landing from "./pages/Landing";
import UserSelect from "./pages/UserSelect";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <ClientProvider>
          <EventProvider>
            <NoteProvider>
              <ReminderProvider>
                <CEONoteProvider>
                  <AIChatProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/landing" element={<Landing />} />
                        <Route path="/select-user" element={<DemoGuard><UserSelect /></DemoGuard>} />
                        <Route path="/" element={<DemoGuard><UserGuard><Index /></UserGuard></DemoGuard>} />
                        <Route path="/admin" element={<DemoGuard><UserGuard><Admin /></UserGuard></DemoGuard>} />
                        <Route path="/ceo" element={<Navigate to="/" replace />} />
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        <Route path="/incidencias" element={<Navigate to="/" replace />} />
                        <Route path="/clientes-rojo" element={<Navigate to="/" replace />} />
                        <Route path="/fechas" element={<Navigate to="/" replace />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </AIChatProvider>
                </CEONoteProvider>
              </ReminderProvider>
            </NoteProvider>
          </EventProvider>
        </ClientProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
