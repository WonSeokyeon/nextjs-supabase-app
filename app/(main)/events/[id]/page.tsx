export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <h1>이벤트 상세 (F001, F002, F003, F005, F006, F008, F009) - {id}</h1>;
}
