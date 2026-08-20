import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { CalendarIcon, MapPinIcon, PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteEventDialog } from "@/components/delete-event-dialog";
import { InviteShareButton } from "@/components/invite-share-button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ParticipantCard } from "@/components/participant-card";
import {
  createMockEvent,
  createMockParticipants,
  createMockProfile,
} from "@/lib/mock-data";

const STATUS_LABEL = {
  upcoming: { label: "예정", variant: "outline" as const },
  ongoing: { label: "진행중", variant: "default" as const },
  ended: { label: "종료", variant: "secondary" as const },
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Suspense fallback={<LoadingSkeleton count={1} />}>
        <EventDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function EventDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // mock 데이터가 new Date()/랜덤 값을 사용해 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();
  const event = createMockEvent({ id });
  const participants = createMockParticipants(id, 4);
  const status = STATUS_LABEL[event.status];

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

      <div className="mb-2 flex items-start justify-between gap-2">
        <h1 className="text-xl font-bold">{event.title}</h1>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
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
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <InviteShareButton inviteCode={event.inviteCode} />
        <Button variant="outline" asChild>
          <Link href={`/events/${id}/edit`}>
            <PencilIcon />
            수정
          </Link>
        </Button>
        <DeleteEventDialog eventTitle={event.title} />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold">
          참여자 ({participants.length})
        </h2>
        <div className="divide-y">
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              profile={createMockProfile({ id: participant.userId })}
            />
          ))}
        </div>
      </section>
    </>
  );
}
