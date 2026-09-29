"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Loader2,
  Lock,
  MapPin,
  Star,
  type LucideIcon,
} from "lucide-react"
import {
  formatTime,
  initials,
  themeById,
  useInputs,
  useProfile,
  type LiveInput,
  type Session,
  type Speaker,
} from "@/components/shared/summit-data"

/* ---------------------------------------------------------------- */
/* Brand                                                             */
/* ---------------------------------------------------------------- */
export function SkylineMark({
  className = "h-9 w-12",
  light = false,
}: {
  className?: string
  /** White version for dark backgrounds. */
  light?: boolean
}) {
  return (
    <svg viewBox="0 0 48 36" className={className} aria-hidden>
      <g fill={light ? "#ffffff" : "#13266b"}>
        <rect x="1" y="20" width="5" height="14" rx=".6" />
        <rect x="7" y="14" width="5" height="20" rx=".6" />
        <rect x="13" y="22" width="4" height="12" rx=".6" />
        <rect x="18" y="8" width="6" height="26" rx=".6" />
        <path d="M21 1.5 22.2 8h-2.4z" />
        <rect x="25" y="16" width="5" height="18" rx=".6" />
        <rect x="31" y="11" width="5" height="23" rx=".6" />
        <rect x="37" y="19" width="4" height="15" rx=".6" />
        <rect x="42" y="24" width="5" height="10" rx=".6" />
      </g>
      <g fill={light ? "#8fb3ff" : "#3f7bff"}>
        <rect x="8.5" y="17" width="2" height="2" />
        <rect x="19.8" y="12" width="2.4" height="2" />
        <rect x="19.8" y="17" width="2.4" height="2" />
        <rect x="32.5" y="15" width="2" height="2" />
      </g>
      <rect x="0" y="34" width="48" height="1.6" rx=".8" fill={light ? "#ffffff" : "#13266b"} />
    </svg>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-[#0f1e4d]">
      <SkylineMark />
      <div className="leading-none">
        <strong className="block text-[17px] font-bold tracking-tight">
          PAN IIT
        </strong>
        <span className="mt-0.5 block text-[12px] font-medium">
          Amaravati Summit 2026
        </span>
        <span className="mt-1 block text-[6.5px] font-semibold tracking-[.32em] text-[#5e6a85]">
          IDEAS · PEOPLE · IMPACT
        </span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Illustrations (cut from the approved illustration sheet)         */
/* ---------------------------------------------------------------- */
export type Art =
  | "skyline-hero"
  | "skyline-soft"
  | "skyline-card"
  | "skyline-faded"
  | "lightbulb"
  | "podium"
  | "audience"
  | "success"
  | "venue"
  | "waves-leaves"
  | "leaves"

export function Illus({
  name,
  className = "",
  priority = false,
}: {
  name: Art
  className?: string
  priority?: boolean
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/illustrations/${name}.webp`}
      alt=""
      aria-hidden
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`pointer-events-none select-none ${className}`}
    />
  )
}

/** Page header: sunrise wash, title on the left, illustration on the right. */
export function PageHero({
  title,
  subtitle,
  art,
  back,
  children,
}: {
  title: string
  subtitle?: string
  art?: Art
  back?: string | true
  children?: ReactNode
}) {
  return (
    <section className="sunrise relative -mt-px overflow-hidden px-5 pt-7 pb-7">
      {back && <BackButton href={back === true ? undefined : back} />}
      <div className="relative flex items-end gap-2">
        <div className="relative z-10 min-w-0 flex-1 pb-1">
          <h1 className="font-display text-[28px] leading-[1.1] text-[#0f1e4d]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[15px] leading-snug text-[#5e6a85]">
              {subtitle}
            </p>
          )}
        </div>
        {art && <Illus name={art} priority className="w-[38%] max-w-40 shrink-0" />}
      </div>
      {children}
    </section>
  )
}

export function BackButton({ href }: { href?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="Back"
      className="-ml-2 mb-2 grid h-10 w-10 place-items-center rounded-full text-[#0f1e4d] hover:bg-white/60"
    >
      <ArrowLeft size={22} />
    </button>
  )
}

/* ---------------------------------------------------------------- */
/* Cards & pills                                                     */
/* ---------------------------------------------------------------- */
const tones = {
  amber: { card: "bg-[#fff3d6]", dot: "bg-[#f7b500] text-white" },
  blue: { card: "bg-[#eef4ff]", dot: "bg-[#0b57f5] text-white" },
  lavender: { card: "bg-[#f3effe]", dot: "bg-[#7c66fc] text-white" },
  green: { card: "bg-[#e6f6ef]", dot: "bg-[#12a37a] text-white" },
}
export function FeatureCard({
  href,
  tone,
  icon: Icon,
  title,
  text,
}: {
  href: string
  tone: keyof typeof tones
  icon: LucideIcon
  title: string
  text: string
}) {
  return (
    <Link
      href={href}
      className={`tap-card flex items-center gap-4 rounded-2xl p-4 ${tones[tone].card}`}
    >
      <span
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${tones[tone].dot}`}
      >
        <Icon size={26} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[19px] font-bold tracking-tight text-[#0f1e4d]">
          {title}
        </strong>
        <span className="mt-0.5 block text-[14px] leading-snug text-[#5e6a85]">
          {text}
        </span>
      </span>
      <ChevronDot />
    </Link>
  )
}
export function ChevronDot() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#0f1e4d] shadow-sm">
      <ChevronRight size={17} />
    </span>
  )
}

const pillTones = {
  live: "bg-[#12a37a] text-white",
  red: "bg-[#e5373b] text-white",
  paused: "bg-[#fff1d0] text-[#8a5a00]",
  closed: "bg-[#eef1f6] text-[#4a5572]",
  upcoming: "bg-[#eef4ff] text-[#1d3fa8]",
  sent: "bg-[#e6f6ef] text-[#0b7a5a]",
  queued: "bg-[#fff1d0] text-[#8a5a00]",
  neutral: "bg-[#f1f4fa] text-[#44506e]",
}
export function Pill({
  tone,
  children,
}: {
  tone: keyof typeof pillTones
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] leading-none font-semibold whitespace-nowrap ${pillTones[tone]}`}
    >
      {children}
    </span>
  )
}

export function SessionStatusPill({
  session,
  locked,
  compact,
}: {
  session: Session
  locked?: boolean
  /** In the schedule the time is already shown, so just say "Upcoming". */
  compact?: boolean
}) {
  if (locked)
    return (
      <Pill tone="neutral">
        <Lock size={11} /> Invited only
      </Pill>
    )
  switch (session.status) {
    case "Live":
      return <Pill tone="live">Live Now</Pill>
    case "Paused":
      return <Pill tone="paused">Paused</Pill>
    case "Closed":
      return <Pill tone="closed">Closed</Pill>
    default:
      return (
        <Pill tone="upcoming">
          {compact ? "Upcoming" : `Opens ${formatTime(session.time).start}`}
        </Pill>
      )
  }
}

/** Schedule row from the Live Sessions mockup: time column + theme bar. */
export function SessionRow({
  session,
  href,
  locked,
}: {
  session: Session
  href: string
  locked?: boolean
}) {
  const t = themeById(session.theme)
  const [start = "", end = ""] = session.time.split(/[–-]/)
  const live = session.status === "Live"
  return (
    <Link
      href={href}
      className={`tap-card relative flex items-center gap-3 overflow-hidden rounded-2xl border py-3.5 pr-3 pl-4 ${live ? "border-[#cfe0ff] bg-[#f3f7ff]" : "border-[#e8edf6] bg-white"}`}
    >
      <span
        className="absolute inset-y-3 left-0 w-1 rounded-r-full"
        style={{ background: t.accent }}
      />
      <span className="num w-[52px] shrink-0 text-[14px] leading-tight whitespace-nowrap text-[#44506e]">
        {start.trim()}
        <br />
        <span className="text-[#8a93ab]">– </span>
        {end.trim()}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-[15px] leading-snug font-semibold text-[#0f1e4d]">
          {session.title}
        </strong>
        <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[#5e6a85]">
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {session.venue}
          </span>
          <SessionStatusPill session={session} locked={locked} compact />
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-[#0f1e4d]" />
    </Link>
  )
}

export function SessionMeta({ session }: { session: Session }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[#44506e]">
      <span className="flex items-center gap-1.5">
        <Clock3 size={15} /> {formatTime(session.time).range}
      </span>
      <span className="flex items-center gap-1.5">
        <MapPin size={15} /> {session.venue}
      </span>
    </p>
  )
}

export function SpeakerChips({
  speakers,
  accent,
  soft,
}: {
  speakers: Speaker[]
  accent: string
  soft: string
}) {
  const list = speakers.filter((s) => s.name)
  if (!list.length) return null
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {list.map((s, i) => (
        <div
          key={i}
          className="flex shrink-0 items-center gap-2 rounded-full border border-[#e8edf6] bg-white py-1.5 pr-3.5 pl-1.5"
        >
          {s.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold"
              style={{ background: soft, color: accent }}
            >
              {initials(s.name)}
            </span>
          )}
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold text-[#0f1e4d]">
              {s.name}
            </span>
            {s.role && (
              <span className="block text-[11px] text-[#5e6a85]">{s.role}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Tabs                                                              */
/* ---------------------------------------------------------------- */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="tablist" className="flex border-b border-[#e4e9f3]">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`relative min-h-12 flex-1 text-[15px] font-medium transition-colors ${value === t.id ? "text-[#0b57f5]" : "text-[#5e6a85]"}`}
        >
          {t.label}
          {value === t.id && (
            <span className="absolute inset-x-4 -bottom-px h-[3px] rounded-full bg-[#0b57f5]" />
          )}
        </button>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Form fields                                                       */
/* ---------------------------------------------------------------- */
const fieldClass =
  "w-full rounded-xl border border-[#dfe5f0] bg-white px-4 text-[15px] text-[#0f1e4d] placeholder:text-[#9aa3ba] focus:border-[#0b57f5] focus:outline-none"

export function TextField({
  label,
  required,
  max,
  value,
  onChange,
  placeholder,
  multiline,
  rows = 4,
  autoFocus,
}: {
  label: string
  required?: boolean
  max: number
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
  autoFocus?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] font-semibold text-[#0f1e4d]">
        {label}
        {required ? (
          <span className="text-[#e5373b]"> *</span>
        ) : (
          <span className="font-normal text-[#8a93ab]"> (optional)</span>
        )}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, max))}
          placeholder={placeholder}
          rows={rows}
          autoFocus={autoFocus}
          className={`${fieldClass} resize-none py-3 leading-relaxed`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, max))}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`${fieldClass} min-h-12`}
        />
      )}
      <span className="num mt-1 block text-right text-[12px] text-[#8a93ab]">
        {value.length}/{max}
      </span>
    </label>
  )
}
export const selectClass = `${fieldClass} min-h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%230f1e4d' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_14px_center] bg-no-repeat pr-10`

export function Stars({
  value,
  onChange,
  size = 36,
}: {
  value: number
  onChange: (n: number) => void
  size?: number
}) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className="transition-transform active:scale-90"
        >
          <Star
            size={size}
            strokeWidth={1.5}
            className={n <= value ? "fill-[#f7b500] text-[#f7b500]" : "text-[#c9d0df]"}
          />
        </button>
      ))}
    </div>
  )
}

