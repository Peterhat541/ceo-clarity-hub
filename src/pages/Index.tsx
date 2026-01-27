import { MobileHome } from "@/components/dashboard/MobileHome";
import { ViewSwitcher } from "@/components/layout/ViewSwitcher";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const isMobile = useIsMobile();

  // Show loading state while detecting screen size
  if (isMobile === undefined) {
    return null;
  }

  // For mobile: full screen layout
  if (isMobile) {
    return <MobileHome />;
  }

  // For desktop: same design but wider, with ViewSwitcher for navigation
  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto flex justify-center">
        <div className="w-full max-w-2xl">
          <MobileHome />
        </div>
      </div>
      <ViewSwitcher />
    </div>
  );
}
