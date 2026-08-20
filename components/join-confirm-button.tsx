"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface JoinConfirmButtonProps {
  eventId: string;
}

export function JoinConfirmButton({ eventId }: JoinConfirmButtonProps) {
  const router = useRouter();

  function handleJoin() {
    toast.success("이벤트에 참여했습니다");
    router.push(`/events/${eventId}`);
  }

  return (
    <Button size="lg" className="w-full" onClick={handleJoin}>
      참여하기
    </Button>
  );
}
