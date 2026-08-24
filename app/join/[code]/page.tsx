import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarIcon, MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JoinConfirmButton } from "@/components/join-confirm-button";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getEventByInviteCode } from "@/lib/supabase/queries/events";
import { hasJoinedEvent } from "@/lib/supabase/queries/participants";
import { createClient } from "@/lib/supabase/server";

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
  const event = await getEventByInviteCode(code);
  if (!event) notFound();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  const isOrganizer = userId === event.createdBy;
  const alreadyJoined =
    !isOrganizer && userId ? await hasJoinedEvent(event.id, userId) : false;

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
      </div>

      {isOrganizer ? (
        <Button size="lg" className="w-full" variant="outline" asChild>
          <Link href={`/events/${event.id}`}>
            본인이 주최한 이벤트입니다 · 상세 보기
          </Link>
        </Button>
      ) : alreadyJoined ? (
        <Button size="lg" className="w-full" variant="outline" asChild>
          <Link href={`/events/${event.id}`}>이미 참여한 이벤트입니다</Link>
        </Button>
      ) : (
        <JoinConfirmButton eventId={event.id} />
      )}
    </>
  );
}
