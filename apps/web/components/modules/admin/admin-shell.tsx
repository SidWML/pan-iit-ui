"use client"
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lightbulb,
  Settings,
  Users,
} from "lucide-react"
import { DesktopShell } from "@/components/shells/desktop-shell"
import { useOutcomes } from "@/components/shared/summit-data"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [outcomes] = useOutcomes()
  const awaiting = Object.values(outcomes).filter((o) => o.status === "Submitted").length
  const nav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
    { label: "Sessions", href: "/admin/sessions", icon: CalendarDays },
    { label: "Outcomes", href: "/admin/outcomes", icon: CheckCircle2, badge: awaiting },
    { label: "Ideas", href: "/admin/ideas", icon: Lightbulb },
    { label: "Reports", href: "/admin/reports", icon: FileText },
    { label: "People & Roles", href: "/admin/people", icon: Users },
    { label: "Event Settings", href: "/admin/settings", icon: Settings },
  ]
  return (
    <DesktopShell role="Admin" nav={nav} fullBleed>
      {children}
    </DesktopShell>
  )
}
