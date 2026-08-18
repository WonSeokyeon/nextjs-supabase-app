import { AppHeader } from "@/components/app-header";
import { MobileTopNav } from "@/components/mobile-top-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <MobileTopNav />
      <div className="flex-1">{children}</div>
      {/* TODO(Task 008): getClaims() 세션 체크 추가 시 cacheComponents 환경에서 동적 렌더링 경계(Suspense) 필요 */}
    </div>
  );
}
