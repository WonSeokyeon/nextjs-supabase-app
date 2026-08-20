import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { JoinConfirmButton } from "@/components/join-confirm-button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { createMockEvent, createMockParticipants } from "@/lib/mock-data";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function JoinEventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Suspense fallback={<LoadingSkeleton count={1} />}>
        <JoinEventContent params={params} />
      </Suspense>
    </div>
  );
}

async function JoinEventContent({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  // mock 데이터가 new Date()/랜덤 값을 사용해 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();
  const event = createMockEvent({ inviteCode: code });
  const participants = createMockParticipants(event.id, 3);

  return (
    <>
      {event.coverImageUrl && (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl">
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <h1 className="mb-2 text-xl font-bold">{event.title}</h1>
      <p className="mb-4 text-sm text-muted-foreground">{event.description}</p>

      <div className="mb-6 flex flex-col gap-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="size-4 shrink-0" />
          <span>
            {dateFormatter.format(new Date(event.startAt))} -{" "}
            {dateFormatter.format(new Date(event.endAt))}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPinIcon className="size-4 shrink-0" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <UsersIcon className="size-4 shrink-0" />
          <span>현재 {participants.length}명 참여중</span>
        </div>
      </div>

      <JoinConfirmButton eventId={event.id} />
    </>
  );
}
