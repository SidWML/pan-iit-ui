import { IdeaDetail } from "@/components/modules/attendee/attendee-screens"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <IdeaDetail id={id} />
}
