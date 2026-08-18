import Link from "next/link";
import { CalendarDays, CirclePlus, CircleUser } from "lucide-react";

const NAV_ITEMS = [
  { href: "/events", label: "내 이벤트", icon: CalendarDays },
  { href: "/events/new", label: "새 이벤트 만들기", icon: CirclePlus },
  { href: "/profile", label: "프로필", icon: CircleUser },
];

export function MobileTopNav() {
  return (
    <nav className="sticky top-14 z-10 flex items-center gap-6 border-b bg-background px-4 py-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 text-xs"
          >
            <Icon className="size-6" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
