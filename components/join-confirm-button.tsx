"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface JoinConfirmButtonProps {
  eventId: string;
}

export function JoinConfirmButton({ eventId }: JoinConfirmButtonProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  async function handleJoin() {
    setIsJoining(true);
    const supabase = createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims.sub;

    if (!userId) {
      setIsJoining(false);
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase
      .from("event_participants")
      .insert({ event_id: eventId, user_id: userId });
    setIsJoining(false);

    // 23505: unique(event_id, user_id) 위반 — 이미 참여한 경우로 간주하고 상세 페이지로 보낸다
    if (error && error.code !== "23505") {
      toast.error("참여에 실패했습니다");
      return;
    }

    toast.success(error ? "이미 참여한 이벤트입니다" : "이벤트에 참여했습니다");
    router.push(`/events/${eventId}`);
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleJoin}
      disabled={isJoining}
    >
      참여하기
    </Button>
  );
}
