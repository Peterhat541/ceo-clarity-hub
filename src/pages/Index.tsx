import { MobileHome } from "@/components/dashboard/MobileHome";
import { CEOLayout } from "@/components/layout/CEOLayout";
import { DesktopHome } from "@/components/dashboard/DesktopHome";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const isMobile = useIsMobile();

  // Show loading state while detecting screen size
  if (isMobile === undefined) {
    return null;
  }

  if (isMobile) {
    return <MobileHome />;
  }

  return (
    <CEOLayout>
      <DesktopHome />
    </CEOLayout>
  );
}
