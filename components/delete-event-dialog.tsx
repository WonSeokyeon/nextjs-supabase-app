"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

interface DeleteEventDialogProps {
  eventTitle: string;
  // 실제 events 테이블에서 삭제할 대상 id — 생략하면(예: 관리자 mock 테이블) 실제 삭제 없이 UI만 동작한다
  eventId?: string;
  // 삭제 후 이동할 경로 — 생략하면 현재 페이지에 머무른다(예: 관리자 테이블에서 행 삭제 시)
  redirectTo?: string;
}

export function DeleteEventDialog({
  eventTitle,
  eventId,
  redirectTo,
}: DeleteEventDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (eventId) {
      setIsDeleting(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);
      setIsDeleting(false);

      if (error) {
        toast.error("이벤트 삭제에 실패했습니다");
        return;
      }
    }

    setOpen(false);
    toast.success("이벤트가 삭제되었습니다");
    if (redirectTo) {
      router.push(redirectTo);
    } else if (eventId) {
      // 같은 페이지에 머무르는 경우(예: 관리자 테이블) 삭제된 행이 즉시 반영되도록 갱신
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2Icon />
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이벤트를 삭제할까요?</DialogTitle>
          <DialogDescription>
            &quot;{eventTitle}&quot; 이벤트를 삭제하면 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
