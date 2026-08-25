import { Suspense } from "react";

import { EmptyState } from "@/components/empty-state";
import { EventStatusFilter } from "@/components/event-status-filter";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getMyEvents } from "@/lib/supabase/queries/events";

export default function EventsPage() {
  return (
    <div className="px-4 py-6">
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

  return <EventStatusFilter events={events} />;
}
