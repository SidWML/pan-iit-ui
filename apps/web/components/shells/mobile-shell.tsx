"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  Compass,
  LogOut,
  MessageSquareHeart,
  Radio,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Brand } from "@/components/shared/brand"

const nav = [
  { label: "Discover", href: "/app/home", icon: Compass },
  { label: "Live", href: "/app/sessions", icon: Radio },
  { label: "My Impact", href: "/app/activity", icon: Sparkles },
]
const menu = [
  { label: "Edit profile", href: "/profile/setup", icon: UserRound },
  { label: "Summit feedback", href: "/app/feedback", icon: MessageSquareHeart },
  { label: "Privacy & consent", href: "/consent", icon: ShieldCheck },
]

export function MobileShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
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
  return (
    <div className="min-h-svh bg-[#e9edf5]">
      <div className="relative mx-auto min-h-svh max-w-md overflow-hidden bg-[#f8f9fd] pb-28 shadow-2xl">
        <header className="relative z-30 flex h-16 items-center justify-between bg-[#071f46] px-5 text-white">
          <Brand />
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpen(!open)}
              aria-label="Account menu"
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-gradient-to-br from-amber-200 to-orange-300 text-xs font-extrabold text-amber-950 shadow-lg"
            >
              AM
            </button>
            {open && (
              <div className="float-in absolute top-12 right-0 w-56 rounded-2xl border bg-white p-2 text-slate-900 shadow-2xl">
                <div className="border-b px-3 pt-1 pb-2">
                  <p className="text-sm font-bold">Arjun Mehta</p>
                  <p className="text-xs text-muted-foreground">Attendee</p>
                </div>
                <div className="grid gap-0.5 pt-1">
                  {menu.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      <Icon size={16} className="text-slate-500" />
                      {label}
                    </Link>
                  ))}
                  <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Sign out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>
        <main>{children}</main>
        <nav className="glass fixed bottom-3 left-1/2 z-30 grid h-16 w-[calc(100%-24px)] max-w-[408px] -translate-x-1/2 grid-cols-3 rounded-2xl border border-white/80 px-2 shadow-[0_12px_40px_rgba(8,31,70,.16)]">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = path === href || path.startsWith(href + "/")
            return (
              <Link
                href={href}
                key={href}
                aria-current={active ? "page" : undefined}
                className={`grid place-items-center gap-0.5 rounded-xl text-[10px] font-bold transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:text-slate-900"}`}
              >
                <Icon size={19} />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
