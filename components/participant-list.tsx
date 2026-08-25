"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { ParticipantCard } from "@/components/participant-card";
import { createClient } from "@/lib/supabase/client";
import type { DisplayProfile } from "@/lib/supabase/queries/profiles";
import type { EventParticipant } from "@/lib/types/participant";

interface ParticipantListProps {
  eventId: string;
  initialParticipants: EventParticipant[];
  initialProfiles: [string, DisplayProfile][];
}

// F007: 실시간 참여자 수 카운트 업데이트 — event_participants insert를 구독해
// 새로고침 없이 목록/카운트를 갱신한다
export function ParticipantList({
  eventId,
  initialParticipants,
  initialProfiles,
}: ParticipantListProps) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [profiles, setProfiles] = useState(new Map(initialProfiles));

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`event-participants-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const row = payload.new;
          const newParticipant: EventParticipant = {
            id: row.id,
            eventId: row.event_id,
            userId: row.user_id,
            joinedAt: row.joined_at,
          };

          // 새로고침 중이던 다른 탭에서 이미 반영된 참여자가 다시 들어오지 않도록 방지
          setParticipants((prev) =>
            prev.some((p) => p.id === newParticipant.id)
              ? prev
              : [...prev, newParticipant],
          );

          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, username, avatar_url")
            .eq("id", newParticipant.userId)
            .maybeSingle();

          if (profile) {
            setProfiles((prev) =>
              new Map(prev).set(profile.id, {
                id: profile.id,
                displayName: profile.full_name ?? profile.username ?? "참여자",
                avatarUrl: profile.avatar_url,
              }),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  return (
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
  );
}
