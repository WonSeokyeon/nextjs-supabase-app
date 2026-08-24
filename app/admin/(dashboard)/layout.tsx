import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin-sidebar";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getCurrentUserRole } from "@/lib/supabase/queries/profiles";
import { createClient } from "@/lib/supabase/server";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <Suspense fallback={<LoadingSkeleton count={4} />}>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </main>
    </div>
  );
}

// F014: proxy.ts에서 이미 한 번 걸러지지만, 레이아웃 레벨에서도 방어적으로 admin 권한을 확인한다
async function AdminGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) redirect("/admin/login");

  const role = await getCurrentUserRole(userId);
  if (role !== "admin") redirect("/admin/login");

  return <>{children}</>;
}
