"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CirclePlus, CircleUser } from "lucide-react";

import { cn } from "@/lib/utils";

const EVENTS_ITEM = { href: "/events", label: "내 이벤트", icon: CalendarDays };
const PROFILE_ITEM = { href: "/profile", label: "프로필", icon: CircleUser };

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 grid h-16 grid-cols-3 items-center border-t bg-background px-4">
      <NavLink
        item={EVENTS_ITEM}
        active={pathname.startsWith(EVENTS_ITEM.href)}
      />

      <div className="flex items-center justify-center">
        <Link
          href="/events/new"
          aria-label="새 이벤트 만들기"
          className="flex size-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <CirclePlus className="size-7" />
        </Link>
      </div>

      <NavLink
        item={PROFILE_ITEM}
        active={pathname.startsWith(PROFILE_ITEM.href)}
      />
    </nav>
  );
}

// usePathname() 확정 전(Suspense 대체 화면)에 보여줄, 활성 탭 강조가 없는 동일한 레이아웃
export function MobileBottomNavFallback() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 grid h-16 grid-cols-3 items-center border-t bg-background px-4">
      <NavLink item={EVENTS_ITEM} active={false} />

      <div className="flex items-center justify-center">
        <Link
          href="/events/new"
          aria-label="새 이벤트 만들기"
          className="flex size-14 -translate-y-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <CirclePlus className="size-7" />
        </Link>
      </div>

      <NavLink item={PROFILE_ITEM} active={false} />
    </nav>
  );
}

function NavLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: typeof CalendarDays };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center gap-1 text-xs",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-6" />
      <span>{item.label}</span>
    </Link>
  );
}
