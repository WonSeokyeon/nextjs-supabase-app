import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarIcon, MapPinIcon, PencilIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteEventDialog } from "@/components/delete-event-dialog";
import { EmptyState } from "@/components/empty-state";
import { InviteShareButton } from "@/components/invite-share-button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ParticipantCard } from "@/components/participant-card";
import { getEventById } from "@/lib/supabase/queries/events";
import { getEventParticipants } from "@/lib/supabase/queries/participants";
import { getProfilesByIds } from "@/lib/supabase/queries/profiles";
import { createClient } from "@/lib/supabase/server";

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
  const event = await getEventById(id);
  if (!event) notFound();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const isOrganizer = claims?.claims.sub === event.createdBy;
  const status = STATUS_LABEL[event.status];

  const participants = await getEventParticipants(id);
  const profiles = await getProfilesByIds(participants.map((p) => p.userId));

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

      {isOrganizer && (
        <div className="mb-6 flex flex-wrap gap-2">
          <InviteShareButton
            inviteCode={event.inviteCode}
            eventTitle={event.title}
            eventDescription={event.description}
            coverImageUrl={event.coverImageUrl}
          />
          <Button variant="outline" asChild>
            <Link href={`/events/${id}/edit`}>
              <PencilIcon />
              수정
            </Link>
          </Button>
          <DeleteEventDialog
            eventId={event.id}
            eventTitle={event.title}
            redirectTo="/events"
          />
        </div>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold">
          참여자 ({participants.length})
        </h2>
        {participants.length === 0 ? (
          <EmptyState title="아직 참여자가 없어요" />
        ) : (
          <div className="divide-y">
            {participants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                profile={
                  profiles.get(participant.userId) ?? {
                    id: participant.userId,
                    displayName: "참여자",
                    avatarUrl: null,
                  }
                }
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
