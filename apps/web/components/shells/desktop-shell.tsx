"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react"
import { Brand } from "@/components/shared/brand"
import { Modal } from "@/components/shared/modal"
import type { LucideIcon } from "lucide-react"

export type Nav = { label: string; href: string; icon: LucideIcon }

const initialNotifications = [
  { id: 1, tone: "bg-amber-50", text: "One session outcome needs review." },
  { id: 2, tone: "bg-blue-50", text: "The event is live and accepting inputs." },
]

export function DesktopShell({
  role,
  nav,
  children,
}: {
  role: "Admin" | "Coordinator"
  nav: Nav[]
  children: React.ReactNode
}) {
  const path = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [panel, setPanel] = useState<"notifications" | "account" | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const headerRef = useRef<HTMLElement>(null)

  // Only the most specific nav item is active, so parent routes such as
  // /coordinator/sessions don't stay highlighted on their child pages.
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

  const navigation = (
    <>
      <div className="border-b border-white/10 p-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            onClick={() => setMobileOpen(false)}
            key={href}
            href={href}
            aria-current={href === activeHref ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${href === activeHref ? "bg-white/12 font-semibold text-white" : "text-blue-100/75 hover:bg-white/7 hover:text-white"}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-blue-100/75 hover:bg-white/7 hover:text-white"
        >
          <LogOut size={17} />
          Sign out
        </Link>
      </div>
    </>
  )
  return (
    <div className="min-h-svh max-w-full overflow-x-hidden bg-[radial-gradient(circle_at_90%_0%,#e8efff_0,transparent_30%),#f4f6fb] md:grid md:grid-cols-[238px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh bg-gradient-to-b from-[#071f46] via-[#0a315f] to-[#071b3b] text-white md:flex md:flex-col">
        {navigation}
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/45 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="relative flex h-full w-[280px] flex-col bg-[#082b58] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 rounded-lg p-2 hover:bg-white/10"
              aria-label="Close menu"
            >
              <X />
            </button>
            {navigation}
          </aside>
        </div>
      )}
      <div className="max-w-full min-w-0">
        <header
          ref={headerRef}
          className="glass sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/70 px-4 md:px-7"
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div className="hidden text-sm text-muted-foreground md:block">
            PAN IIT Amaravati Summit 2026
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setPanel(panel === "notifications" ? null : "notifications")
              }
              className="relative rounded-lg p-2 hover:bg-muted"
              aria-label="Notifications"
              aria-expanded={panel === "notifications"}
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setPanel(panel === "account" ? null : "account")}
              className="flex items-center gap-2 border-l pl-3"
              aria-label="Account menu"
              aria-expanded={panel === "account"}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {role === "Admin" ? "AM" : "RK"}
              </span>
              <span className="hidden text-sm font-semibold sm:block">
                {role}
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
          {panel && (
            <div className="absolute top-14 right-4 w-72 rounded-xl border bg-white p-3 shadow-xl">
              <div className="flex items-center justify-between border-b pb-2">
                <strong className="text-sm">
                  {panel === "notifications" ? "Notifications" : "Account"}
                </strong>
                <button onClick={() => setPanel(null)} aria-label="Close">
                  <X size={15} />
                </button>
              </div>
              {panel === "notifications" ? (
                <div className="space-y-2 pt-2 text-sm">
                  {notifications.length === 0 ? (
                    <p className="p-3 text-center text-muted-foreground">
                      You&apos;re all caught up.
                    </p>
                  ) : (
                    <>
                      {notifications.map((n) => (
                        <p
                          key={n.id}
                          className={`flex items-start justify-between gap-2 rounded-lg p-3 ${n.tone}`}
                        >
                          {n.text}
                          <button
                            onClick={() =>
                              setNotifications((list) =>
                                list.filter((x) => x.id !== n.id)
                              )
                            }
                            aria-label="Dismiss notification"
                            className="mt-0.5 shrink-0 opacity-60 hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        </p>
                      ))}
                      <button
                        onClick={() => setNotifications([])}
                        className="w-full pt-1 text-xs font-semibold text-blue-700 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-1 pt-2 text-sm">
                  {role === "Admin" ? (
                    <Link
                      href="/admin/settings"
                      onClick={() => setPanel(null)}
                      className="rounded-lg p-2 hover:bg-slate-50"
                    >
                      Profile & settings
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setPanel(null)
                        setProfileOpen(true)
                      }}
                      className="rounded-lg p-2 text-left hover:bg-slate-50"
                    >
                      Profile & settings
                    </button>
                  )}
                  <Link
                    href="/login"
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </Link>
                </div>
              )}
            </div>
          )}
        </header>
        <main className="mx-auto max-w-[1440px] min-w-0 overflow-x-hidden p-4 md:p-7">
          {children}
        </main>
      </div>
      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Profile"
        description="Your coordinator account for the summit."
      >
        <dl className="grid gap-3 text-sm">
          {[
            ["Name", "Ravi Kumar"],
            ["Role", role],
            ["Email", "ravi.kumar@example.com"],
            ["Assigned sessions", "3"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b pb-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex justify-end">
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <LogOut size={16} />
            Sign out
          </Link>
        </div>
      </Modal>
    </div>
  )
}
