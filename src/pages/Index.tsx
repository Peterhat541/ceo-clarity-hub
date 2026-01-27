import { MobileHome } from "@/components/dashboard/MobileHome";
import { DesktopCEODashboard } from "@/components/dashboard/DesktopCEODashboard";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const isMobile = useIsMobile();

  // Show loading state while detecting screen size
  if (isMobile === undefined) {
    return null;
  }

  // Mobile: compact layout
  if (isMobile) {
    return <MobileHome />;
  }

  // Desktop: full-width professional dashboard
  return (
    <div className="w-screen min-h-screen h-screen flex flex-col bg-background overflow-x-hidden">
      <main className="flex-1 min-h-0 overflow-hidden">
        <DesktopCEODashboard />
      </main>
      <ViewSwitcher />
    </div>
  );
}
