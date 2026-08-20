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

interface DeleteEventDialogProps {
  eventTitle: string;
  // 삭제 후 이동할 경로 — 생략하면 현재 페이지에 머무른다(예: 관리자 테이블에서 행 삭제 시)
  redirectTo?: string;
}

export function DeleteEventDialog({
  eventTitle,
  redirectTo,
}: DeleteEventDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    setOpen(false);
    toast.success("이벤트가 삭제되었습니다");
    if (redirectTo) {
      router.push(redirectTo);
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
          <Button variant="destructive" onClick={handleConfirm}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
