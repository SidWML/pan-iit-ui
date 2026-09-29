import { CheckEmailScreen } from "@/components/modules/auth/auth-screens"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams
  return <CheckEmailScreen email={email || "your email"} />
}
