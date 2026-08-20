"use client";

import Image from "next/image";
import { CalendarIcon, MapPinIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EventCardProps } from "@/lib/types/component-props";

const STATUS_LABEL: Record<
  EventCardProps["event"]["status"],
  { label: string; variant: "outline" | "default" | "secondary" }
> = {
  upcoming: { label: "예정", variant: "outline" },
  ongoing: { label: "진행중", variant: "default" },
  ended: { label: "종료", variant: "secondary" },
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatEventPeriod(startAt: string, endAt: string): string {
  const start = dateFormatter.format(new Date(startAt));
  const end = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(endAt));
  return `${start} - ${end}`;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const status = STATUS_LABEL[event.status];

  return (
    <Card
      className={cn(
        "overflow-hidden py-0",
        onClick && "cursor-pointer transition-colors hover:bg-accent/50",
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {event.coverImageUrl && (
        <div className="relative h-40 w-full">
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{event.title}</CardTitle>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 pb-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="size-4 shrink-0" />
          <span>{formatEventPeriod(event.startAt, event.endAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPinIcon className="size-4 shrink-0" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </CardContent>
    </Card>
  );
}
