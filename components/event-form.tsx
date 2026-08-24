"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { randomInviteCode } from "@/lib/invite-code";
import { eventFormSchema, type EventFormSchema } from "@/lib/schemas/event";

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  defaultValues?: Partial<EventFormSchema>;
}

export function EventForm({ mode, eventId, defaultValues }: EventFormProps) {
  const router = useRouter();
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const form = useForm<EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startAt: "",
      endAt: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: EventFormSchema) {
    const supabase = createClient();

    if (mode === "create") {
      const { data: claims } = await supabase.auth.getClaims();
      const userId = claims?.claims.sub;
      if (!userId) {
        toast.error("로그인이 필요합니다");
        return;
      }

      // 초대 코드는 DB unique 제약을 걸어뒀으므로, 충돌(23505) 시에만 코드를 새로 뽑아 재시도한다
      let insertError: string | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { error } = await supabase.from("events").insert({
          title: values.title,
          description: values.description,
          location: values.location,
          start_at: new Date(values.startAt).toISOString(),
          end_at: new Date(values.endAt).toISOString(),
          invite_code: randomInviteCode(),
          created_by: userId,
        });

        if (!error) {
          toast.success("이벤트가 생성되었습니다");
          router.push("/events");
          return;
        }

        if (error.code !== "23505") {
          insertError = error.message;
          break;
        }
      }

      toast.error(
        insertError ?? "이벤트 생성에 실패했습니다. 다시 시도해주세요",
      );
      return;
    }

    if (!eventId) return;
    const { error } = await supabase
      .from("events")
      .update({
        title: values.title,
        description: values.description,
        location: values.location,
        start_at: new Date(values.startAt).toISOString(),
        end_at: new Date(values.endAt).toISOString(),
      })
      .eq("id", eventId);

    if (error) {
      toast.error("이벤트 수정에 실패했습니다");
      return;
    }

    toast.success("이벤트가 수정되었습니다");
    router.push(`/events/${eventId}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="예: 동아리 여름 MT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="이벤트에 대해 간단히 설명해주세요"
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>장소</FormLabel>
              <FormControl>
                <Input placeholder="예: 서울 강남구 카페거리" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시작 일시</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>종료 일시</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverImage">커버 이미지 (선택)</Label>
          <Input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
          />
          {coverImage && (
            <p className="text-xs text-muted-foreground">
              {coverImage.name} 선택됨 (업로드는 아직 지원되지 않습니다)
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {mode === "create" ? "이벤트 만들기" : "수정 완료"}
        </Button>
      </form>
    </Form>
  );
}
