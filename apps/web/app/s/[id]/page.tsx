import { QrLandingScreen } from "@/components/modules/auth/auth-screens"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <QrLandingScreen id={id} />
}
