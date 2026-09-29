"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { SkylineMark } from "@/components/modules/attendee/kit"
import { usePersistedState } from "@/components/shared/use-persisted-state"
import { COORDINATOR, initials } from "@/components/shared/summit-data"

export type Nav = { label: string; href: string; icon: LucideIcon; badge?: number }

const initialNotifications = [
  { id: 1, tone: "bg-[#fff6e5]", text: "One session outcome needs review." },
  { id: 2, tone: "bg-[#eef3ff]", text: "The event is live and accepting inputs." },
]

export function DesktopShell({
  role,
  nav,
  children,
  sidebarExtra,
  fullBleed = false,
}: {
  role: "Admin" | "Coordinator"
  nav: Nav[]
  children: ReactNode
  /** Extra sidebar section, e.g. the coordinator's assigned sessions. */
  sidebarExtra?: (collapsed: boolean) => ReactNode
  /** Workspaces manage their own padding and width. */
  fullBleed?: boolean
}) {
  const path = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = usePersistedState("ops-sidebar-collapsed", false)
  const [panel, setPanel] = useState<"notifications" | "account" | null>(null)
  const [notifications, setNotifications] = useState(initialNotifications)
  const headerRef = useRef<HTMLDivElement>(null)
  const user =
    role === "Admin"
      ? { name: "Anita Menon", sub: "Admin · AQV Operations" }
      : { name: COORDINATOR.name, sub: "Session Coordinator" }

  // Most specific match wins, so parent routes don't stay highlighted.
  const activeHref = nav
    .filter(({ href }) => path === href || path.startsWith(href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  useEffect(() => {
    if (!panel) return
    const onPointer = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setPanel(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPanel(null)
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [panel])

  const navigation = (mini: boolean) => (
    <>
      <div className={`flex h-14 shrink-0 items-center border-b border-white/10 ${mini ? "justify-center" : "px-4"}`}>
        <Link href={nav[0]?.href ?? "/"} className="flex items-center gap-2.5 text-white">
          <SkylineMark light className="h-7 w-9 shrink-0" />
          {!mini && (
            <span className="leading-tight">
              <strong className="block text-[14px] font-semibold">PAN IIT</strong>
              <span className="block text-[11.5px] text-blue-100/70">Amaravati Summit 2026</span>
            </span>
          )}
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
        {!mini && (
          <p className="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold tracking-wider text-blue-100/45 uppercase">
            {role}
          </p>
        )}
        {nav.map(({ label, href, icon: Icon, badge }) => {
          const active = href === activeHref
          return (
            <Link
              onClick={() => setMobileOpen(false)}
              key={href}
              href={href}
              title={mini ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-9 items-center gap-2.5 rounded-lg text-[13.5px] transition-colors ${mini ? "justify-center" : "px-2.5"} ${active ? "bg-white/12 font-semibold text-white" : "text-blue-100/75 hover:bg-white/7 hover:text-white"}`}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {!mini && <span className="flex-1 truncate">{label}</span>}
              {!!badge && (
                <span
                  className={`num rounded-full bg-[#ffb020] text-[11px] font-semibold text-[#0f1e4d] ${mini ? "absolute top-1 right-1 h-2 w-2" : "px-1.5 leading-5"}`}
                >
                  {!mini && badge}
                </span>
              )}
            </Link>
          )
        })}
        {sidebarExtra?.(mini)}
      </nav>
    </>
  )

  return (
    <div
      className={`min-h-svh lg:grid ${collapsed ? "lg:grid-cols-[64px_minmax(0,1fr)]" : "lg:grid-cols-[240px_minmax(0,1fr)]"}`}
      style={{
        background:
          "radial-gradient(900px 360px at 85% -8%, #e4ecff 0%, rgba(228,236,255,0) 60%), radial-gradient(700px 300px at 20% -10%, #fff1dc 0%, rgba(255,241,220,0) 55%), #f3f5fa",
      }}
    >
      <aside className="sticky top-0 hidden h-svh flex-col bg-gradient-to-b from-[#071f46] via-[#0a315f] to-[#071b3b] text-white lg:flex">
        {navigation(collapsed)}
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0f1e4d]/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="relative flex h-full w-[272px] flex-col bg-gradient-to-b from-[#071f46] via-[#0a315f] to-[#071b3b] text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-md text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {navigation(false)}
          </aside>
        </div>
      )}
      <div className="min-w-0">
        <div
          ref={headerRef}
          className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[#e6eaf2] bg-white/90 px-3 backdrop-blur md:px-5"
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md hover:bg-[#f1f4f9] lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden h-9 w-9 place-items-center rounded-md text-[#5e6a85] hover:bg-[#f1f4f9] lg:grid"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <div className="min-w-0 flex-1 truncate text-[13px] text-[#5e6a85]">
            <span className="hidden sm:inline">PAN IIT Amaravati Summit 2026 · </span>
            <span className="font-medium text-[#0f1e4d]">Sat 3 Oct</span>
            <span className="hidden md:inline"> · Dr. Ambedkar Kalavedika, Vijayawada</span>
          </div>
          <button
            onClick={() => setPanel(panel === "notifications" ? null : "notifications")}
            className="relative grid h-9 w-9 place-items-center rounded-md text-[#44506e] hover:bg-[#f1f4f9]"
            aria-label="Notifications"
            aria-expanded={panel === "notifications"}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-white bg-[#e5373b]" />
            )}
          </button>
          <button
            onClick={() => setPanel(panel === "account" ? null : "account")}
            className="flex h-9 items-center gap-2 rounded-md pr-1.5 pl-1 hover:bg-[#f1f4f9]"
            aria-label="Account menu"
            aria-expanded={panel === "account"}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e3ecff] text-[11.5px] font-semibold text-[#0b57f5]">
              {initials(user.name)}
            </span>
            <span className="hidden text-[13px] font-medium text-[#0f1e4d] md:block">{user.name}</span>
            <ChevronDown size={14} className="text-[#6b7690]" />
          </button>
          {panel && (
            <div className="pop-in absolute top-12 right-3 w-72 rounded-xl border border-[#e6eaf2] bg-white p-2 shadow-[0_16px_50px_rgba(15,30,77,.16)]">
              {panel === "notifications" ? (
                <>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <strong className="text-[13px] font-semibold">Notifications</strong>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[12px] font-medium text-[#0b57f5]"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="grid gap-1.5 p-1 text-[13px]">
                    {notifications.length === 0 ? (
                      <p className="p-3 text-center text-[#6b7690]">You&apos;re all caught up.</p>
                    ) : (
                      notifications.map((n) => (
                        <p key={n.id} className={`flex items-start justify-between gap-2 rounded-lg p-2.5 ${n.tone}`}>
                          {n.text}
                          <button
                            onClick={() => setNotifications((l) => l.filter((x) => x.id !== n.id))}
                            aria-label="Dismiss"
                            className="opacity-60 hover:opacity-100"
                          >
                            <X size={13} />
                          </button>
                        </p>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="grid text-[13.5px]">
                  <div className="border-b border-[#eef1f6] px-2.5 pt-1.5 pb-2.5">
                    <p className="font-medium text-[#0f1e4d]">{user.name}</p>
                    <p className="text-[12px] text-[#6b7690]">{user.sub}</p>
                  </div>
                  {role === "Admin" && (
                    <Link
                      href="/admin/settings"
                      onClick={() => setPanel(null)}
                      className="mt-1 rounded-md px-2.5 py-2 hover:bg-[#f4f6fa]"
                    >
                      Event settings
                    </Link>
                  )}
                  <Link
                    href="/login"
                    className="mt-1 flex items-center gap-2 rounded-md px-2.5 py-2 text-[#c62828] hover:bg-[#fdefef]"
                  >
                    <LogOut size={15} /> Sign out
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        <main
          className={
            fullBleed ? "min-w-0" : "mx-auto w-full max-w-[1320px] min-w-0 p-4 md:p-6"
          }
        >
          {children}
        </main>
      </div>
    </div>
  )
}
