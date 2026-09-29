"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  ClipboardList,
  House,
  Lightbulb,
  LogOut,
  ShieldCheck,
  Star,
  UserRound,
  Users,
  WifiOff,
} from "lucide-react"
import { Logo } from "@/components/modules/attendee/kit"
import {
  ME,
  initials,
  useEventConfig,
  useInputs,
  useProfile,
} from "@/components/shared/summit-data"

const nav = [
  { label: "Home", href: "/app/home", icon: House },
  { label: "Ideas", href: "/app/ideas", icon: Lightbulb },
  { label: "Live Sessions", href: "/app/sessions", icon: Users },
  { label: "My Submissions", href: "/app/submissions", icon: ClipboardList },
]

export function MobileShell({
  children,
  bare = false,
}: {
  children: React.ReactNode
  /** Hide the bottom navigation (focused flows such as forms). */
  bare?: boolean
}) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [offline, setOffline] = useState(false)
  const [profile] = useProfile()
  const [config] = useEventConfig()
  const [, setInputs] = useInputs()
  const menuRef = useRef<HTMLDivElement>(null)
  const name = profile?.name || ME

  // NFR-03: send anything held on the phone once the network is back.
  useEffect(() => {
    const flush = () =>
      setInputs((list) =>
        list.some((i) => i.delivery === "queued")
          ? list.map((i) => (i.delivery === "queued" ? { ...i, delivery: "sent" } : i))
          : list
      )
    const update = () => {
      setOffline(!navigator.onLine)
      if (navigator.onLine) flush()
    }
    const t = window.setTimeout(update, 0)
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [setInputs])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("touchstart", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("touchstart", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const menu = [
    { label: "Edit profile", href: "/profile/setup?edit=1", icon: UserRound },
    ...(config.summitFeedbackOpen
      ? [{ label: "Summit feedback", href: "/app/feedback", icon: Star }]
      : []),
    { label: "Privacy notice", href: "/app/privacy", icon: ShieldCheck },
  ]

  return (
    <div className="min-h-svh bg-[#e9edf5]">
      <div
        className={`relative mx-auto min-h-svh max-w-md bg-[#f6f8fd] shadow-[0_0_60px_rgba(15,30,77,.08)] ${bare ? "pb-8" : "pb-24"}`}
      >
        <header className="relative z-30 flex h-[72px] items-center justify-between bg-[#fdebd3] px-5">
          <Link href="/app/home" aria-label="Home">
            <Logo />
          </Link>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpen(!open)}
              aria-label="Account menu"
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-full bg-[#dce7ff] text-[15px] font-semibold text-[#0b57f5]"
            >
              {initials(name)}
            </button>
            {open && (
              <div className="float-in absolute top-13 right-0 w-64 rounded-2xl border border-[#e8edf6] bg-white p-2 shadow-[0_18px_50px_rgba(15,30,77,.18)]">
                <div className="border-b border-[#eef1f6] px-3 pt-2 pb-3">
                  <p className="text-[15px] font-semibold text-[#0f1e4d]">{name}</p>
                  <p className="text-[13px] text-[#5e6a85]">
                    {profile?.organisation || "Attendee"}
                  </p>
                </div>
                <div className="grid pt-1">
                  {menu.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] text-[#0f1e4d] hover:bg-[#f6f8fd]"
                    >
                      <Icon size={18} className="text-[#5e6a85]" />
                      {label}
                    </Link>
                  ))}
                  <Link
                    href="/login"
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] text-[#e5373b] hover:bg-[#fdecec]"
                  >
                    <LogOut size={18} />
                    Sign out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>
        {offline && (
          <div
            role="status"
            className="sticky top-0 z-20 flex items-center gap-2 bg-[#0f1e4d] px-5 py-2.5 text-[13px] text-white"
          >
            <WifiOff size={15} />
            You&apos;re offline. Anything you submit is saved and sent later.
          </div>
        )}
        <main>{children}</main>
        {!bare && (
          <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-md -translate-x-1/2 grid-cols-4 border-t border-[#e8edf6] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
            {nav.map(({ label, href, icon: Icon }) => {
              const active = path === href || path.startsWith(href + "/")
              return (
                <Link
                  href={href}
                  key={href}
                  aria-current={active ? "page" : undefined}
                  className={`grid h-[70px] place-items-center content-center gap-0.5 text-[12px] ${active ? "font-semibold text-[#0b57f5]" : "text-[#5e6a85]"}`}
                >
                  <span
                    className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${active ? "bg-[#e3ecff]" : ""}`}
                  >
                    <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                  </span>
                  {label}
                </Link>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}
