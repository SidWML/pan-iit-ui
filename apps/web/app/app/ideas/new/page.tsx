import { IdeaForm } from "@/components/modules/attendee/attendee-screens"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>
}) {
  const { theme } = await searchParams
  return <IdeaForm initialTheme={theme} />
}
