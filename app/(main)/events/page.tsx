import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/event-card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { createMockEvents, isMockOrganizer } from "@/lib/mock-data";

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">내 이벤트</h1>
      <Suspense fallback={<LoadingSkeleton count={6} />}>
        <EventsGrid />
      </Suspense>
    </div>
  );
}

async function EventsGrid() {
  // mock 데이터가 new Date()/랜덤 값을 사용해 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();
  const events = createMockEvents(6).sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {events.map((event) => {
        const isOrganizer = isMockOrganizer(event.id);
        return (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="relative block"
          >
            <Badge
              variant={isOrganizer ? "default" : "outline"}
              className="absolute left-2 top-2 z-10"
            >
              {isOrganizer ? "주최" : "참여"}
            </Badge>
            <EventCard event={event} />
          </Link>
        );
      })}
    </div>
  );
}
