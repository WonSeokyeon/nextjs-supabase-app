import Link from "next/link";

import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">이벤트 만들기</h1>
        <Link href="/events" className="text-sm text-muted-foreground">
          취소
        </Link>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
