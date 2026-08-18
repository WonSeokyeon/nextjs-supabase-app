export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <h1>이벤트 수정 (F001, F006, F009) - {id}</h1>;
}
