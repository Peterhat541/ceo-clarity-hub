import { MobileHome } from "@/components/dashboard/MobileHome";
import { DesktopCEODashboard } from "@/components/dashboard/DesktopCEODashboard";
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

  // Desktop: render dashboard directly (handles its own viewport + ViewSwitcher)
  return <DesktopCEODashboard />;
}
