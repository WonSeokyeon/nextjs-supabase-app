import Link from "next/link";
import { CircleUser } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
      <Link href="/events" className="text-lg font-bold">
        Gather
      </Link>
      <Link href="/profile" aria-label="프로필">
        <CircleUser className="size-6" />
      </Link>
    </header>
  );
}
