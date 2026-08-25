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
    // 데스크톱 뷰포트에서도 모바일 화면 폭(max-w-md)으로 고정해 실제 모바일 앱처럼 보이게 한다
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col border-x bg-background">
        <AppHeader />
        <div className="flex-1">{children}</div>
        {/* usePathname()이 cacheComponents 프리렌더링을 막으므로 Suspense로 동적 렌더링 경계를 명시 */}
        <Suspense fallback={<MobileBottomNavFallback />}>
          <MobileBottomNav />
        </Suspense>
        {/* TODO(Task 008): getClaims() 세션 체크 추가 시 cacheComponents 환경에서 동적 렌더링 경계(Suspense) 필요 */}
      </div>
    </div>
  );
}
