export default async function JoinEventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <h1>초대 링크 참여 (F002, F004, F010) - {code}</h1>;
}
