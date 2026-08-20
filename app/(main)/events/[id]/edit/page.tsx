import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";

import { EventForm } from "@/components/event-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { createMockEvent } from "@/lib/mock-data";

// <input type="datetime-local">가 요구하는 "YYYY-MM-DDTHH:mm" 형식으로 변환(로컬 타임존 기준)
function toDatetimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Suspense fallback={<LoadingSkeleton count={1} />}>
        <EditEventForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditEventForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // mock 데이터가 new Date()/랜덤 값을 사용해 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();
  // mock 조회 — 매 요청마다 새 랜덤 값이 생성되므로 새로고침 시 초기값이 달라질 수 있음(Task 007 이후 실제 DB 조회로 대체)
  const event = createMockEvent({ id });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">이벤트 수정</h1>
        <Link href={`/events/${id}`} className="text-sm text-muted-foreground">
          취소
        </Link>
      </div>
      <EventForm
        mode="edit"
        eventId={id}
        defaultValues={{
          title: event.title,
          description: event.description,
          location: event.location,
          startAt: toDatetimeLocal(event.startAt),
          endAt: toDatetimeLocal(event.endAt),
        }}
      />
    </>
  );
}
