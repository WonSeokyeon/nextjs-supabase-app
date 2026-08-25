"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MyEvent } from "@/lib/supabase/queries/events";
import type { Event } from "@/lib/types/event";

type StatusFilter = "all" | Event["status"];

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "진행예정" },
  { value: "ongoing", label: "진행중" },
  { value: "ended", label: "진행완료" },
];

interface EventStatusFilterProps {
  events: MyEvent[];
}

export function EventStatusFilter({ events }: EventStatusFilterProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filteredEvents = useMemo(
    () =>
      filter === "all"
        ? events
        : events.filter((event) => event.status === filter),
    [events, filter],
  );

  return (
    <div className="space-y-4">
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as StatusFilter)}
      >
        <TabsList className="w-full">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredEvents.length === 0 ? (
        <EmptyState
          title={`${FILTERS.find((f) => f.value === filter)?.label} 이벤트가 없어요`}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block">
              <EventCard event={event} role={event.role} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
