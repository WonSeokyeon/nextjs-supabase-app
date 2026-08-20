import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { EventCard } from "@/components/event-card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { createMockEvents } from "@/lib/mock-data";

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
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <EventCard event={event} />
        </Link>
      ))}
    </div>
  );
}
