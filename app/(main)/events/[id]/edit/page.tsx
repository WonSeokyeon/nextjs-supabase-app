import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";

import { EventForm } from "@/components/event-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { getEventById } from "@/lib/supabase/queries/events";
import { createClient } from "@/lib/supabase/server";

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
  const event = await getEventById(id);
  if (!event) notFound();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  // 주최자가 아니면 수정 폼에 접근할 수 없다(RLS도 update를 막지만, UX상 여기서 먼저 차단)
  if (claims?.claims.sub !== event.createdBy) {
    redirect(`/events/${id}`);
  }

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
