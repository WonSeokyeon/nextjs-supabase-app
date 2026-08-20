// 이벤트 생성/수정 폼 검증 스키마 — docs/forms-react-hook-form.md의 zod 패턴을 따름
import { z } from "zod";

// startAt/endAt은 <input type="datetime-local"> 값 형식(YYYY-MM-DDTHH:mm)의 문자열
export const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "제목을 입력해주세요")
      .max(100, "제목은 최대 100자까지 입력 가능합니다"),
    description: z
      .string()
      .min(1, "설명을 입력해주세요")
      .max(1000, "설명은 최대 1000자까지 입력 가능합니다"),
    location: z
      .string()
      .min(1, "장소를 입력해주세요")
      .max(200, "장소는 최대 200자까지 입력 가능합니다"),
    startAt: z.string().min(1, "시작 일시를 입력해주세요"),
    endAt: z.string().min(1, "종료 일시를 입력해주세요"),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: "종료 일시는 시작 일시보다 이후여야 합니다",
    path: ["endAt"],
  });

export type EventFormSchema = z.infer<typeof eventFormSchema>;
