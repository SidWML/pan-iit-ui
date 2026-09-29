"use client"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleStop,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Lightbulb,
  Loader2,
  MapPin,
  MessageCircle,
  PauseCircle,
  PenLine,
  Play,
  Presentation,
  Radio,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  type LucideIcon,
} from "lucide-react"
import { DesktopShell } from "@/components/shells/desktop-shell"
import {
  Badge,
  Button,
  Card,
  Kbd,
  type Tone,
} from "@/components/ui/primitives"
import { Modal } from "@/components/shared/modal"
import { Illus } from "@/components/modules/attendee/kit"
import { SessionQrPanel } from "@/components/shared/session-qr"
import {
  COORDINATOR,
  OUTCOME_SECTIONS,
  formatTime,
  isFlagged,
  startMinutes,
  themeById,
  useFeedback,
  useInputStates,
  useInputs,
  useNotes,
  useOutcomes,
  useSessions,
  useShortlistOrder,
  type InputKind,
  type InputState,
  type LiveInput,
  type Outcome,
  type Session,
  matchesSessionId,
} from "@/components/shared/summit-data"

/* ================================================================ */
/* Shared bits                                                       */
/* ================================================================ */
const nav = [{ label: "My Sessions", href: "/coordinator/sessions", icon: CalendarDays }]
const byStart = (a: Session, b: Session) => startMinutes(a.time) - startMinutes(b.time)

function useMySessions() {
  const [sessions, setSessions, ready] = useSessions()
  const mine = sessions.filter((s) => s.coordinator === COORDINATOR.name).sort(byStart)
  return { sessions, mine, setSessions, ready }
}

function StatusDot({ status }: { status: string }) {
  const c =
    status === "Live"
      ? "bg-[#12a37a] live-pulse"
      : status === "Paused"
        ? "bg-[#f5a300]"
        : status === "Closed"
          ? "bg-[#a4acbf]"
          : "border-2 border-[#8fb0f7] bg-white"
  return <span className={`h-2 w-2 shrink-0 rounded-full ${c}`} />
}

function CoordShell({
  children,
  fullBleed,
}: {
  children: ReactNode
  fullBleed?: boolean
}) {
  const { mine } = useMySessions()
  const { id } = useParams<{ id?: string }>()
  return (
    <DesktopShell
      role="Coordinator"
      nav={nav}
      fullBleed={fullBleed}
      sidebarExtra={(mini) => (
        <div className="mt-5">
          {!mini && (
            <p className="px-2.5 pb-2 text-[11px] font-semibold tracking-wider text-blue-100/45 uppercase">
              Assigned to you
            </p>
          )}
          {mine.map((s) => {
            const active = id?.toLowerCase() === s.id.toLowerCase()
            return (
              <Link
                key={s.id}
                href={`/coordinator/sessions/${s.id}`}
                title={mini ? `${s.title} · ${s.status}` : undefined}
                className={`flex h-9 items-center gap-2.5 rounded-lg text-[13px] ${mini ? "justify-center" : "px-2.5"} ${active ? "bg-white/12 font-medium text-white" : "text-blue-100/75 hover:bg-white/7 hover:text-white"}`}
              >
                <StatusDot status={s.status} />
                {!mini && (
                  <>
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    <span className="num text-[11.5px] text-blue-100/50">
                      {s.time.split(/[–-]/)[0]}
                    </span>
                  </>
                )}
              </Link>
            )
          })}
        </div>
      )}
    >
      {children}
    </DesktopShell>
  )
}

/* KPI tiles: white cards so they read against the tinted headers. Tiles
   that need action switch to a solid icon and coloured edge when non-zero. */
const kpiPalette = {
  blue: ["#0b57f5", "#e8efff"],
  green: ["#12a37a", "#e3f6ee"],
  amber: ["#e08e00", "#fff1d2"],
  red: ["#e5373b", "#fdefef"],
  purple: ["#7c5cfa", "#efe9ff"],
} as const
const kpiTone: Record<string, [keyof typeof kpiPalette, boolean]> = {
  Assigned: ["blue", false],
  "Live now": ["green", false],
  "New to review": ["blue", true],
  New: ["blue", true],
  Flagged: ["red", true],
  "Outcomes due": ["amber", true],
  Questions: ["blue", false],
  Ideas: ["amber", false],
  Opinions: ["purple", false],
  "+1s": ["blue", false],
  "Note lines": ["amber", false],
  "Moderated inputs": ["blue", false],
  Shortlisted: ["blue", false],
  Discussed: ["green", false],
  Feedback: ["purple", false],
}

function KpiTile({
  label,
  value,
  icon: Icon,
  onClick,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  onClick?: () => void
}) {
  const [tone, alertable] = kpiTone[label] ?? ["blue", false]
  const [c, soft] = kpiPalette[tone]
  const alert = alertable && typeof value === "number" && value > 0
  const body = (
    <>
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={alert ? { background: c, color: "#fff" } : { background: soft, color: c }}
      >
        <Icon size={17} />
      </span>
      <span className="leading-tight">
        <span className="num block text-[18px] font-semibold" style={{ color: alert ? c : "#0f1e4d" }}>
          {value}
        </span>
        <span className="block text-[12px] whitespace-nowrap text-[#5e6a85]">{label}</span>
      </span>
    </>
  )
  const cls =
    "flex h-14 shrink-0 items-center gap-3 rounded-xl border bg-white pr-4 pl-2.5 text-left shadow-[0_1px_2px_rgba(15,30,77,.06)]"
  const style = { borderColor: alert ? `${c}80` : "#e1e6ef", borderWidth: alert ? 1.5 : 1 }
  return onClick ? (
    <button
      onClick={onClick}
      className={`${cls} transition-colors hover:border-[#c5cedd] hover:bg-[#fbfcff]`}
      style={style}
    >
      {body}
    </button>
  ) : (
    <div className={cls} style={style}>
      {body}
    </div>
  )
}

/** Re-renders every second while active. Returns null on the server. */
function useNow(active = true) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    if (!active) return
    const tick = () => setNow(Date.now())
    const first = window.setTimeout(tick, 0)
    const t = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(t)
    }
  }, [active])
  return now
}

