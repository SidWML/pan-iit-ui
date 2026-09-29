import { ProfileScreen } from "@/components/modules/auth/auth-screens"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const { edit } = await searchParams
  return <ProfileScreen edit={edit === "1"} />
}
