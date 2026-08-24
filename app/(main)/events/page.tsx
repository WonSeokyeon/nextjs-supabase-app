import Link from "next/link";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getMyEvents } from "@/lib/supabase/queries/events";

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
  const events = await getMyEvents();

  if (events.length === 0) {
    return (
      <EmptyState
        title="아직 만든 이벤트가 없어요"
        description="새 이벤트를 만들어 친구들을 초대해보세요"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="relative block"
        >
          {/* 참여자 관리(event_participants)는 아직 구현 전이라 이 목록엔 내가 주최한 이벤트만 표시된다 */}
          <Badge variant="default" className="absolute left-2 top-2 z-10">
            주최
          </Badge>
          <EventCard event={event} />
        </Link>
      ))}
    </div>
  );
}
