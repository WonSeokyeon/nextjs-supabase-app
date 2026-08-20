import { Suspense } from "react";

import { AppHeader } from "@/components/app-header";
import {
  MobileBottomNav,
  MobileBottomNavFallback,
} from "@/components/mobile-bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <div className="flex-1 pb-20">{children}</div>
      {/* usePathname()이 cacheComponents 프리렌더링을 막으므로 Suspense로 동적 렌더링 경계를 명시 */}
      <Suspense fallback={<MobileBottomNavFallback />}>
        <MobileBottomNav />
      </Suspense>
      {/* TODO(Task 008): getClaims() 세션 체크 추가 시 cacheComponents 환경에서 동적 렌더링 경계(Suspense) 필요 */}
    </div>
  );
}