export function PrimaryButton({
  children,
  busy,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={`inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0b57f5] px-5 text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(11,87,245,.25)] transition-[background-color,transform] hover:bg-[#0848d0] active:translate-y-px disabled:bg-[#9db7f5] disabled:shadow-none ${className}`}
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : null}
      {children}
    </button>
  )
}
export function SecondaryButton({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl border border-[#0b57f5]/35 bg-white px-5 text-[16px] font-semibold text-[#0b57f5] hover:bg-[#f3f7ff] disabled:opacity-50 ${className}`}
    />
  )
}

/* ---------------------------------------------------------------- */
/* States                                                            */
/* ---------------------------------------------------------------- */
export function StateCard({
  icon: Icon,
  tone = "blue",
  title,
  text,
  children,
}: {
  icon: LucideIcon
  tone?: "blue" | "amber" | "slate"
  title: string
  text?: string
  children?: ReactNode
}) {
  const c = {
    blue: "bg-[#eef4ff] text-[#0b57f5]",
    amber: "bg-[#fff3d6] text-[#b27700]",
    slate: "bg-[#f1f4fa] text-[#44506e]",
  }[tone]
  return (
    <div className="card-soft p-6 text-center">
      <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${c}`}>
        <Icon size={26} />
      </span>
      <h2 className="mt-4 text-[19px] font-bold text-[#0f1e4d]">{title}</h2>
      {text && (
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#5e6a85]">{text}</p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* NFR-03: submit that never loses input on a weak network         */
/* ---------------------------------------------------------------- */
export function useSubmit() {
  const [, setInputs] = useInputs()
  const [profile] = useProfile()
  const [busy, setBusy] = useState(false)
  /**
   * Resolves "sent" only after the save is confirmed. Offline, the input is
   * kept on the phone as "queued" and sent when the connection returns
   * (MobileShell). Each input has a client id, so a retry is saved once.
   */
  const submit = async (
    item: Omit<LiveInput, "id" | "at" | "delivery"> & { id?: string }
  ): Promise<"sent" | "queued"> => {
    const record: LiveInput = {
      at: new Date()
        .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
        .toUpperCase(),
      org: profile?.organisation,
      ...item,
      id: item.id ?? `u${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
    }
    const upsert = (delivery: "sent" | "queued") =>
      setInputs((list) =>
        list.some((x) => x.id === record.id)
          ? list.map((x) => (x.id === record.id ? { ...x, ...record, delivery } : x))
          : [...list, { ...record, delivery }]
      )
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      upsert("queued")
      return "queued"
    }
    setBusy(true)
    await new Promise((r) => setTimeout(r, 650))
    upsert("sent")
    setBusy(false)
    return "sent"
  }
  return { submit, busy }
}

export function QueuedNotice() {
  return (
    <p className="rounded-xl bg-[#fff3d6] p-3 text-[14px] leading-snug text-[#8a5a00]">
      You&apos;re offline. It&apos;s saved on this phone and will be sent
      automatically when you&apos;re back online.
    </p>
  )
}
