import { Suspense } from "react";

export default function JoinEventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <Suspense fallback={<h1>초대 링크 참여 (F002, F004, F010)</h1>}>
      <JoinEventContent params={params} />
    </Suspense>
  );
}

async function JoinEventContent({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <h1>초대 링크 참여 (F002, F004, F010) - {code}</h1>;
}
