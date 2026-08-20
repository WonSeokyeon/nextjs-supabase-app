import { Suspense } from "react";
import { connection } from "next/server";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteEventDialog } from "@/components/delete-event-dialog";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { createMockEvents, createMockParticipants } from "@/lib/mock-data";

const STATUS_LABEL = {
  upcoming: { label: "예정", variant: "outline" as const },
  ongoing: { label: "진행중", variant: "default" as const },
  ended: { label: "종료", variant: "secondary" as const },
};

export default function AdminEventsPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">이벤트 관리</h1>
      {/* 실제 검색/필터는 Task011에서 API와 함께 연동 예정 */}
      <Input placeholder="이벤트 검색" className="mb-4 max-w-sm" disabled />
      <Suspense fallback={<LoadingSkeleton count={8} />}>
        <AdminEventsTable />
      </Suspense>
    </div>
  );
}

async function AdminEventsTable() {
  // mock 데이터가 new Date()/랜덤 값을 사용해 cacheComponents 프리렌더링과 충돌하므로 동적 렌더링으로 명시
  await connection();
  const events = createMockEvents(8);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>제목</TableHead>
          <TableHead>주최자</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>참여자 수</TableHead>
          <TableHead>생성일</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => {
          const status = STATUS_LABEL[event.status];
          const participantCount = createMockParticipants(event.id, 4).length;
          return (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {event.createdBy.slice(0, 8)}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell>{participantCount}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(event.createdAt).toLocaleDateString("ko-KR")}
              </TableCell>
              <TableCell className="text-right">
                <DeleteEventDialog eventTitle={event.title} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