const durationMin = (time: string) => {
  const [a = "", b = ""] = time.split(/[–-]/)
  return Math.max(0, startMinutes(b) - startMinutes(a))
}
const mmss = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, "0")
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`
}
const clock = (t: number) =>
  new Date(t)
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    .toUpperCase()

const OUTCOME_WINDOW = 30 * 60 * 1000

/** Inputs in a session that the coordinator hasn't acted on yet. */
const unreviewed = (inputs: LiveInput[], states: Record<string, InputState>, id: string) =>
  inputs.filter((i) => i.sessionId === id && !Object.values(states[i.id] ?? {}).some(Boolean))
    .length

function outcomeTone(o?: Outcome): Tone {
  if (!o) return "gray"
  return o.status === "Finalised"
    ? "green"
    : o.status === "Submitted"
      ? "blue"
      : o.status === "Changes requested"
        ? "amber"
        : "gray"
}

/* ================================================================ */
/* Home: assigned sessions with the next action for each             */
/* ================================================================ */
export function CoordinatorSessions() {
  const { mine, ready } = useMySessions()
  const [inputs] = useInputs()
  const [states] = useInputStates()
  const [outcomes] = useOutcomes()
  const now = useNow()
  const hour = now ? new Date(now).getHours() : 9
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const mineIds = new Set(mine.map((s) => s.id))
  const running = mine.filter((s) => s.status === "Live" || s.status === "Paused")
  const toReview = running.reduce((n, s) => n + unreviewed(inputs, states, s.id), 0)
  const flagged = inputs.filter(
    (i) =>
      i.sessionId &&
      mineIds.has(i.sessionId) &&
      isFlagged(i.text) &&
      !states[i.id]?.allowed &&
      !states[i.id]?.hidden
  ).length
  const needsOutcome = (s: Session) =>
    s.status === "Closed" &&
    (!outcomes[s.id] ||
      outcomes[s.id]!.status === "Draft" ||
      outcomes[s.id]!.status === "Changes requested")
  const due = mine.filter(needsOutcome)
  // One list, most urgent first: live → outcome due → coming up → done.
  const rank = (x: Session) =>
    x.status === "Live" || x.status === "Paused" ? 0 : needsOutcome(x) ? 1 : x.status === "Upcoming" ? 2 : 3
  const ordered = [...mine].sort((x, y) => rank(x) - rank(y) || startMinutes(x.time) - startMinutes(y.time))

  const tiles: { label: string; n: number; icon: LucideIcon; c: string; bg: string; hot?: string }[] = [
    { label: "Assigned", n: mine.length, icon: CalendarDays, c: "text-[#1e4fd8]", bg: "#e8efff" },
    { label: "Live now", n: running.length, icon: Radio, c: "text-[#0d8a62]", bg: "#e3f6ee" },
    {
      label: "New to review",
      n: toReview,
      icon: Sparkles,
      c: "text-[#1e4fd8]",
      bg: "#e8efff",
      hot: "bg-[#0b57f5] text-white ring-[#0b57f5]",
    },
    {
      label: "Flagged",
      n: flagged,
      icon: AlertTriangle,
      c: "text-[#c62828]",
      bg: "#ffffff",
      hot: "bg-[#fdefef] text-[#c62828] ring-[#f3c6c7]",
    },
    {
      label: "Outcomes due",
      n: due.length,
      icon: FileText,
      c: "text-[#9a6100]",
      bg: "#fff1d2",
      hot: "bg-[#f5a300] text-white ring-[#f5a300]",
    },
  ]

  return (
    <CoordShell fullBleed>
      <header
        className="relative overflow-hidden border-b border-[#e6eaf2]"
        style={{ background: "linear-gradient(100deg, #fff3dc 0%, #eef3ff 55%, #ffffff 100%)" }}
      >
        <span className="absolute inset-x-0 top-0 h-[3px] bg-[#0b57f5]" />
        <Illus
          name="skyline-soft"
          priority
          className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-auto opacity-80 lg:block"
        />
        <div className="relative px-4 pt-6 pb-4 md:px-6">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[11.5px] font-semibold tracking-wide text-[#1e4fd8] uppercase shadow-[inset_0_0_0_1px_rgba(11,87,245,.2)]">
            <CalendarDays size={12} /> Sat 3 Oct · Coordinator
          </span>
          <h1 className="mt-2 text-[24px] leading-tight font-semibold tracking-[-0.02em] text-[#0f1e4d] md:text-[28px]">
            {greet}, {COORDINATOR.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[13.5px] text-[#5e6a85]">
            {mine.length} session{mine.length === 1 ? "" : "s"} assigned to you
            {running.length ? ` · ${running.length} live now` : ""}
          </p>
        </div>
        <div className="relative flex gap-2 overflow-x-auto px-4 pb-4 md:px-6">
          {tiles.map(({ label, n, icon }) => (
            <KpiTile key={label} label={label} value={n} icon={icon} />
          ))}
        </div>
      </header>

      <div className="px-3 py-4 md:px-6 md:py-5">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h2 className="text-[15px] font-semibold text-[#0f1e4d]">Today&apos;s sessions</h2>
          <span className="hidden text-[12.5px] text-[#6b7690] sm:inline">Most urgent first · only sessions assigned to you</span>
        </div>
        {ready && mine.length === 0 && (
          <Card className="p-8 text-center text-[13.5px] text-[#6b7690]">
            No sessions are assigned to you yet. The admin team assigns coordinators.
          </Card>
        )}
        <div className="grid gap-2.5">
          {ordered.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              inputs={inputs}
              states={states}
              outcome={outcomes[s.id]}
              now={now}
            />
          ))}
        </div>
      </div>
    </CoordShell>
  )
}

function SessionCard({
  session: s,
  inputs,
  states,
  outcome,
  now,
}: {
  session: Session
  inputs: LiveInput[]
  states: Record<string, InputState>
  outcome?: Outcome
  now: number | null
}) {
  const t = themeById(s.theme)
  const pending = unreviewed(inputs, states, s.id)
  const flagged = inputs.filter(
    (i) => i.sessionId === s.id && isFlagged(i.text) && !states[i.id]?.allowed && !states[i.id]?.hidden
  ).length
  const workspace = `/coordinator/sessions/${s.id}`
  const outcomeHref = `${workspace}/outcome`
  const dueAt = s.closedAt ? s.closedAt + OUTCOME_WINDOW : null
  const minsLeft = dueAt && now ? Math.ceil((dueAt - now) / 60000) : null
  const [start = "", end = ""] = s.time.split(/[–-]/).map((x) => x.trim())
  const running = s.status === "Live" || s.status === "Paused"
  const outcomeOpen = s.status === "Closed" && (!outcome || outcome.status === "Draft" || outcome.status === "Changes requested")

  // Card state: edge colour, tint, status pill, info chip and the one action.
  let edge = "#0b57f5"
  let tint = "border-[#e3e8f1] bg-white"
  let cta = "Open workspace"
  let href = workspace
  let primary = false
  let pill: ReactNode = <Badge tone="blue">Upcoming</Badge>
  let chip: ReactNode = (
    <span className="num inline-flex h-6 items-center rounded-md bg-[#eef3ff] px-2 text-[12px] font-medium text-[#1e4fd8]">
      Starts {formatTime(s.time).start}
    </span>
  )
  if (running) {
    edge = s.status === "Live" ? "#e5373b" : "#f5a300"
    tint = s.status === "Live" ? "border-[#f5d3d4] bg-[#fffafa]" : "border-[#f6e0b3] bg-[#fffcf5]"
    cta = "Open workspace"
    primary = true
    pill =
      s.status === "Live" ? (
        <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-[#e5373b] px-2 text-[11.5px] font-semibold tracking-wide text-white uppercase">
          <span className="live-pulse h-1.5 w-1.5 rounded-full bg-white" /> Live
        </span>
      ) : (
        <Badge tone="amber">Paused</Badge>
      )
    chip =
      s.liveAt && now ? (
        <span className="num inline-flex h-6 items-center gap-1 rounded-md bg-[#e6f6ef] px-2 text-[12px] font-medium text-[#0d7a57]">
          <Clock3 size={12} /> {mmss(now - s.liveAt)} elapsed
        </span>
      ) : null
  } else if (outcomeOpen) {
    edge = "#f5a300"
    tint = "border-[#f6e0b3] bg-[#fffcf5]"
    cta = outcome?.status === "Changes requested" ? "Revise outcome" : outcome ? "Continue outcome" : "Write outcome"
    href = outcomeHref
    primary = true
    pill = <Badge tone="amber">{outcome?.status === "Changes requested" ? "Changes requested" : "Outcome due"}</Badge>
    chip =
      minsLeft !== null ? (
        <span
          className={`num inline-flex h-6 items-center gap-1 rounded-md px-2 text-[12px] font-medium ${minsLeft < 10 ? "bg-[#fdefef] text-[#c62828]" : "bg-[#fff1d2] text-[#9a6100]"}`}
        >
          <Clock3 size={12} /> {minsLeft >= 0 ? `${minsLeft} min left` : `${-minsLeft} min over`}
        </span>
      ) : null
  } else if (s.status === "Closed") {
    edge = outcome?.status === "Finalised" ? "#12a37a" : "#a4acbf"
    cta = "View outcome"
    href = outcomeHref
    pill = <Badge tone={outcomeTone(outcome)}>{outcome?.status === "Finalised" ? "Finalised" : "Awaiting approval"}</Badge>
    chip = null
  }

  return (
    <article
      className={`relative grid overflow-hidden rounded-xl border transition-shadow hover:shadow-[0_4px_14px_-8px_rgba(15,30,77,.18)] sm:grid-cols-[96px_minmax(0,1fr)] ${tint}`}
    >
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: edge }} />
      <div className="num hidden flex-col items-center justify-center border-r border-[#eef1f6] py-4 text-[15px] leading-tight font-semibold text-[#0f1e4d] sm:flex">
        {start}
        <span className="text-[#b5bccb]">–</span>
        {end}
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 pr-4 pl-5">
        <div className="min-w-0 flex-1 basis-72">
          <h3 className="flex items-center gap-2 text-[17px] leading-snug font-semibold text-[#0f1e4d]">
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-white"
              style={{ background: t.accent }}
              title={t.label}
            >
              <t.icon size={13} />
            </span>
            <span className="truncate">{s.title}</span>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[13px] text-[#5e6a85]">
            <span className="num sm:hidden">{s.time} ·</span>
            <MapPin size={13} className="text-[#8a93ab]" /> {s.venue}
            <span className="text-[#b5bccb]">·</span> {s.type}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {(["question", "idea", "opinion"] as InputKind[]).map((k) => {
              const K = kindMeta[k]
              return (
                <span
                  key={k}
                  title={`${K.label}s`}
                  className="num inline-flex h-6 min-w-10 items-center justify-center gap-1 rounded-md px-1.5 text-[12px] font-semibold"
                  style={{ background: `${kindEdge[k]}14`, color: kindEdge[k] }}
                >
                  <K.icon size={12} />
                  {inputs.filter((x) => x.sessionId === s.id && x.kind === k).length}
                </span>
              )
            })}
            {running && pending > 0 && (
              <span className="inline-flex h-6 items-center gap-1 rounded-md bg-[#0b57f5] px-2 text-[12px] font-semibold text-white">
                <Sparkles size={12} /> {pending} new
              </span>
            )}
            {flagged > 0 && (
              <span className="inline-flex h-6 items-center gap-1 rounded-md bg-[#fdefef] px-2 text-[12px] font-semibold text-[#c62828]">
                <AlertTriangle size={12} /> {flagged} flagged
              </span>
            )}
            {s.access === "Invited" && (
              <Badge tone="violet" dot={false}>
                Invited only
              </Badge>
            )}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            {pill}
            {chip}
          </div>
          <Link
            href={href}
            className={`inline-flex h-10 items-center justify-between gap-3 rounded-lg px-4 text-[13.5px] font-semibold transition-colors sm:min-w-44 ${primary ? "bg-[#0b57f5] text-white hover:bg-[#0a4ddb]" : "bg-white text-[#1e4fd8] ring-1 ring-[#c9d8ff] ring-inset hover:bg-[#f5f8ff]"}`}
          >
            {cta} <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ================================================================ */
/* Session workspace                                                 */
/* ================================================================ */
const kindMeta: Record<InputKind, { label: string; icon: LucideIcon; tint: string }> = {
  question: { label: "Question", icon: HelpCircle, tint: "bg-[#eef3ff] text-[#1e4fd8]" },
  idea: { label: "Idea", icon: Lightbulb, tint: "bg-[#fff6e5] text-[#b27000]" },
  opinion: { label: "Opinion", icon: MessageCircle, tint: "bg-[#f3efff] text-[#6d4df2]" },
}
type TypeFilter = "all" | InputKind
const chipColor: Record<StatusFilter, [string, string]> = {
  all: ["#0f1e4d", "#eef1f6"],
  new: ["#0b57f5", "#eef3ff"],
  visible: ["#0d8a62", "#e6f6ef"],
  shortlisted: ["#1e4fd8", "#eef3ff"],
  discussed: ["#44506e", "#eef1f6"],
  hidden: ["#5e6a85", "#f1f3f7"],
  flagged: ["#d4292f", "#fdefef"],
}
type StatusFilter =
  | "all"
  | "new"
  | "visible"
  | "shortlisted"
  | "discussed"
  | "hidden"
  | "flagged"
type Action = "visible" | "shortlisted" | "discussed" | "hidden"

export function ControlRoom() {
  const { id } = useParams<{ id: string }>()
  const { sessions, setSessions, ready } = useMySessions()
  const session = sessions.find((s) => matchesSessionId(s, id))
  if (!session)
    return (
      <CoordShell>
        {ready && (
          <Card className="p-8 text-center text-[14px] text-[#5e6a85]">
            Session not found.{" "}
            <Link href="/coordinator/sessions" className="font-medium text-[#0b57f5]">
              Back to my sessions
            </Link>
          </Card>
        )}
      </CoordShell>
    )
  return <Workspace session={session} setSessions={setSessions} />
}

function Workspace({
  session,
  setSessions,
}: {
  session: Session
  setSessions: ReturnType<typeof useSessions>[1]
}) {
  const router = useRouter()
  const [inputs, , inputsReady] = useInputs()
  const [states, setStates] = useInputStates()
  const [orders, setOrders] = useShortlistOrder()
  const [outcomes] = useOutcomes()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sort, setSort] = useState<"newest" | "votes">("newest")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [tab, setTab] = useState<"inputs" | "shortlist" | "notes">("inputs")
  const [railTab, setRailTab] = useState<"shortlist" | "notes">("shortlist")
  const [confirmClose, setConfirmClose] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrShown, setQrShown] = useState(false)
  const [presenting, setPresenting] = useState(false)
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null)
  const [seen, setSeen] = useState<string[] | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const all = useMemo(
    () => inputs.filter((i) => i.sessionId === session.id).reverse(),
    [inputs, session.id]
  )
  // New arrivals never push the list around; they wait behind a pill.
  useEffect(() => {
    if (!inputsReady || seen !== null) return
    const t = window.setTimeout(() => setSeen(all.map((i) => i.id)), 0)
    return () => window.clearTimeout(t)
  }, [inputsReady, seen, all])
  const arrived = seen ? all.filter((i) => !seen.includes(i.id)) : []
  const loaded = seen ? all.filter((i) => seen.includes(i.id)) : all

  const st = (i: LiveInput) => states[i.id] ?? {}
  const flagged = (i: LiveInput) => isFlagged(i.text) && !st(i).allowed
  const isNew = (i: LiveInput) => !Object.values(st(i)).some(Boolean) && !flagged(i)
  const counts = {
    all: loaded.length,
    question: loaded.filter((i) => i.kind === "question").length,
    idea: loaded.filter((i) => i.kind === "idea").length,
    opinion: loaded.filter((i) => i.kind === "opinion").length,
  }
  const matchStatus = (i: LiveInput, f: StatusFilter) => {
    const s = st(i)
    switch (f) {
      case "new":
        return isNew(i)
      case "visible":
        return !!s.visible && !s.hidden
      case "shortlisted":
        return !!s.shortlisted && !s.hidden
      case "discussed":
        return !!s.discussed
      case "hidden":
        return !!s.hidden
      case "flagged":
        return flagged(i)
      default:
        return true
    }
  }
  const byType = loaded.filter((i) => typeFilter === "all" || i.kind === typeFilter)
  const statusCount = (f: StatusFilter) => byType.filter((i) => matchStatus(i, f)).length
  const q = query.trim().toLowerCase()
  const shown = byType
    .filter((i) => matchStatus(i, statusFilter))
    .filter(
      (i) =>
        !q ||
        i.text.toLowerCase().includes(q) ||
        i.author.toLowerCase().includes(q) ||
        (i.org ?? "").toLowerCase().includes(q)
    )
    .sort((a, b) => (sort === "votes" ? b.votes - a.votes : 0))

  const order = (orders[session.id] ?? []).filter((x) => {
    const i = all.find((y) => y.id === x)
    return i && states[x]?.shortlisted && !states[x]?.hidden
  })
  const shortlist = order.map((x) => all.find((y) => y.id === x)!)

  const flash = useCallback((text: string, undo?: () => void) => {
    window.clearTimeout(toastTimer.current)
    setToast({ text, undo })
    toastTimer.current = window.setTimeout(() => setToast(null), 5000)
  }, [])

  const act = (i: LiveInput, a: Action) => {
    const prev = st(i)
    const prevOrder = orders[session.id] ?? []
    if (a === "visible" && flagged(i) && !prev.visible) return
    const on = !prev[a]
    const next: InputState = { ...prev, [a]: on }
    if (a === "hidden" && on) {
      next.visible = false
      next.shortlisted = false
    }
    if (a === "visible" && on) next.hidden = false
    if (a === "shortlisted" && on) next.hidden = false
    setStates((m) => ({ ...m, [i.id]: next }))
    setOrders((m) => {
      const cur = (m[session.id] ?? []).filter((x) => x !== i.id)
      return { ...m, [session.id]: next.shortlisted ? [...cur, i.id] : cur }
    })
    const label = {
      visible: on ? "Shown to the room" : "Removed from the room",
      shortlisted: on ? "Added to shortlist" : "Removed from shortlist",
      discussed: on ? "Marked discussed" : "Unmarked discussed",
      hidden: on ? "Hidden" : "Unhidden",
    }[a]
    flash(label, () => {
      setStates((m) => ({ ...m, [i.id]: prev }))
      setOrders((m) => ({ ...m, [session.id]: prevOrder }))
      setToast(null)
    })
  }
  const allow = (i: LiveInput) => {
    setStates((m) => ({ ...m, [i.id]: { ...st(i), allowed: true } }))
    flash("Reviewed and allowed")
  }

  const setStatus = (status: Session["status"]) => {
    setSessions((list) =>
      list.map((x) =>
        x.id === session.id
          ? {
              ...x,
              status,
              liveAt: status === "Live" && !x.liveAt ? Date.now() : x.liveAt,
              closedAt: status === "Closed" ? Date.now() : x.closedAt,
            }
          : x
      )
    )
    flash(
      status === "Live"
        ? "Session is live. Attendees can submit."
        : status === "Paused"
          ? "Paused. Attendees see “try again shortly”."
          : "Session closed. Feedback is now open for attendees."
    )
  }

  // Keyboard: J/K move, V/S/D/H act, / search, P present.
  const shownRef = useRef(shown)
  const actRef = useRef(act)
  useEffect(() => {
    shownRef.current = shown
    actRef.current = act
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (presenting || confirmClose || qrOpen) return
      if (el.closest("input, textarea, select, [contenteditable=true]")) {
        if (e.key === "Escape") el.blur()
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const list = shownRef.current
      const idx = list.findIndex((i) => i.id === selected)
      const key = e.key.toLowerCase()
      if (key === "j" || e.key === "ArrowDown") {
        e.preventDefault()
        setSelected(list[Math.min(list.length - 1, idx + 1)]?.id ?? null)
      } else if (key === "k" || e.key === "ArrowUp") {
        e.preventDefault()
        setSelected(list[Math.max(0, idx - 1)]?.id ?? list[0]?.id ?? null)
      } else if (e.key === "/") {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (key === "p") {
        setPresenting(true)
      } else if (idx >= 0 && "vsdh".includes(key) && key.length === 1) {
        const map: Record<string, Action> = {
          v: "visible",
          s: "shortlisted",
          d: "discussed",
          h: "hidden",
        }
        const item = list[idx]!
        if (key === "v" && (item.kind !== "question" || session.access === "Invited")) return
        actRef.current(item, map[key]!)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, presenting, confirmClose, qrOpen, session.access])
  useEffect(() => {
    if (!selected) return
    document.getElementById(`row-${selected}`)?.scrollIntoView({ block: "nearest" })
  }, [selected])

  const outcome = outcomes[session.id]
  const t = themeById(session.theme)
  // Before going live the moderation tools have nothing to show: use get-ready mode.
  const prep = session.status === "Upcoming" && loaded.length === 0

  const feed = (
    <div className="min-w-0">
      <div className="flex items-center gap-2 border-b border-[#eef1f6] p-3">
        <div className="-m-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto p-1">
          {(
            [
              ["all", "All inputs", counts.all, "#0f1e4d", "#eef1f6", null],
              ["question", "Questions", counts.question, "#0b57f5", "#eef3ff", HelpCircle],
              ["idea", "Ideas", counts.idea, "#d98a00", "#fff4dc", Lightbulb],
              ["opinion", "Opinions", counts.opinion, "#7c5cfa", "#f3efff", MessageCircle],
            ] as [TypeFilter, string, number, string, string, LucideIcon | null][]
          ).map(([id, label, n, c, soft, Icon]) => {
            const on = typeFilter === id
            return (
              <button
                key={id}
                onClick={() => setTypeFilter(id)}
                aria-pressed={on}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold whitespace-nowrap transition-all active:scale-95"
                style={
                  on
                    ? { background: c, color: "#fff" }
                    : { background: soft, color: c }
                }
              >
                {Icon && <Icon size={15} />}
                {label}
                <span
                  className="num rounded-md px-1.5 text-[12px] leading-5"
                  style={{ background: on ? "rgba(255,255,255,.22)" : "#fff" }}
                >
                  {n}
                </span>
              </button>
            )
          })}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "votes")}
          aria-label="Sort"
          className="h-9 shrink-0 rounded-lg border border-[#dfe4ee] bg-white px-2 text-[13px] text-[#0f1e4d]"
        >
          <option value="newest">Newest first</option>
          <option value="votes">Most +1</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-[#eef1f6] px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {(
          [
            ["all", "All"],
            ["new", "New"],
            ["flagged", "Flagged"],
            ["visible", "Visible"],
            ["shortlisted", "Shortlisted"],
            ["discussed", "Discussed"],
            ["hidden", "Hidden"],
          ] as [StatusFilter, string][]
        ).map(([f, label]) => {
          const n = statusCount(f)
          const on = statusFilter === f
          const warn = f === "flagged" && n > 0
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              aria-pressed={on}
              className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium transition-all"
              style={
                on
                  ? { background: chipColor[f][0], color: "#fff" }
                  : { background: chipColor[f][1], color: chipColor[f][0], opacity: n || warn ? 1 : 0.7 }
              }
            >
              {f === "flagged" && <AlertTriangle size={12} />}
              {label}
              <span className={`num ${on ? "text-white/75" : "opacity-70"}`}>{n}</span>
            </button>
          )
        })}
        </div>
        <div className="relative w-full sm:ml-auto sm:w-56">
          <Search
            size={15}
            className="absolute top-1/2 left-2.5 -translate-y-1/2 text-[#8a93ab]"
          />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search text, name, org"
            className="h-8 w-full rounded-md border border-[#dfe4ee] bg-white pr-8 pl-8 text-[13px] focus:border-[#0b57f5] focus:outline-none"
          />
          <span className="absolute top-1/2 right-2 hidden -translate-y-1/2 lg:block">
            <Kbd>/</Kbd>
          </span>
        </div>
      </div>

      {arrived.length > 0 && (
        <div className="flex justify-center border-b border-[#eef1f6] bg-[#f7f9fc] py-2">
          <button
            onClick={() => setSeen(all.map((i) => i.id))}
            className="pop-in inline-flex h-8 items-center gap-1.5 rounded-full bg-[#0b57f5] px-3.5 text-[12.5px] font-medium text-white"
          >
            <ArrowUp size={14} /> {arrived.length} new input{arrived.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      <ul role="listbox" aria-label="Inputs" className="grid gap-2.5 bg-[#f4f6fb] p-2.5 md:p-3">
        {shown.map((i) => (
          <InputRow
            key={i.id}
            input={i}
            state={st(i)}
            flagged={flagged(i)}
            fresh={isNew(i)}
            canShow={session.access === "Open"}
            selected={selected === i.id}
            shortIndex={order.indexOf(i.id)}
            onSelect={() => setSelected(i.id)}
            onAct={(a) => act(i, a)}
            onAllow={() => allow(i)}
          />
        ))}
      </ul>
      {shown.length === 0 && (
        <div className="grid place-items-center gap-2 px-6 py-14 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f1f4f9] text-[#8a93ab]">
            <MessageCircle size={20} />
          </span>
          <p className="text-[13.5px] text-[#5e6a85]">
            {loaded.length === 0
              ? session.status === "Upcoming"
                ? "Inputs appear here once you go live."
                : "No inputs yet. They arrive here in real time."
              : "Nothing matches these filters."}
          </p>
        </div>
      )}
      <p className="hidden flex-wrap items-center gap-3 border-t border-[#eef1f6] px-3 py-2.5 text-[12px] text-[#6b7690] lg:flex">
        <span className="flex items-center gap-1">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> move
        </span>
        <span className="flex items-center gap-1">
          <Kbd>V</Kbd> show
        </span>
        <span className="flex items-center gap-1">
          <Kbd>S</Kbd> shortlist
        </span>
        <span className="flex items-center gap-1">
          <Kbd>D</Kbd> discussed
        </span>
        <span className="flex items-center gap-1">
          <Kbd>H</Kbd> hide
        </span>
        <span className="flex items-center gap-1">
          <Kbd>P</Kbd> present
        </span>
      </p>
    </div>
  )

  return (
    <CoordShell fullBleed>
      <header
        className="relative overflow-hidden border-b border-[#e6eaf2]"
        style={{ background: `linear-gradient(100deg, ${t.soft} 0%, #ffffff 55%)` }}
      >
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: t.accent }} />
        <div className="relative flex flex-col gap-3 px-4 pt-5 pb-4 sm:flex-row sm:items-center sm:gap-4 md:px-6">
          <div className="flex w-full min-w-0 flex-1 items-start gap-3">
            <Link
              href="/coordinator/sessions"
              aria-label="Back to my sessions"
              className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/70 text-[#44506e] ring-1 ring-[#e3e7ef] hover:bg-white"
            >
              <ArrowLeft size={17} />
            </Link>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[11.5px] font-semibold tracking-wide uppercase ring-1 ring-inset"
                  style={{ color: t.accent, boxShadow: `inset 0 0 0 1px ${t.accent}33` }}
                >
                  <t.icon size={12} /> {session.type}
                </span>
                {session.access === "Invited" && (
                  <span className="text-[12px] text-[#6b7690]">
                    Invited only · never shown to attendees
                  </span>
                )}
              </p>
              <h1 className="mt-1.5 truncate text-[22px] leading-tight font-semibold tracking-[-0.02em] text-[#0f1e4d] md:text-[26px]">
                {session.title}
              </h1>
              <p className="mt-0.5 text-[13px] text-[#5e6a85]">
                {formatTime(session.time).range} · {session.venue}
                {session.speakers.some((x) => x.name) &&
                  ` · ${session.speakers.filter((x) => x.name).length} speakers`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LiveTimer session={session} />
            {!prep && (
              <StatusControl
                status={session.status}
                onChange={(x) => (x === "Closed" ? setConfirmClose(true) : setStatus(x))}
              />
            )}
            <Button
              variant="secondary"
              onClick={() => {
                setQrShown(true)
                setQrOpen(true)
              }}
              aria-label="Session QR code"
            >
              <QrCode size={16} /> <span className="hidden sm:inline">QR</span>
            </Button>
          </div>
        </div>

        {/* Live pulse: the numbers that decide what to do next */}
        <div className={`relative flex gap-2 overflow-x-auto px-4 pb-4 md:px-6 ${prep ? "hidden" : ""}`}>
          {(
            [
              { label: "Questions", n: counts.question, icon: HelpCircle, c: "text-[#1e4fd8]", go: () => { setTypeFilter("question"); setStatusFilter("all") } },
              { label: "Ideas", n: counts.idea, icon: Lightbulb, c: "text-[#b27000]", go: () => { setTypeFilter("idea"); setStatusFilter("all") } },
              { label: "Opinions", n: counts.opinion, icon: MessageCircle, c: "text-[#6d4df2]", go: () => { setTypeFilter("opinion"); setStatusFilter("all") } },
              { label: "+1s", n: loaded.reduce((n, i) => n + i.votes, 0), icon: ArrowUp, c: "text-[#1e4fd8]", go: () => { setTypeFilter("question"); setSort("votes") } },
              { label: "New", n: loaded.filter(isNew).length, icon: Sparkles, c: "text-[#1e4fd8]", hot: "bg-[#0b57f5] text-white ring-[#0b57f5]", go: () => { setTypeFilter("all"); setStatusFilter("new") } },
              { label: "Flagged", n: loaded.filter(flagged).length, icon: AlertTriangle, c: "text-[#c62828]", hot: "bg-[#fdefef] text-[#c62828] ring-[#f3c6c7]", go: () => { setTypeFilter("all"); setStatusFilter("flagged") } },
            ] as { label: string; n: number; icon: LucideIcon; c: string; hot?: string; go: () => void }[]
          ).map(({ label, n, icon, go }) => (
            <KpiTile key={label} label={label} value={n} icon={icon} onClick={go} />
          ))}
        </div>
      </header>

      <div className={`sticky top-14 z-20 flex border-b border-[#e6eaf2] bg-white lg:hidden ${prep ? "!hidden" : ""}`}>
        {(
          [
            ["inputs", `Inputs (${counts.all})`],
            ["shortlist", `Shortlist (${shortlist.length})`],
            ["notes", "Notes"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative h-11 flex-1 text-[13.5px] font-medium ${tab === id ? "text-[#0b57f5]" : "text-[#5e6a85]"}`}
          >
            {label}
            {tab === id && (
              <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-[#0b57f5]" />
            )}
          </button>
        ))}
      </div>

      <div className="p-3 md:p-5">
        {session.status === "Paused" && (
          <Banner tone="amber" icon={PauseCircle} title="Participation is paused">
            Attendees see “Participation is temporarily paused — please try again shortly.”
            <Button size="sm" className="ml-auto" onClick={() => setStatus("Live")}>
              <Play size={14} /> Resume
            </Button>
          </Banner>
        )}
        {session.status === "Closed" && (
          <Banner
            tone="blue"
            icon={FileText}
            title={outcome ? `Outcome · ${outcome.status}` : "Session closed · write the outcome"}
          >
            {session.closedAt
              ? `Closed at ${clock(session.closedAt)} · target: approved by ${clock(session.closedAt + OUTCOME_WINDOW)}`
              : "Target: within 30 minutes of closing."}
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => router.push(`/coordinator/sessions/${session.id}/outcome`)}
            >
              {outcome ? "Open outcome" : "Write outcome"} <ChevronRight size={14} />
            </Button>
          </Banner>
        )}

        {prep ? (
          <PrepView
            session={session}
            qrShown={qrShown}
            onShowQr={() => {
              setQrShown(true)
              setQrOpen(true)
            }}
            onGoLive={() => setStatus("Live")}
          />
        ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className={`min-w-0 overflow-hidden ${tab === "inputs" ? "" : "hidden lg:block"}`}>
            {feed}
          </Card>
          <div
            className={`grid content-start gap-3 lg:sticky lg:top-[72px] lg:flex lg:h-[calc(100svh-88px)] lg:flex-col lg:self-start ${tab === "inputs" ? "hidden lg:flex" : ""}`}
          >
            {/* Desktop: one panel at a time, full height */}
            <div className="hidden shrink-0 rounded-xl border border-[#e1e6ef] bg-white p-1 lg:flex">
              {(
                [
                  ["shortlist", "Shortlist", Star, shortlist.length],
                  ["notes", "Discussion notes", PenLine, null],
                ] as const
              ).map(([id, label, Icon, n]) => (
                <button
                  key={id}
                  onClick={() => setRailTab(id)}
                  aria-pressed={railTab === id}
                  className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-[13.5px] font-semibold transition-colors ${railTab === id ? "bg-[#0f1e4d] text-white" : "text-[#44506e] hover:bg-[#f4f6fa]"}`}
                >
                  <Icon
                    size={15}
                    className={railTab === id && id === "shortlist" ? "fill-[#ffc53d] text-[#ffc53d]" : ""}
                  />
                  {label}
                  {n !== null && (
                    <span
                      className={`num rounded-full px-1.5 text-[11.5px] leading-5 ${railTab === id ? "bg-white/20" : "bg-[#eef1f6]"}`}
                    >
                      {n}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div
              className={`lg:min-h-0 lg:flex-1 lg:flex-col ${tab === "shortlist" ? "" : "hidden"} ${railTab === "shortlist" ? "lg:flex" : "lg:hidden"}`}
            >
              <ShortlistPanel
                items={shortlist}
                states={states}
                onPresent={() => setPresenting(true)}
                onMove={(from, to) =>
                  setOrders((m) => {
                    const cur = [...order]
                    const [x] = cur.splice(from, 1)
                    cur.splice(to, 0, x!)
                    return { ...m, [session.id]: cur }
                  })
                }
                onDiscussed={(i) => act(i, "discussed")}
                onRemove={(i) => act(i, "shortlisted")}
                session={session}
                onOpenNotes={() => setRailTab("notes")}
              />
            </div>
            <div
              className={`lg:min-h-0 lg:flex-1 lg:flex-col ${tab === "notes" ? "flex flex-col" : "hidden"} ${railTab === "notes" ? "lg:flex" : "lg:hidden"}`}
            >
              <NotesPanel session={session} />
            </div>
          </div>
        </div>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className="pop-in fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-[#0f1e4d] py-2 pr-2 pl-4 text-[13.5px] whitespace-nowrap text-white shadow-[0_12px_32px_rgba(15,30,77,.35)]"
        >
          <Check size={15} className="text-[#6ee7b7]" />
          {toast.text}
          {toast.undo && (
            <button
              onClick={toast.undo}
              className="rounded-md px-2.5 py-1 font-medium text-[#9dbcff] hover:bg-white/10"
            >
              Undo
            </button>
          )}
        </div>
      )}

      <Modal
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Close this session?"
        description="Attendees can no longer submit. Session feedback opens for them, and your 30-minute outcome window starts."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmClose(false)}>
              Keep live
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmClose(false)
                setStatus("Closed")
              }}
            >
              <CircleStop size={15} /> Close session
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-[#44506e]">
          {counts.all} inputs captured · {shortlist.length} shortlisted. Your notes and shortlist stay
          available for the outcome. An admin can reopen the session if needed.
        </p>
      </Modal>
      <Modal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Session QR code"
        description={session.title}
      >
        <SessionQrPanel session={session} />
      </Modal>
      {presenting && (
        <PresentMode
          session={session}
          items={shortlist}
          states={states}
          onDiscussed={(i) => act(i, "discussed")}
          onClose={() => setPresenting(false)}
        />
      )}
    </CoordShell>
  )
}

/* ================================================================ */
/* Before the session: get-ready mode                                */
/* ================================================================ */
function PrepView({
  session,
  onGoLive,
  onShowQr,
  qrShown,
}: {
  session: Session
  onGoLive: () => void
  onShowQr: () => void
  qrShown: boolean
}) {
  const [notes] = useNotes()
  const now = useNow()
  const t = themeById(session.theme)
  const start = formatTime(session.time).start
  const speakers = session.speakers.filter((x) => x.name)
  const noteLines = (notes[session.id] ?? "").trim()

  // Countdown against today's clock at the scheduled start (true on event day).
  let countdown: string | null = null
  if (now) {
    const [h = 0, m = 0] = session.time.split(/[–-]/)[0]!.split(":").map(Number)
    const at = new Date(now)
    at.setHours(h, m, 0, 0)
    const diff = at.getTime() - now
    if (diff > 0) {
      const mins = Math.ceil(diff / 60000)
      countdown = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`
    }
  }

  const checks: { done: boolean; title: string; text: string; action?: ReactNode }[] = [
    {
      done: qrShown,
      title: "Put the QR code on the hall screen",
      text: "Attendees scan it to land straight on this session.",
      action: (
        <Button size="sm" variant="secondary" onClick={onShowQr}>
          <QrCode size={14} /> Show QR
        </Button>
      ),
    },
    {
      done: speakers.length > 0,
      title: speakers.length ? `${speakers.length} speakers listed` : "No speakers listed yet",
      text: speakers.length
        ? speakers.map((x) => x.name).join(", ")
        : "Ask the admin team to add them, so you can tag notes by speaker.",
    },
    {
      done: !!noteLines,
      title: noteLines ? "Notes started" : "Start your notes",
      text: "Jot the agenda or speaker topics now. Everything feeds the outcome later.",
    },
    session.access === "Invited"
      ? {
          done: true,
          title: "Invited-only Round Table",
          text: "Inputs stay with you and the admin team. Nothing is shown to attendees.",
        }
      : {
          done: true,
          title: "Questions need your approval",
          text: "Nothing reaches attendees until you tap Show to room.",
        },
  ]
  const ready = checks.filter((c) => c.done).length

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 content-start gap-4">
        {/* Hero */}
        <section
          className="relative overflow-hidden rounded-xl border border-[#e1e6ef] p-5 md:p-6"
          style={{ background: `linear-gradient(120deg, ${t.soft} 0%, #ffffff 60%)` }}
        >
          <span className="absolute inset-y-0 left-0 w-1" style={{ background: t.accent }} />
          <Illus
            name="podium"
            className="pointer-events-none absolute right-2 bottom-0 hidden h-[88%] w-auto opacity-95 md:block"
          />
          <div className="relative md:max-w-[62%]">
            <p className="inline-flex items-center gap-1.5 rounded-md bg-white/80 px-2 py-0.5 text-[11.5px] font-semibold tracking-wide text-[#1e4fd8] uppercase ring-1 ring-[#d6e2ff] ring-inset">
              <Clock3 size={12} /> Get ready
            </p>
            <h2 className="mt-3 text-[26px] leading-tight font-semibold tracking-[-0.02em] text-[#0f1e4d] md:text-[30px]">
              {countdown ? (
                <>
                  Starts in <span style={{ color: t.accent }}>{countdown}</span>
                </>
              ) : (
                <>Scheduled for {start}</>
              )}
            </h2>
            <p className="mt-1.5 text-[14px] text-[#44506e]">
              {formatTime(session.time).range} · {session.venue}. Attendees currently see{" "}
              <strong className="font-semibold text-[#0f1e4d]">“Opens at {start}”</strong>.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={onGoLive}>
                <Play size={17} /> Go live now
              </Button>
              <span className="text-[12.5px] text-[#6b7690]">
                Attendees can submit the moment you go live.
                <br className="hidden sm:block" /> You can pause or close any time.
              </span>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#eef1f6] px-4 py-3">
            <h3 className="text-[14px] font-semibold text-[#0f1e4d]">Before you go live</h3>
            <span className="num flex items-center gap-2 text-[12.5px] font-medium text-[#44506e]">
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-[#eef1f6]">
                <span
                  className="block h-full rounded-full bg-[#12a37a] transition-[width] duration-500"
                  style={{ width: `${(ready / checks.length) * 100}%` }}
                />
              </span>
              {ready}/{checks.length} ready
            </span>
          </div>
          <ul className="divide-y divide-[#eef1f6]">
            {checks.map((c) => (
              <li key={c.title} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${c.done ? "bg-[#12a37a] text-white" : "bg-[#fff1d2] text-[#b27000]"}`}
                >
                  {c.done ? <Check size={14} strokeWidth={2.8} /> : <AlertTriangle size={13} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-medium text-[#0f1e4d]">{c.title}</span>
                  <span className="block text-[12.5px] text-[#6b7690]">{c.text}</span>
                </span>
                {c.action}
              </li>
            ))}
          </ul>
        </Card>

        {/* What happens next */}
        <div className="grid gap-2.5 sm:grid-cols-3">
          {[
            { icon: MessageCircle, c: "#0b57f5", soft: "#e8efff", title: "Inputs arrive here", text: "Questions, ideas and opinions stream in live." },
            { icon: Star, c: "#e08e00", soft: "#fff1d2", title: "Shortlist the best", text: "Build the relay order for the moderator." },
            { icon: Presentation, c: "#7c5cfa", soft: "#efe9ff", title: "Present on stage", text: "Large-text view, one question at a time." },
          ].map(({ icon: Icon, c, soft, title, text }) => (
            <div key={title} className="flex gap-3 rounded-xl border border-[#e1e6ef] bg-white p-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: soft, color: c }}>
                <Icon size={17} />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-[#0f1e4d]">{title}</span>
                <span className="block text-[12.5px] leading-snug text-[#6b7690]">{text}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid content-start gap-4 lg:sticky lg:top-[72px] lg:self-start">
        {/* What attendees see right now */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#eef1f6] px-4 py-3">
            <h3 className="text-[14px] font-semibold text-[#0f1e4d]">What attendees see now</h3>
            <span className="inline-flex items-center gap-1 rounded-md bg-[#eef3ff] px-2 py-0.5 text-[11.5px] font-medium text-[#1e4fd8]">
              Phone preview
            </span>
          </div>
          <div className="bg-[#f4f6fb] p-4">
            <div className="mx-auto max-w-[280px] overflow-hidden rounded-[22px] border-[6px] border-[#0f1e4d] bg-[#f6f8fd]">
              <div className="sunrise relative overflow-hidden px-3.5 pt-3 pb-3">
                <p className="text-[9px] font-semibold tracking-[.14em] uppercase" style={{ color: t.accent }}>
                  {session.type}
                </p>
                <p className="mt-0.5 max-w-[68%] text-[15px] leading-tight font-bold text-[#0f1e4d]">{session.title}</p>
                <p className="mt-1 text-[9.5px] text-[#44506e]">
                  {formatTime(session.time).range} · {session.venue}
                </p>
                <Illus name="podium" className="absolute -right-2 bottom-0 w-[38%]" />
              </div>
              <div className="p-3">
                <div className="rounded-xl bg-white p-3 text-center shadow-[0_1px_2px_rgba(15,30,77,.06)]">
                  <span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-[#eef4ff] text-[#0b57f5]">
                    <CalendarDays size={15} />
                  </span>
                  <p className="mt-1.5 text-[12px] font-bold text-[#0f1e4d]">Opens at {start}</p>
                  <p className="mt-0.5 text-[9.5px] leading-snug text-[#5e6a85]">
                    Questions, ideas and opinions open when the session goes live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <NotesPanel session={session} />
      </div>
    </div>
  )
}

function Banner({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "amber" | "blue"
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  const c =
    tone === "amber"
      ? "border-[#fbe3b4] bg-[#fffaf0] text-[#9a6100]"
      : "border-[#d6e2ff] bg-[#f5f8ff] text-[#1e4fd8]"
  return (
    <div className={`mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-4 py-3 ${c}`}>
      <Icon size={18} className="shrink-0" />
      <strong className="text-[13.5px] font-semibold">{title}</strong>
      <span className="flex flex-1 flex-wrap items-center gap-2 text-[13px] text-[#44506e]">
        {children}
      </span>
    </div>
  )
}

function LiveTimer({ session }: { session: Session }) {
  const running = session.status === "Live" || session.status === "Paused"
  const now = useNow(running)
  if (!running || !session.liveAt || !now) return null
  const elapsed = now - session.liveAt
  const left = durationMin(session.time) * 60000 - elapsed
  const over = left < 0
  return (
    <span
      className={`num inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-medium ring-1 ring-inset ${over ? "bg-[#fff6e5] text-[#9a6100] ring-[#fbe3b4]" : "bg-[#f7f9fc] text-[#0f1e4d] ring-[#e3e7ef]"}`}
      title="Time since going live"
    >
      <Clock3 size={14} /> {mmss(elapsed)}
      <span className="text-[12px] font-normal text-[#6b7690]">
        {over ? `over by ${Math.ceil(-left / 60000)}m` : `${Math.ceil(left / 60000)}m left`}
      </span>
    </span>
  )
}

function StatusControl({
  status,
  onChange,
}: {
  status: string
  onChange: (s: Session["status"]) => void
}) {
  if (status === "Upcoming")
    return (
      <Button onClick={() => onChange("Live")}>
        <Play size={15} /> Go live
      </Button>
    )
  if (status === "Closed")
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#f3f5f9] px-3 text-[13px] font-medium text-[#4a5572]">
        <StatusDot status="Closed" /> Closed
      </span>
    )
  const opts: [Session["status"], string, LucideIcon][] = [
    ["Live", "Live", Play],
    ["Paused", "Pause", PauseCircle],
    ["Closed", "Close", CircleStop],
  ]
  return (
    <div
      role="radiogroup"
      aria-label="Session status"
      className="inline-flex rounded-lg bg-[#eef1f6] p-0.5"
    >
      {opts.map(([s, label, Icon]) => {
        const on = status === s
        return (
          <button
            key={s}
            role="radio"
            aria-checked={on}
            onClick={() => !on && onChange(s)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-all ${on ? (s === "Live" ? "bg-[#12a37a] text-white shadow-sm" : "bg-[#f5a300] text-white shadow-sm") : s === "Closed" ? "text-[#c62828] hover:bg-white" : "text-[#44506e] hover:bg-white"}`}
          >
            {on && s === "Live" ? (
              <span className="live-pulse h-1.5 w-1.5 rounded-full bg-white" />
            ) : (
              <Icon size={14} />
            )}
            {on && s === "Paused" ? "Paused" : label}
          </button>
        )
      })}
    </div>
  )
}

const kindEdge: Record<InputKind, string> = {
  question: "#0b57f5",
  idea: "#f5a300",
  opinion: "#7c5cfa",
}

function InputRow({
  input: i,
  state: s,
  flagged,
  fresh,
  canShow,
  selected,
  shortIndex,
  onSelect,
  onAct,
  onAllow,
}: {
  input: LiveInput
  state: InputState
  flagged: boolean
  fresh: boolean
  /** SES-11: Round Table inputs stay with the coordinator and admin. */
  canShow: boolean
  selected: boolean
  shortIndex: number
  onSelect: () => void
  onAct: (a: Action) => void
  onAllow: () => void
}) {
  const K = kindMeta[i.kind]
  const shown = !!s.visible && !s.hidden
  const listed = !!s.shortlisted && !s.hidden
  const hot = i.votes >= 10
  const fire = (a: Action) => (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
    onAct(a)
  }
  return (
    <li
      id={`row-${i.id}`}
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`relative cursor-default overflow-hidden rounded-xl border p-3.5 pl-5 transition-all md:p-4 md:pl-5 ${flagged ? "border-[#f5c9ca] bg-[#fff7f7]" : listed ? "border-[#c9d8ff] bg-white" : "border-[#e6eaf2] bg-white hover:border-[#d5dcea] hover:shadow-[0_4px_14px_-6px_rgba(15,30,77,.15)]"} ${selected ? "ring-2 ring-[#0b57f5]/35" : ""} ${s.hidden ? "opacity-55" : ""}`}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: flagged ? "#e5373b" : kindEdge[i.kind] }}
      />
      <div className="flex gap-3 md:gap-4">
        <span
          className="mt-0.5 hidden h-10 w-10 shrink-0 place-items-center rounded-full text-white sm:grid"
          style={{ background: flagged ? "#e5373b" : kindEdge[i.kind] }}
        >
          {flagged ? <AlertTriangle size={18} /> : <K.icon size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-semibold tracking-wide uppercase">
            <span className="inline-flex items-center gap-1" style={{ color: kindEdge[i.kind] }}>
              <K.icon size={13} className="sm:hidden" /> {K.label}
            </span>
            <span className="font-normal tracking-normal text-[#8a93ab] normal-case">{i.at}</span>
            {fresh && (
              <span className="inline-flex items-center gap-1 rounded bg-[#0b57f5] px-1.5 py-px text-[10.5px] tracking-wider text-white">
                New
              </span>
            )}
            {listed && (
              <span className="inline-flex items-center gap-1 rounded bg-[#eef3ff] px-1.5 py-px text-[10.5px] tracking-wider text-[#1e4fd8]">
                <Star size={10} className="fill-current" /> #{shortIndex + 1} shortlist
              </span>
            )}
            {shown && (
              <span className="inline-flex items-center gap-1 rounded bg-[#ebf8f2] px-1.5 py-px text-[10.5px] tracking-wider text-[#0d7a57]">
                <Eye size={10} /> In room
              </span>
            )}
            {s.discussed && (
              <span className="inline-flex items-center gap-1 rounded bg-[#f1f4f9] px-1.5 py-px text-[10.5px] tracking-wider text-[#44506e]">
                <Check size={10} /> Discussed
              </span>
            )}
            {s.allowed && (
              <span className="inline-flex items-center gap-1 rounded bg-[#f1f4f9] px-1.5 py-px text-[10.5px] tracking-wider text-[#44506e]">
                <ShieldCheck size={10} /> Reviewed
              </span>
            )}
          </p>
          <p
            className={`mt-1.5 text-[15.5px] leading-snug font-medium ${s.discussed ? "text-[#8a93ab]" : "text-[#0f1e4d]"}`}
          >
            {i.text}
          </p>
          {i.kind === "idea" && i.proposed && (
            <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-[#5e6a85]">{i.proposed}</p>
          )}
          <p className="mt-2 flex items-center gap-2 text-[12.5px] text-[#6b7690]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#e9eef7] text-[9.5px] font-semibold text-[#44506e]">
              {i.author
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </span>
            <span className="font-medium text-[#44506e]">{i.author}</span>
            {i.org && <span className="truncate">· {i.org}</span>}
          </p>
          {flagged && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#f5c9ca] bg-[#fdefef] px-3 py-2 text-[12.5px] text-[#c62828]">
              <AlertTriangle size={14} /> Contains a blocked word. It can&apos;t be shown until reviewed.
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAllow()
                }}
                className="ml-auto rounded-md bg-white px-2.5 py-1 font-medium ring-1 ring-[#f3c6c7] hover:bg-[#fff5f5]"
              >
                Review &amp; allow
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {i.kind === "question" && canShow && (
              <button
                onClick={fire("visible")}
                disabled={flagged && !s.visible}
                aria-pressed={shown}
                title={flagged && !s.visible ? "Review the flagged word first" : "Show to the room (V)"}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${shown ? "bg-[#12a37a] text-white" : "bg-[#ebf8f2] text-[#0d7a57] ring-1 ring-[#cdeede] ring-inset hover:bg-[#dff4ea]"}`}
              >
                {shown ? <Check size={14} strokeWidth={2.6} /> : <Eye size={14} />}
                {shown ? "In room" : "Show to room"}
              </button>
            )}
            <button
              onClick={fire("shortlisted")}
              aria-pressed={listed}
              title="Shortlist for the moderator (S)"
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-semibold transition-all active:scale-95 ${listed ? "bg-[#0b57f5] text-white" : "bg-[#eef3ff] text-[#1e4fd8] ring-1 ring-[#d6e2ff] ring-inset hover:bg-[#e2ebff]"}`}
            >
              <Star size={14} className={listed ? "fill-current" : ""} />
              {listed ? `Shortlisted #${shortIndex + 1}` : "Shortlist"}
            </button>
            <span className="mx-1 hidden h-5 w-px bg-[#e6eaf2] sm:block" />
            <button
              onClick={fire("discussed")}
              aria-pressed={!!s.discussed}
              aria-label={s.discussed ? "Unmark discussed" : "Mark discussed"}
              title="Mark discussed (D)"
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-all active:scale-95 ${s.discussed ? "bg-[#0f1e4d] text-white" : "bg-white text-[#44506e] ring-1 ring-[#dfe4ee] ring-inset hover:bg-[#f4f6fa]"}`}
            >
              <Check size={14} />
              <span className="hidden sm:inline">Discussed</span>
            </button>
            <button
              onClick={fire("hidden")}
              aria-pressed={!!s.hidden}
              aria-label={s.hidden ? "Unhide" : "Hide"}
              title="Hide (H)"
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-all active:scale-95 ${s.hidden ? "bg-[#c62828] text-white" : "bg-white text-[#d4292f] ring-1 ring-[#f3cfd0] ring-inset hover:bg-[#fdf3f3]"}`}
            >
              <EyeOff size={14} />
              <span className="hidden sm:inline">{s.hidden ? "Unhide" : "Hide"}</span>
            </button>
          </div>
        </div>

        {i.kind === "question" && (
          <div
            className={`flex w-14 shrink-0 flex-col items-center justify-center self-start rounded-xl py-2.5 md:w-16 ${hot ? "bg-[#0b57f5] text-white" : "bg-[#f3f6fc] text-[#1e4fd8]"}`}
            title={`${i.votes} attendees +1'd this`}
          >
            <ArrowUp size={16} strokeWidth={2.6} />
            <span className="num text-[20px] leading-none font-semibold">{i.votes}</span>
            <span className={`mt-0.5 text-[10.5px] ${hot ? "text-white/75" : "text-[#8a93ab]"}`}>+1s</span>
          </div>
        )}
      </div>
    </li>
  )
}

function ShortlistPanel({
  items,
  states,
  onPresent,
  onMove,
  onDiscussed,
  onRemove,
  session,
  onOpenNotes,
}: {
  items: LiveInput[]
  states: Record<string, InputState>
  onPresent: () => void
  onMove: (from: number, to: number) => void
  onDiscussed: (i: LiveInput) => void
  onRemove: (i: LiveInput) => void
  session: Session
  onOpenNotes: () => void
}) {
  const done = items.filter((i) => states[i.id]?.discussed).length
  return (
    <section className="relative flex flex-col overflow-hidden rounded-xl bg-[#0f1e4d] text-white shadow-[0_1px_2px_rgba(15,30,77,.08)] lg:h-full">
      <span className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#0b57f5]/40 blur-3xl" />
      <div className="relative flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold lg:hidden">
            <Star size={15} className="fill-[#ffc53d] text-[#ffc53d]" /> Shortlist
            <span className="num rounded-full bg-white/15 px-2 text-[12px] leading-5">{items.length}</span>
          </h2>
          <p className="mt-0.5 text-[12px] text-white/60">
            Relay order for the on-stage moderator
            {items.length > 0 && ` · ${done}/${items.length} discussed`}
          </p>
        </div>
        <button
          onClick={onPresent}
          disabled={!items.length}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-[13px] font-semibold text-[#0f1e4d] shadow-sm hover:bg-[#eef3ff] disabled:opacity-40"
        >
          <Presentation size={15} /> Present
        </button>
      </div>
      {items.length > 0 && (
        <div className="relative mx-4 mb-2 h-1 overflow-hidden rounded-full bg-white/10">
          <span
            className="block h-full rounded-full bg-[#12a37a] transition-[width] duration-500"
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
      )}
      {items.length === 0 ? (
        <p className="relative px-4 pt-2 pb-6 text-[13px] text-white/60">
          Shortlist the questions you want asked on stage. They appear here in relay order. Press{" "}
          <kbd className="rounded bg-white/15 px-1.5 font-sans text-[11px] text-white">S</kbd> on any input.
        </p>
      ) : (
        <ol className="relative max-h-[50svh] min-h-0 flex-1 divide-y divide-white/10 overflow-y-auto lg:max-h-none">
          {items.map((i, idx) => {
            const d = !!states[i.id]?.discussed
            return (
              <li key={i.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className="num mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white"
                  style={{ background: d ? "#12a37a" : kindEdge[i.kind] }}
                >
                  {d ? <Check size={14} strokeWidth={2.6} /> : idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`line-clamp-2 text-[13.5px] leading-snug ${d ? "text-white/45 line-through" : "text-white"}`}>
                    {i.text}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-white/50">
                    {kindMeta[i.kind].label}
                    {i.kind === "question" && ` · ▲ ${i.votes}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  <IconBtn dark label="Move up" disabled={idx === 0} onClick={() => onMove(idx, idx - 1)}>
                    <ArrowUp size={14} />
                  </IconBtn>
                  <IconBtn dark label="Move down" disabled={idx === items.length - 1} onClick={() => onMove(idx, idx + 1)}>
                    <ArrowDown size={14} />
                  </IconBtn>
                  <IconBtn dark label={d ? "Unmark discussed" : "Mark discussed"} onClick={() => onDiscussed(i)}>
                    <Check size={14} className={d ? "text-[#6ee7b7]" : ""} />
                  </IconBtn>
                  <IconBtn dark label="Remove from shortlist" onClick={() => onRemove(i)}>
                    <X size={14} />
                  </IconBtn>
                </div>
              </li>
            )
          })}
        </ol>
      )}
      <RailQuickNote session={session} onOpenNotes={onOpenNotes} />
    </section>
  )
}

/** Jot a point without leaving the shortlist (SES-08, OUT-02). */
function RailQuickNote({ session, onOpenNotes }: { session: Session; onOpenNotes: () => void }) {
  const [, setNotes] = useNotes()
  const [text, setText] = useState("")
  const [saved, setSaved] = useState(false)
  const speakers = session.speakers.filter((x) => x.name)
  const save = () => {
    const t = text.trim()
    if (!t) return
    const line = `[${clock(Date.now())}] ${t}`
    setNotes((m) => ({ ...m, [session.id]: m[session.id] ? `${m[session.id]}\n${line}` : line }))
    setText("")
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }
  return (
    <div className="relative mt-auto shrink-0 border-t border-white/10 bg-white/[.04] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-white/70">
          <PenLine size={13} /> Quick note
        </span>
        {saved ? (
          <span className="flex items-center gap-1 text-[12px] text-[#6ee7b7]">
            <Check size={13} /> Added to notes
          </span>
        ) : (
          <button onClick={onOpenNotes} className="text-[12px] font-medium text-[#9dbcff] hover:text-white">
            Open all notes →
          </button>
        )}
      </div>
      {speakers.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {speakers.map((sp) => (
            <button
              key={sp.name}
              onClick={() => setText((v) => (v.startsWith(`${sp.name}: `) ? v : `${sp.name}: ${v}`))}
              className="h-6 rounded-full bg-white/10 px-2 text-[11.5px] font-medium text-white/80 hover:bg-white/20"
            >
              + {sp.name}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="flex items-center gap-1.5 rounded-lg bg-white/10 p-1 ring-1 ring-white/10 focus-within:ring-white/35"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did the panel just say?"
          className="h-8 min-w-0 flex-1 bg-transparent px-2 text-[13px] text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="h-8 shrink-0 rounded-md bg-white px-3 text-[12.5px] font-semibold text-[#0f1e4d] disabled:opacity-30"
        >
          Add
        </button>
      </form>
    </div>
  )
}

function IconBtn({
  label,
  children,
  onClick,
  disabled,
  dark,
}: {
  label: string
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  dark?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-md disabled:opacity-25 ${dark ? "text-white/60 hover:bg-white/10 hover:text-white" : "text-[#6b7690] hover:bg-[#f1f4f9] hover:text-[#0f1e4d]"}`}
    >
      {children}
    </button>
  )
}

function NotesPanel({ session }: { session: Session }) {
  const [notes, setNotes] = useNotes()
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const ref = useRef<HTMLTextAreaElement>(null)
  const value = notes[session.id] ?? ""
  const MAX = 4000
  const update = (v: string) => {
    setNotes((m) => ({ ...m, [session.id]: v.slice(0, MAX) }))
    setSavedAt(Date.now())
  }
  const insert = (text: string) => {
    const el = ref.current
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const before = value.slice(0, start)
    const prefix = before && !before.endsWith("\n") ? "\n" : ""
    update(before + prefix + text + value.slice(end))
    requestAnimationFrame(() => {
      el?.focus()
      const pos = (before + prefix + text).length
      el?.setSelectionRange(pos, pos)
    })
  }
  const speakers = session.speakers.filter((s) => s.name)
  return (
    <Card className="flex flex-col overflow-hidden lg:min-h-0 lg:flex-1">
      <div className="flex items-center justify-between border-b border-[#eef1f6] px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-[#0f1e4d]">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-[#fff4dc] text-[#b27000]">
              <PenLine size={13} />
            </span>
            Discussion notes
          </h2>
          <p className="text-[12px] text-[#6b7690]">What the speakers said · feeds the outcome</p>
        </div>
        <span className="flex items-center gap-1 text-[12px] text-[#0d7a57]">
          {savedAt ? (
            <>
              <Check size={13} /> Saved {clock(savedAt)}
            </>
          ) : (
            <span className="text-[#8a93ab]">Autosaves</span>
          )}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 px-3 pt-3">
        {speakers.map((s) => (
          <button
            key={s.name}
            onClick={() => insert(`${s.name}: `)}
            className="h-7 rounded-full bg-[#eef3ff] px-2.5 text-[12px] font-medium text-[#1e4fd8] hover:bg-[#e0e9ff]"
            title="Insert speaker name"
          >
            + {s.name}
          </button>
        ))}
        <button
          onClick={() => insert(`[${clock(Date.now())}] `)}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-[#fff4dc] px-2.5 text-[12px] font-medium text-[#9a6100] hover:bg-[#ffecc2]"
          title="Insert the current time"
        >
          <Clock3 size={12} /> Time
        </button>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder={
          speakers[0]
            ? `${speakers[0].name}: proposed a statewide smart-grid sandbox…`
            : "Key points, by speaker where possible…"
        }
        className="m-3 min-h-[220px] flex-1 resize-y rounded-lg lg:min-h-[120px] lg:resize-none border border-[#dfe4ee] p-3 text-[13.5px] leading-relaxed text-[#0f1e4d] placeholder:text-[#a4acbf] focus:border-[#0b57f5] focus:ring-3 focus:ring-[#0b57f5]/12 focus:outline-none"
      />
      <p className="num -mt-1 px-4 pb-3 text-right text-[11.5px] text-[#8a93ab]">
        {value.length}/{MAX}
      </p>
    </Card>
  )
}

/** SES-08: one shortlisted item at a time, in large text, for relaying on stage. */
function QuickNote({ session }: { session: Session }) {
  const [, setNotes] = useNotes()
  const [text, setText] = useState("")
  const [last, setLast] = useState("")
  const speakers = session.speakers.filter((x) => x.name)
  const save = () => {
    const t = text.trim()
    if (!t) return
    const line = `[${clock(Date.now())}] ${t}`
    setNotes((m) => {
      const cur = m[session.id] ?? ""
      return { ...m, [session.id]: cur ? `${cur}\n${line}` : line }
    })
    setLast(t)
    setText("")
  }
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-5">
      <div className="flex flex-wrap gap-1.5 pb-2">
        {speakers.map((sp) => (
          <button
            key={sp.name}
            onClick={() => setText((v) => (v.startsWith(`${sp.name}: `) ? v : `${sp.name}: ${v}`))}
            className="h-7 rounded-full bg-white/10 px-2.5 text-[12px] font-medium text-white/80 hover:bg-white/20"
          >
            + {sp.name}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        className="flex items-center gap-2 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/10 focus-within:ring-white/30"
      >
        <PenLine size={16} className="ml-2 shrink-0 text-white/50" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Quick note: what did the panel say? Press Enter to save"
          className="h-10 min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-white/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="h-10 shrink-0 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0f1e4d] disabled:opacity-30"
        >
          Save note
        </button>
      </form>
      {last && (
        <p className="mt-2 flex items-center gap-1.5 truncate text-[12px] text-[#6ee7b7]">
          <Check size={13} /> Added to discussion notes: {last}
        </p>
      )}
    </div>
  )
}

function PresentMode({
  session,
  items,
  states,
  onDiscussed,
  onClose,
}: {
  session: Session
  items: LiveInput[]
  states: Record<string, InputState>
  onDiscussed: (i: LiveInput) => void
  onClose: () => void
}) {
  const [idx, setIdx] = useState(() => {
    const first = items.findIndex((i) => !states[i.id]?.discussed)
    return first < 0 ? 0 : first
  })
  const cur = items[Math.min(idx, items.length - 1)]
  const done = cur ? !!states[cur.id]?.discussed : false
  const next = useCallback(
    () => setIdx((n) => Math.min(items.length - 1, n + 1)),
    [items.length]
  )
  const prev = useCallback(() => setIdx((n) => Math.max(0, n - 1)), [])
  const discussAndNext = useCallback(() => {
    if (cur && !states[cur.id]?.discussed) onDiscussed(cur)
    next()
  }, [cur, states, onDiscussed, next])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) {
        if (e.key === "Escape") (e.target as HTMLElement).blur()
        return
      }
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        next()
      } else if (e.key === "ArrowLeft") prev()
      else if (e.key.toLowerCase() === "d" || e.key === "Enter") discussAndNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, next, prev, discussAndNext])
  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[#0b1636] text-white"
      role="dialog"
      aria-label="Present shortlist"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-8">
        <div className="min-w-0">
          <p className="text-[12px] font-medium tracking-wider text-white/50 uppercase">
            Relay to moderator
          </p>
          <p className="truncate text-[14px] text-white/80">{session.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="num text-[14px] text-white/60">
            {items.length ? idx + 1 : 0} / {items.length}
          </span>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 hover:bg-white/20"
            aria-label="Exit present mode"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex gap-1 px-5 md:px-8">
        {items.map((i, n) => (
          <span
            key={i.id}
            className={`h-1 flex-1 rounded-full ${n === idx ? "bg-white" : states[i.id]?.discussed ? "bg-[#12a37a]" : "bg-white/20"}`}
          />
        ))}
      </div>
      <div className="grid flex-1 place-items-center px-6 md:px-16">
        {cur ? (
          <div key={cur.id} className="float-in max-w-5xl text-center">
            <p className="text-[13px] font-semibold tracking-[.2em] text-[#9dbcff] uppercase">
              {kindMeta[cur.kind].label}
              {cur.kind === "question" && ` · ▲ ${cur.votes}`}
              {done && " · Discussed"}
            </p>
            <p
              className={`mt-5 text-[clamp(28px,5vw,60px)] leading-[1.15] font-semibold tracking-tight ${done ? "text-white/45" : ""}`}
            >
              {cur.text}
            </p>
          </div>
        ) : (
          <p className="text-white/60">The shortlist is empty.</p>
        )}
      </div>
      <div className="flex items-center justify-center gap-3 px-5 pb-6">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30"
          aria-label="Previous"
        >
          <ChevronLeft size={26} />
        </button>
        <button
          onClick={discussAndNext}
          disabled={!cur}
          className="inline-flex h-14 items-center gap-2 rounded-xl bg-[#12a37a] px-6 text-[17px] font-semibold hover:bg-[#0f9068] disabled:opacity-30"
        >
          <Check size={20} /> {done ? "Next" : "Discussed · next"}
        </button>
        <button
          onClick={next}
          disabled={idx >= items.length - 1}
          className="grid h-14 w-14 place-items-center rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30"
          aria-label="Next"
        >
          <ChevronRight size={26} />
        </button>
      </div>
      <QuickNote session={session} />
      <p className="hidden pb-4 text-center text-[12px] text-white/40 md:block">
        ← → move · D or Enter marks discussed · Esc exits · attendee names are never shown here
      </p>
    </div>
  )
}

/* ================================================================ */
/* Outcome (OUT-02 … OUT-06)                                         */
/* ================================================================ */
export function OutcomeScreen() {
  const { id } = useParams<{ id: string }>()
  const { sessions, ready } = useMySessions()
  const session = sessions.find((s) => matchesSessionId(s, id))
  if (!session)
    return (
      <CoordShell>
        {ready && (
          <Card className="p-8 text-center text-[14px] text-[#5e6a85]">Session not found.</Card>
        )}
      </CoordShell>
    )
  return <OutcomeEditor session={session} />
}

const sectionHint = [
  "3–4 sentences on what the session covered.",
  "Up to 5 themes the speakers discussed.",
  "Up to 5 audience inputs, with how many inputs back each point.",
  "Up to 5 ideas or opportunities raised.",
  "Up to 5 recommendations: action — department if evident — timeframe if stated.",
  "Up to 5 concrete next steps.",
  "Counts only.",
]

function OutcomeEditor({ session }: { session: Session }) {
  const [outcomes, setOutcomes, ready] = useOutcomes()
  const [inputs] = useInputs()
  const [states] = useInputStates()
  const [notes] = useNotes()
  const [feedback] = useFeedback()
  const [generating, setGenerating] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const now = useNow()
  const o = outcomes[session.id]
  const note = notes[session.id] ?? ""
  const here = inputs.filter((i) => i.sessionId === session.id)
  const moderated = here.filter(
    (i) =>
      !states[i.id]?.hidden &&
      (states[i.id]?.visible || states[i.id]?.shortlisted || states[i.id]?.discussed)
  )
  const fb = feedback[session.id]
  const editable = !o || o.status === "Draft" || o.status === "Changes requested"

  const save = (patch: Partial<Outcome>) => {
    setOutcomes((m) => ({
      ...m,
      [session.id]: {
        status: "Draft",
        sections: OUTCOME_SECTIONS.map(() => ""),
        source: "manual",
        ...m[session.id],
        ...patch,
        updatedAt: Date.now(),
      },
    }))
    // Only ever called from event handlers, never during render.
    // eslint-disable-next-line react-hooks/purity
    setSavedAt(Date.now())
  }

  const generate = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1600))
    save({
      sections: draftFrom(session, note, here, states, fb),
      source: "ai",
      status: o?.status === "Changes requested" ? "Changes requested" : "Draft",
    })
    setGenerating(false)
  }

  const due = session.closedAt ? session.closedAt + OUTCOME_WINDOW : null
  const left = due && now ? Math.ceil((due - now) / 60000) : null

  const t = themeById(session.theme)
  const words = (o?.sections ?? []).join(" ").trim().split(/\s+/).filter(Boolean).length
  const filled = o ? o.sections.filter((x) => x?.trim()).length : 0
  const tiles: { label: string; n: string; icon: LucideIcon; c: string; bg: string }[] = [
    { label: "Note lines", n: String(note.trim() ? note.trim().split("\n").length : 0), icon: PenLine, c: "text-[#9a6100]", bg: "#fff1d2" },
    { label: "Moderated inputs", n: String(moderated.length), icon: MessageCircle, c: "text-[#1e4fd8]", bg: "#e8efff" },
    { label: "Shortlisted", n: String(here.filter((i) => states[i.id]?.shortlisted).length), icon: Star, c: "text-[#1e4fd8]", bg: "#e8efff" },
    { label: "Discussed", n: String(here.filter((i) => states[i.id]?.discussed).length), icon: Check, c: "text-[#0d8a62]", bg: "#e3f6ee" },
    { label: "Feedback", n: fb ? "Yes" : "None", icon: Sparkles, c: "text-[#6d4df2]", bg: "#efe9ff" },
  ]

  return (
    <CoordShell fullBleed>
      <header
        className="relative overflow-hidden border-b border-[#e6eaf2]"
        style={{ background: `linear-gradient(100deg, ${t.soft} 0%, #ffffff 55%)` }}
      >
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: t.accent }} />
        <div className="relative flex flex-col gap-3 px-4 pt-5 pb-4 sm:flex-row sm:items-center sm:gap-4 md:px-6">
          <div className="flex w-full min-w-0 flex-1 items-start gap-3">
            <Link
              href={`/coordinator/sessions/${session.id}`}
              aria-label="Back to workspace"
              className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/70 text-[#44506e] ring-1 ring-[#e3e7ef] hover:bg-white"
            >
              <ArrowLeft size={17} />
            </Link>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[11.5px] font-semibold tracking-wide uppercase"
                  style={{ color: t.accent, boxShadow: `inset 0 0 0 1px ${t.accent}33` }}
                >
                  <t.icon size={12} /> {session.type}
                </span>
                <span className="text-[12px] font-medium text-[#6b7690]">Session outcome</span>
              </p>
              <h1 className="mt-1.5 truncate text-[22px] leading-tight font-semibold tracking-[-0.02em] text-[#0f1e4d] md:text-[26px]">
                {session.title}
              </h1>
              <p className="mt-0.5 text-[13px] text-[#5e6a85]">
                {formatTime(session.time).range} · {session.venue}
                {session.closedAt && ` · Closed at ${clock(session.closedAt)}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {left !== null && editable && (
              <span
                className={`num inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold ring-1 ring-inset ${left < 0 ? "bg-[#fdefef] text-[#c62828] ring-[#f3c6c7]" : left < 10 ? "bg-[#fff6e5] text-[#9a6100] ring-[#fbe3b4]" : "bg-white text-[#0f1e4d] ring-[#e3e7ef]"}`}
              >
                <Clock3 size={14} />
                {left >= 0 ? `${left} min left` : `${-left} min over`}
                <span className="text-[12px] font-normal opacity-75">of 30-min target</span>
              </span>
            )}
            <Badge tone={outcomeTone(o)}>{o?.status ?? "Not started"}</Badge>
          </div>
        </div>
        <div className="relative flex gap-2 overflow-x-auto px-4 pb-4 md:px-6">
          {tiles.map(({ label, n, icon }) => (
            <KpiTile key={label} label={label} value={n} icon={icon} />
          ))}
        </div>
      </header>

      <div className="p-3 md:p-5">
        {session.status !== "Closed" && !o && (
          <Banner tone="amber" icon={AlertTriangle} title="The session isn't closed yet">
            You can start early, but more inputs may still arrive.
          </Banner>
        )}
        {o?.status === "Changes requested" && (
          <Banner tone="amber" icon={AlertTriangle} title="Admin requested changes">
            {o.adminNote || "Review the draft and resubmit."}
          </Banner>
        )}
        {o?.status === "Submitted" && (
          <Banner tone="blue" icon={Clock3} title="Submitted for admin approval">
            {o.submittedAt ? `Sent at ${clock(o.submittedAt)}.` : ""} Only finalised outcomes go into
            reports.
            <Button size="sm" variant="secondary" className="ml-auto" onClick={() => save({ status: "Draft" })}>
              Withdraw to edit
            </Button>
          </Banner>
        )}
        {o?.status === "Finalised" && (
          <Banner tone="blue" icon={ShieldCheck} title="Finalised by admin">
            This outcome is locked and included in reports.
          </Banner>
        )}

        {generating ? (
          <Card className="grid place-items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[#0b57f5] text-white">
              <Loader2 size={26} className="animate-spin" />
            </span>
            <p className="text-[15px] font-semibold text-[#0f1e4d]">Drafting with the approved prompt…</p>
            <p className="text-[13px] text-[#6b7690]">
              Usually under 2 minutes. Names, emails and hidden inputs are excluded.
            </p>
          </Card>
        ) : ready && !o ? (
          <div className="grid gap-4 md:grid-cols-2">
            <StartOption
              icon={Sparkles}
              title="Generate AI draft"
              text={`Drafts all 7 sections from your notes, ${moderated.length} moderated inputs and feedback, using the approved prompt (Annexure B1). Attendee names are never sent to AI.`}
              cta="Generate draft"
              primary
              onClick={() => void generate()}
              warn={
                !note.trim()
                  ? "Your discussion notes are empty. The draft will only reflect audience inputs."
                  : undefined
              }
            />
            <StartOption
              icon={PenLine}
              title="Write manually"
              text="Same 7-section template. Use it if the AI service is unavailable or you prefer to write it yourself."
              cta="Start writing"
              onClick={() => save({ source: "manual" })}
            />
          </div>
        ) : o ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid min-w-0 content-start gap-2.5 rounded-xl bg-[#f4f6fb] p-2.5 md:p-3">
              {OUTCOME_SECTIONS.map((h, n) => {
                const done = !!o.sections[n]?.trim()
                return (
                  <section
                    key={h}
                    className={`relative overflow-hidden rounded-xl border bg-white p-4 pl-5 ${done ? "border-[#e6eaf2]" : "border-dashed border-[#d5dcea]"}`}
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-1"
                      style={{ background: done ? "#0b57f5" : "#dfe4ee" }}
                    />
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`num grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12.5px] font-semibold ${done ? "bg-[#0b57f5] text-white" : "bg-[#eef1f6] text-[#6b7690]"}`}
                      >
                        {done ? <Check size={14} strokeWidth={2.6} /> : n + 1}
                      </span>
                      <label htmlFor={`sec-${n}`} className="text-[14.5px] font-semibold text-[#0f1e4d]">
                        {h}
                      </label>
                      {n === 0 && (
                        <span className="ml-auto rounded bg-[#fdefef] px-1.5 text-[11px] font-medium text-[#c62828]">
                          Required
                        </span>
                      )}
                    </div>
                    <textarea
                      id={`sec-${n}`}
                      value={o.sections[n] ?? ""}
                      readOnly={!editable}
                      onChange={(e) =>
                        save({
                          sections: OUTCOME_SECTIONS.map((_, k) =>
                            k === n ? e.target.value : (o.sections[k] ?? "")
                          ),
                        })
                      }
                      rows={n === 0 ? 4 : 3}
                      placeholder={sectionHint[n]}
                      className="mt-3 w-full resize-y rounded-lg border border-[#e3e7ef] bg-[#fbfcfe] p-3 text-[13.5px] leading-relaxed text-[#0f1e4d] placeholder:text-[#a4acbf] read-only:border-transparent read-only:bg-[#f7f9fc] focus:border-[#0b57f5] focus:bg-white focus:ring-3 focus:ring-[#0b57f5]/12 focus:outline-none"
                    />
                  </section>
                )
              })}
            </div>

            <div className="grid content-start gap-4 lg:sticky lg:top-[72px] lg:self-start">
              <section className="relative overflow-hidden rounded-xl bg-[#0f1e4d] p-4 text-white shadow-[0_1px_2px_rgba(15,30,77,.08)]">
                <span className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#0b57f5]/40 blur-3xl" />
                <div className="relative">
                  <p className="flex items-center gap-2 text-[15px] font-semibold">
                    <FileText size={16} className="text-[#9dbcff]" /> Outcome
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/60">
                    {o.source === "ai" ? "AI draft · review and edit before submitting" : "Written manually"}
                    {savedAt && <span className="text-[#6ee7b7]"> · Saved {clock(savedAt)}</span>}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/10 p-2.5">
                      <p className="num text-[18px] font-semibold">{filled}/7</p>
                      <p className="text-[11.5px] text-white/60">Sections filled</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-2.5">
                      <p className={`num text-[18px] font-semibold ${words > 600 ? "text-[#ffb4b4]" : ""}`}>
                        {words}/600
                      </p>
                      <p className="text-[11.5px] text-white/60">Words (prompt limit)</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-[#12a37a] transition-[width] duration-500"
                      style={{ width: `${(filled / 7) * 100}%` }}
                    />
                  </div>
                  {editable && (
                    <>
                      <button
                        disabled={!o.sections[0]?.trim()}
                        onClick={() => save({ status: "Submitted", submittedAt: Date.now(), adminNote: undefined })}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-[14px] font-semibold text-[#0f1e4d] hover:bg-[#eef3ff] disabled:opacity-40"
                      >
                        Submit for approval <ChevronRight size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmRegen(true)}
                        className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white/10 text-[13px] font-medium text-white hover:bg-white/15"
                      >
                        <Sparkles size={14} /> {o.source === "ai" ? "Regenerate AI draft" : "Generate AI draft"}
                      </button>
                    </>
                  )}
                </div>
              </section>
              <Card className="p-4">
                <h3 className="text-[13px] font-semibold text-[#0f1e4d]">What the draft uses</h3>
                <ul className="mt-2.5 grid gap-2 text-[13px] text-[#44506e]">
                  <SourceRow ok={!!note.trim()} label={note.trim() ? `Your notes · ${note.trim().split("\n").length} lines` : "Your notes · empty"} />
                  <SourceRow ok={moderated.length > 0} label={`${moderated.length} moderated audience inputs`} />
                  <SourceRow ok={!!fb} label={fb ? "Feedback received" : "No feedback yet"} />
                  <SourceRow ok={false} label="Transcript · admin can upload (optional)" muted />
                </ul>
                <Link href={`/coordinator/sessions/${session.id}`} className="mt-3 inline-block text-[12.5px] font-medium text-[#0b57f5]">
                  Edit notes in workspace →
                </Link>
              </Card>
            </div>
          </div>
        ) : null}
      </div>

      <Modal
        open={confirmRegen}
        onClose={() => setConfirmRegen(false)}
        title="Replace the current draft?"
        description="The AI draft replaces all 7 sections, including your edits."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRegen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmRegen(false)
                void generate()
              }}
            >
              <Sparkles size={15} /> Replace with AI draft
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] text-[#44506e]">Copy anything you want to keep first.</p>
      </Modal>
    </CoordShell>
  )
}

function SourceRow({ ok, label, muted }: { ok: boolean; label: string; muted?: boolean }) {
  return (
    <li className={`flex items-start gap-2 ${muted ? "text-[#8a93ab]" : ""}`}>
      <span
        className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${ok ? "bg-[#ebf8f2] text-[#0d7a57]" : "bg-[#f1f4f9] text-[#a4acbf]"}`}
      >
        {ok ? <Check size={11} /> : <span className="h-1 w-1 rounded-full bg-current" />}
      </span>
      {label}
    </li>
  )
}

function StartOption({
  icon: Icon,
  title,
  text,
  cta,
  onClick,
  primary,
  warn,
}: {
  icon: LucideIcon
  title: string
  text: string
  cta: string
  onClick: () => void
  primary?: boolean
  warn?: string
}) {
  return (
    <section
      className={`relative flex flex-col overflow-hidden rounded-xl border p-5 ${primary ? "border-[#c9d8ff]" : "border-[#e6eaf2] bg-white"}`}
      style={primary ? { background: "linear-gradient(140deg, #eaf1ff 0%, #ffffff 70%)" } : undefined}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: primary ? "#0b57f5" : "#a4acbf" }}
      />
      <span
        className={`grid h-11 w-11 place-items-center rounded-full text-white ${primary ? "bg-[#0b57f5]" : "bg-[#44506e]"}`}
      >
        <Icon size={20} />
      </span>
      <h2 className="mt-3 text-[17px] font-semibold text-[#0f1e4d]">{title}</h2>
      <p className="mt-1 flex-1 text-[13.5px] leading-relaxed text-[#5e6a85]">{text}</p>
      {warn && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-[#fff6e5] px-3 py-2 text-[12.5px] text-[#9a6100]">
          <AlertTriangle size={14} className="mt-px shrink-0" /> {warn}
        </p>
      )}
      <Button variant={primary ? "primary" : "secondary"} size="lg" className="mt-4 w-full" onClick={onClick}>
        {cta} <ChevronRight size={16} />
      </Button>
    </section>
  )
}

/**
 * Stand-in for the AI call (Annexure B1). Uses only notes, moderated inputs
 * and counts — never attendee names — mirroring the prompt's rules.
 */
function draftFrom(
  session: Session,
  notes: string,
  inputs: LiveInput[],
  states: Record<string, InputState>,
  fb?: { rating: number }
): string[] {
  const lines = notes
    .split("\n")
    .map((l) => l.replace(/^\[[^\]]*\]\s*/, "").trim())
    .filter(Boolean)
  const usable = inputs.filter(
    (i) => !states[i.id]?.hidden && !(isFlagged(i.text) && !states[i.id]?.allowed)
  )
  const weight = (i: LiveInput) =>
    i.votes +
    (states[i.id]?.shortlisted ? 20 : 0) +
    (states[i.id]?.discussed ? 10 : 0) +
    (states[i.id]?.visible ? 5 : 0)
  const top = [...usable].sort((a, b) => weight(b) - weight(a))
  const q = inputs.filter((i) => i.kind === "question").length
  const ideas = usable.filter((i) => i.kind === "idea")
  const op = inputs.filter((i) => i.kind === "opinion").length
  const votes = inputs.reduce((n, i) => n + i.votes, 0)
  const pick = (re: RegExp) => lines.filter((l) => re.test(l)).slice(0, 5)
  const bullet = (xs: string[], empty: string) =>
    xs.length ? xs.map((x) => `• ${x}`).join("\n") : empty
  const speakers = session.speakers.map((s) => s.name).filter(Boolean)
  return [
    `The session "${session.title}" (${session.type}) ${speakers.length ? `featured ${speakers.join(", ")}` : "was held"} at ${session.venue}. ${lines[0] ? `Discussion centred on: ${lines[0].replace(/^[^:]{2,40}:\s*/, "")}.` : "Coordinator notes were not provided; this summary reflects audience inputs only."} The audience contributed ${q} questions, ${ideas.length} ideas and ${op} opinions.`,
    bullet(lines.slice(0, 5), "• Add key themes from your notes."),
    bullet(
      top
        .filter((i) => i.kind !== "idea")
        .slice(0, 5)
        .map((i) => `${i.text}${i.kind === "question" ? ` (${i.votes} +1s)` : ""}`),
      "• No moderated audience inputs."
    ),
    bullet(ideas.slice(0, 5).map((i) => i.text), "• No ideas were shared in this session."),
    bullet(
      pick(/recommend|should|propos|need/i),
      "• Add recommendations stated by speakers (action — department — timeframe)."
    ),
    bullet(pick(/action|next|will|follow|by \d/i), "• Add agreed next steps."),
    `Questions: ${q} · Ideas: ${ideas.length} · Opinions: ${op} · +1s: ${votes}${fb ? " · Feedback: received" : " · Feedback: none yet"}`,
  ]
}
