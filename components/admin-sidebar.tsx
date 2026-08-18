import Link from "next/link";

const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드 메인" },
  { href: "/admin/events", label: "이벤트 관리" },
  { href: "/admin/users", label: "사용자 관리" },
  { href: "/admin/analytics", label: "통계 분석" },
];

export function AdminSidebar() {
  return (
    <aside className="w-60 shrink-0 border-r p-4">
      <nav className="flex flex-col gap-2">
        {ADMIN_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="text-sm">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
