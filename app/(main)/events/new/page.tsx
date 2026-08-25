import { Suspense } from "react";
import { connection } from "next/server";

import { EventForm } from "@/components/event-form";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function NewEventPage() {
  return (
    <div className="px-4 py-6">
      <Suspense fallback={<LoadingSkeleton count={1} />}>
        <NewEventForm />
      </Suspense>
    </div>
  );
}

async function NewEventForm() {
  // "/events/new"는 정적 페이지라 Client Router Cache가 기본 5분간 재사용하는데,
  // 이때 EventForm 인스턴스(및 입력값)까지 그대로 재사용돼 이전에 입력한 값이
  // 남아있는 채로 보이는 문제가 있었다. connection()으로 동적 렌더링을 강제해
  // 재방문할 때마다 항상 새로 마운트되도록 한다.
  await connection();
  return <EventForm mode="create" cancelHref="/events" />;
}
