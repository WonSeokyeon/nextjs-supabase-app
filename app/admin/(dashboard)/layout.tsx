import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
      {/* TODO(Task 008): role: admin 체크 추가 시 동적 렌더링 경계 필요 */}
    </div>
  );
}
