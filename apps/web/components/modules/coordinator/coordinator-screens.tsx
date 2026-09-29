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
  MessageCircle,
  PauseCircle,
  PenLine,
  Play,
  Presentation,
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
  Segmented,
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

const statusTone = (status: string): Tone =>
  status === "Live" ? "green" : status === "Paused" ? "amber" : status === "Closed" ? "gray" : "blue"

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
            <p className="px-2.5 pb-2 text-[11px] font-semibold tracking-wider text-[#8a93ab] uppercase">
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
                className={`flex h-9 items-center gap-2.5 rounded-lg text-[13px] ${mini ? "justify-center" : "px-2.5"} ${active ? "bg-[#f1f4f9] font-medium text-[#0f1e4d]" : "text-[#44506e] hover:bg-[#f4f6fa]"}`}
              >
                <StatusDot status={s.status} />
                {!mini && (
                  <>
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    <span className="num text-[11.5px] text-[#8a93ab]">
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
  const focus =
    mine.find((s) => s.status === "Live" || s.status === "Paused") ??
    mine.find(
      (s) =>
        s.status === "Closed" &&
        outcomes[s.id]?.status !== "Finalised" &&
        outcomes[s.id]?.status !== "Submitted"
    ) ??
    mine.find((s) => s.status === "Upcoming")
  const live = mine.filter((s) => s.status === "Live").length
  const hour = now ? new Date(now).getHours() : 9
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <CoordShell>
      <section className="sunrise relative mb-5 overflow-hidden rounded-xl border border-[#eadfd3]">
        <Illus
          name="skyline-soft"
          priority
          className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-auto opacity-90 md:block"
        />
        <div className="relative p-5 md:p-6">
          <p className="text-[13px] font-medium text-[#5e6a85]">Sat 3 Oct · Coordinator</p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-tight text-[#0f1e4d]">
            {greet}, {COORDINATOR.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[14px] text-[#44506e]">
            {mine.length} session{mine.length === 1 ? "" : "s"} assigned to you
            {live ? ` · ${live} live now` : ""}.
          </p>
        </div>
      </section>

      {focus && (
        <FocusCard
          session={focus}
          pending={unreviewed(inputs, states, focus.id)}
          outcome={outcomes[focus.id]}
          now={now}
        />
      )}

      <Card className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#eef1f6] px-4 py-3">
          <h2 className="text-[14px] font-semibold text-[#0f1e4d]">Today&apos;s sessions</h2>
          <span className="text-[12.5px] text-[#6b7690]">Only sessions assigned to you</span>
        </div>
        {ready && mine.length === 0 && (
          <p className="p-8 text-center text-[13.5px] text-[#6b7690]">
            No sessions are assigned to you yet. The admin team assigns coordinators.
          </p>
        )}
        <ul className="divide-y divide-[#eef1f6]">
          {mine.map((s) => {
            const o = outcomes[s.id]
            const pending = unreviewed(inputs, states, s.id)
            const total = inputs.filter((i) => i.sessionId === s.id).length
            return (
              <li key={s.id}>
                <Link
                  href={
                    s.status === "Closed"
                      ? `/coordinator/sessions/${s.id}/outcome`
                      : `/coordinator/sessions/${s.id}`
                  }
                  className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 hover:bg-[#fafbfd] md:grid-cols-[72px_minmax(0,1fr)_150px_190px_20px]"
                >
                  <span className="num text-[13px] leading-tight text-[#44506e]">
                    {s.time.split(/[–-]/)[0]}
                    <span className="block text-[#8a93ab]">{s.time.split(/[–-]/)[1]}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <StatusDot status={s.status} />
                      <span className="truncate text-[14px] font-medium text-[#0f1e4d]">
                        {s.title}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-[#6b7690]">
                      {s.type} · {s.venue}
                      {s.access === "Invited" && " · Invited only"}
                    </span>
                  </span>
                  <span className="hidden text-[12.5px] text-[#44506e] md:block">
                    <span className="num font-medium text-[#0f1e4d]">{total}</span> inputs
                    {pending > 0 && s.status !== "Upcoming" && (
                      <span className="ml-1.5 rounded bg-[#eef3ff] px-1.5 py-0.5 text-[11.5px] font-medium text-[#1e4fd8]">
                        {pending} new
                      </span>
                    )}
                  </span>
                  <span className="justify-self-end md:justify-self-start">
                    {s.status === "Closed" ? (
                      <Badge tone={outcomeTone(o)}>
                        {o ? `Outcome ${o.status.toLowerCase()}` : "Outcome due"}
                      </Badge>
                    ) : (
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    )}
                  </span>
                  <ChevronRight size={16} className="hidden text-[#a4acbf] md:block" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>
    </CoordShell>
  )
}

function FocusCard({
  session,
  pending,
  outcome,
  now,
}: {
  session: Session
  pending: number
  outcome?: Outcome
  now: number | null
}) {
  const t = themeById(session.theme)
  const closed = session.status === "Closed"
  const due = session.closedAt ? session.closedAt + OUTCOME_WINDOW : null
  const left = due && now ? due - now : null
  const [headline, detail, cta, href]: [string, string, string, string] = closed
    ? outcome?.status === "Changes requested"
      ? [
          "Admin requested changes",
          outcome.adminNote || "Review the note and resubmit.",
          "Revise outcome",
          "outcome",
        ]
      : [
          "Outcome due",
          left !== null
            ? left > 0
              ? `${Math.ceil(left / 60000)} min left of the 30-minute target`
              : `${Math.ceil(-left / 60000)} min past the 30-minute target`
            : "Draft it within 30 minutes of closing.",
          outcome ? "Continue outcome" : "Write outcome",
          "outcome",
        ]
    : session.status === "Upcoming"
      ? [
          "Up next",
          `Starts at ${formatTime(session.time).start} · ${session.venue}`,
          "Open workspace",
          "",
        ]
      : [
          session.status === "Paused" ? "Paused" : "Live now",
          pending
            ? `${pending} new input${pending > 1 ? "s" : ""} waiting for review`
            : "You're up to date",
          "Open workspace",
          "",
        ]
  return (
    <Card className="relative overflow-hidden">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: t.accent }} />
      <div className="flex flex-wrap items-center gap-4 p-4 pl-5 md:p-5 md:pl-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#6b7690]">
            <StatusDot status={session.status} />
            {headline}
          </div>
          <h2 className="mt-1 text-[18px] font-semibold tracking-tight text-[#0f1e4d]">
            {session.title}
          </h2>
          <p className="mt-0.5 text-[13px] text-[#5e6a85]">{detail}</p>
        </div>
        <Link
          href={`/coordinator/sessions/${session.id}${href ? `/${href}` : ""}`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b57f5] px-4 text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(11,87,245,.35)] hover:bg-[#0a4ddb]"
        >
          {cta} <ChevronRight size={16} />
        </Link>
      </div>
    </Card>
  )
}

/* ================================================================ */
/* Session workspace                                                 */
/* ================================================================ */
const kindMeta: Record<InputKind, { label: string; icon: LucideIcon; tint: string }> = {
  question: { label: "Question", icon: HelpCircle, tint: "bg-[#eef3ff] text-[#1e4fd8]" },
  idea: { label: "Idea", icon: Lightbulb, tint: "bg-[#fff6e5] text-[#b27000]" },
  opinion: { label: "Opinion", icon: MessageCircle, tint: "bg-[#ebf8f2] text-[#0d7a57]" },
}
type TypeFilter = "all" | InputKind
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
  const session = sessions.find((s) => s.id.toLowerCase() === String(id).toLowerCase())
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
  const [confirmClose, setConfirmClose] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
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
        if (key === "v" && item.kind !== "question") return
        actRef.current(item, map[key]!)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, presenting, confirmClose, qrOpen])
  useEffect(() => {
    if (!selected) return
    document.getElementById(`row-${selected}`)?.scrollIntoView({ block: "nearest" })
  }, [selected])

  const outcome = outcomes[session.id]
  const t = themeById(session.theme)

  const feed = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#eef1f6] p-3">
        <Segmented
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { id: "all", label: "All", count: counts.all },
            { id: "question", label: "Questions", count: counts.question },
            { id: "idea", label: "Ideas", count: counts.idea },
            { id: "opinion", label: "Opinions", count: counts.opinion },
          ]}
        />
        <div className="relative ml-auto min-w-[160px] flex-1 sm:max-w-[240px]">
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
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "votes")}
          aria-label="Sort"
          className="h-8 rounded-md border border-[#dfe4ee] bg-white px-2 text-[13px] text-[#0f1e4d]"
        >
          <option value="newest">Newest first</option>
          <option value="votes">Most +1</option>
        </select>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#eef1f6] px-3 py-2">
        {(
          [
            ["all", "All"],
            ["new", "New"],
            ["visible", "Visible"],
            ["shortlisted", "Shortlisted"],
            ["discussed", "Discussed"],
            ["hidden", "Hidden"],
            ["flagged", "Flagged"],
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
              className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium ring-1 ring-inset transition-colors ${on ? "bg-[#0f1e4d] text-white ring-[#0f1e4d]" : warn ? "bg-[#fdefef] text-[#c62828] ring-[#f7d2d2]" : "bg-white text-[#44506e] ring-[#e3e7ef] hover:bg-[#f7f9fc]"}`}
            >
              {f === "flagged" && <AlertTriangle size={12} />}
              {label}
              <span className={`num ${on ? "text-white/70" : "text-[#8a93ab]"}`}>{n}</span>
            </button>
          )
        })}
      </div>

      {arrived.length > 0 && (
        <div className="flex justify-center border-b border-[#eef1f6] bg-[#f7f9fc] py-2">
          <button
            onClick={() => setSeen(all.map((i) => i.id))}
            className="pop-in inline-flex h-8 items-center gap-1.5 rounded-full bg-[#0b57f5] px-3.5 text-[12.5px] font-medium text-white shadow-[0_6px_18px_rgba(11,87,245,.35)]"
          >
            <ArrowUp size={14} /> {arrived.length} new input{arrived.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      <ul role="listbox" aria-label="Inputs" className="divide-y divide-[#eef1f6]">
        {shown.map((i) => (
          <InputRow
            key={i.id}
            input={i}
            state={st(i)}
            flagged={flagged(i)}
            fresh={isNew(i)}
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
            <StatusControl
              status={session.status}
              onChange={(x) => (x === "Closed" ? setConfirmClose(true) : setStatus(x))}
            />
            <Button variant="secondary" onClick={() => setQrOpen(true)} aria-label="Session QR code">
              <QrCode size={16} /> <span className="hidden sm:inline">QR</span>
            </Button>
          </div>
        </div>

        {/* Live pulse: the numbers that decide what to do next */}
        <div className="relative flex gap-2 overflow-x-auto px-4 pb-4 md:px-6">
          {(
            [
              { label: "Questions", n: counts.question, icon: HelpCircle, c: "text-[#1e4fd8]", go: () => { setTypeFilter("question"); setStatusFilter("all") } },
              { label: "Ideas", n: counts.idea, icon: Lightbulb, c: "text-[#b27000]", go: () => { setTypeFilter("idea"); setStatusFilter("all") } },
              { label: "Opinions", n: counts.opinion, icon: MessageCircle, c: "text-[#0d7a57]", go: () => { setTypeFilter("opinion"); setStatusFilter("all") } },
              { label: "+1s", n: loaded.reduce((n, i) => n + i.votes, 0), icon: ArrowUp, c: "text-[#1e4fd8]", go: () => { setTypeFilter("question"); setSort("votes") } },
              { label: "New", n: loaded.filter(isNew).length, icon: Sparkles, c: "text-[#1e4fd8]", hot: "bg-[#0b57f5] text-white ring-[#0b57f5] shadow-[0_6px_16px_-6px_rgba(11,87,245,.7)]", go: () => { setTypeFilter("all"); setStatusFilter("new") } },
              { label: "Flagged", n: loaded.filter(flagged).length, icon: AlertTriangle, c: "text-[#c62828]", hot: "bg-[#fdefef] text-[#c62828] ring-[#f3c6c7]", go: () => { setTypeFilter("all"); setStatusFilter("flagged") } },
            ] as { label: string; n: number; icon: LucideIcon; c: string; hot?: string; go: () => void }[]
          ).map(({ label, n, icon: Icon, c, hot, go }) => (
            <button
              key={label}
              onClick={go}
              className={`flex h-12 shrink-0 items-center gap-2.5 rounded-lg px-3.5 text-left ring-1 transition-all hover:-translate-y-px ${hot && n > 0 ? hot : "bg-white/85 ring-[#e6eaf2] hover:bg-white"}`}
            >
              <Icon size={16} className={hot && n > 0 ? "" : c} />
              <span className="leading-tight">
                <span className="num block text-[17px] font-semibold">{n}</span>
                <span className={`block text-[11.5px] ${hot && n > 0 ? "opacity-85" : "text-[#6b7690]"}`}>
                  {label}
                </span>
              </span>
            </button>
          ))}
        </div>
      </header>

      <div className="sticky top-14 z-20 flex border-b border-[#e6eaf2] bg-white lg:hidden">
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
        {session.status === "Upcoming" && (
          <Banner tone="blue" icon={Clock3} title={`Starts at ${formatTime(session.time).start}`}>
            Attendees see “Opens at {formatTime(session.time).start}” until you go live.
            <Button size="sm" className="ml-auto" onClick={() => setStatus("Live")}>
              <Play size={14} /> Go live
            </Button>
          </Banner>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className={`min-w-0 overflow-hidden ${tab === "inputs" ? "" : "hidden lg:block"}`}>
            {feed}
          </Card>
          <div
            className={`grid content-start gap-4 lg:sticky lg:top-[72px] ${tab === "inputs" ? "hidden lg:grid" : ""}`}
          >
            <div className={tab === "notes" ? "hidden lg:block" : ""}>
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
              />
            </div>
            <div className={tab === "shortlist" ? "hidden lg:block" : ""}>
              <NotesPanel session={session} />
            </div>
          </div>
        </div>
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
  opinion: "#12a37a",
}

function InputRow({
  input: i,
  state: s,
  flagged,
  fresh,
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
      className={`relative cursor-default py-4 pr-3 pl-5 transition-colors md:pr-4 md:pl-6 ${flagged ? "bg-[#fffafa]" : listed ? "bg-[#f8faff]" : "hover:bg-[#fafbfd]"} ${selected ? "shadow-[inset_0_0_0_2px_rgba(11,87,245,.35)]" : ""} ${s.hidden ? "opacity-50" : ""}`}
    >
      <span
        className="absolute inset-y-3 left-0 w-[3px] rounded-r-full"
        style={{ background: flagged ? "#e5373b" : kindEdge[i.kind] }}
      />
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] font-semibold tracking-wide uppercase">
            <span className="inline-flex items-center gap-1" style={{ color: kindEdge[i.kind] }}>
              <K.icon size={13} /> {K.label}
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
            {i.kind === "question" && (
              <button
                onClick={fire("visible")}
                disabled={flagged && !s.visible}
                aria-pressed={shown}
                title={flagged && !s.visible ? "Review the flagged word first" : "Show to the room (V)"}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${shown ? "bg-[#12a37a] text-white shadow-[0_4px_12px_-4px_rgba(18,163,122,.7)]" : "bg-[#ebf8f2] text-[#0d7a57] ring-1 ring-[#cdeede] ring-inset hover:bg-[#dff4ea]"}`}
              >
                {shown ? <Check size={14} strokeWidth={2.6} /> : <Eye size={14} />}
                {shown ? "In room" : "Show to room"}
              </button>
            )}
            <button
              onClick={fire("shortlisted")}
              aria-pressed={listed}
              title="Shortlist for the moderator (S)"
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-semibold transition-all active:scale-95 ${listed ? "bg-[#0b57f5] text-white shadow-[0_4px_12px_-4px_rgba(11,87,245,.7)]" : "bg-[#eef3ff] text-[#1e4fd8] ring-1 ring-[#d6e2ff] ring-inset hover:bg-[#e2ebff]"}`}
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
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-all active:scale-95 ${s.discussed ? "bg-[#0f1e4d] text-white" : "text-[#5e6a85] hover:bg-[#f1f4f9] hover:text-[#0f1e4d]"}`}
            >
              <Check size={14} />
              <span className="hidden sm:inline">Discussed</span>
            </button>
            <button
              onClick={fire("hidden")}
              aria-pressed={!!s.hidden}
              aria-label={s.hidden ? "Unhide" : "Hide"}
              title="Hide (H)"
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-all active:scale-95 ${s.hidden ? "bg-[#c62828] text-white" : "text-[#5e6a85] hover:bg-[#fdefef] hover:text-[#c62828]"}`}
            >
              <EyeOff size={14} />
              <span className="hidden sm:inline">{s.hidden ? "Unhide" : "Hide"}</span>
            </button>
          </div>
        </div>

        {i.kind === "question" && (
          <div
            className={`flex w-14 shrink-0 flex-col items-center justify-center self-start rounded-xl py-2.5 md:w-16 ${hot ? "bg-[#0b57f5] text-white shadow-[0_8px_18px_-8px_rgba(11,87,245,.8)]" : "bg-[#f3f6fc] text-[#1e4fd8]"}`}
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
}: {
  items: LiveInput[]
  states: Record<string, InputState>
  onPresent: () => void
  onMove: (from: number, to: number) => void
  onDiscussed: (i: LiveInput) => void
  onRemove: (i: LiveInput) => void
}) {
  const done = items.filter((i) => states[i.id]?.discussed).length
  return (
    <section className="relative overflow-hidden rounded-xl bg-[#0f1e4d] text-white shadow-[0_18px_40px_-16px_rgba(15,30,77,.65)]">
      <span className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#0b57f5]/40 blur-3xl" />
      <div className="relative flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
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
        <ol className="relative max-h-[42svh] divide-y divide-white/10 overflow-y-auto">
          {items.map((i, idx) => {
            const d = !!states[i.id]?.discussed
            return (
              <li key={i.id} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`num mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${d ? "bg-[#12a37a] text-white" : "bg-white text-[#0f1e4d]"}`}
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
    </section>
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
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#eef1f6] px-4 py-3">
        <div>
          <h2 className="text-[14px] font-semibold text-[#0f1e4d]">Discussion notes</h2>
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
            className="h-7 rounded-full bg-[#f1f4f9] px-2.5 text-[12px] font-medium text-[#44506e] hover:bg-[#e6ebf3]"
            title="Insert speaker name"
          >
            + {s.name}
          </button>
        ))}
        <button
          onClick={() => insert(`[${clock(Date.now())}] `)}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-[#f1f4f9] px-2.5 text-[12px] font-medium text-[#44506e] hover:bg-[#e6ebf3]"
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
        className="m-3 min-h-[220px] flex-1 resize-y rounded-lg border border-[#dfe4ee] p-3 text-[13.5px] leading-relaxed text-[#0f1e4d] placeholder:text-[#a4acbf] focus:border-[#0b57f5] focus:ring-3 focus:ring-[#0b57f5]/12 focus:outline-none"
      />
      <p className="num -mt-1 px-4 pb-3 text-right text-[11.5px] text-[#8a93ab]">
        {value.length}/{MAX}
      </p>
    </Card>
  )
}

/** SES-08: one shortlisted item at a time, in large text, for relaying on stage. */
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
      <div className="flex items-center justify-center gap-3 px-5 pb-8">
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
  const session = sessions.find((s) => s.id.toLowerCase() === String(id).toLowerCase())
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

  return (
    <CoordShell>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href={`/coordinator/sessions/${session.id}`}
            aria-label="Back to workspace"
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#44506e] hover:bg-[#e9edf4]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-[12.5px] font-medium text-[#6b7690]">
              Session outcome · {session.type}
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight text-[#0f1e4d]">
              {session.title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {left !== null && editable && (
            <Badge tone={left < 0 ? "red" : left < 10 ? "amber" : "gray"} dot={false}>
              <Clock3 size={12} />{" "}
              {left >= 0 ? `${left} min to 30-min target` : `${-left} min past target`}
            </Badge>
          )}
          <Badge tone={outcomeTone(o)}>{o?.status ?? "Not started"}</Badge>
        </div>
      </div>

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
          {o.submittedAt ? `Sent at ${clock(o.submittedAt)}.` : ""} Only finalised outcomes go
          into reports.
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto"
            onClick={() => save({ status: "Draft" })}
          >
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
          <Loader2 size={26} className="animate-spin text-[#0b57f5]" />
          <p className="text-[14px] font-medium text-[#0f1e4d]">
            Drafting with the approved prompt…
          </p>
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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="min-w-0 divide-y divide-[#eef1f6]">
            {OUTCOME_SECTIONS.map((h, n) => (
              <div key={h} className="p-4 md:p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <label
                    htmlFor={`sec-${n}`}
                    className="text-[13.5px] font-semibold text-[#0f1e4d]"
                  >
                    {n + 1}. {h}
                  </label>
                  {n === 0 && <span className="text-[11.5px] text-[#8a93ab]">Required</span>}
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
                  className="mt-2 w-full resize-y rounded-lg border border-[#e3e7ef] bg-white p-3 text-[13.5px] leading-relaxed text-[#0f1e4d] placeholder:text-[#a4acbf] read-only:border-transparent read-only:bg-[#f7f9fc] focus:border-[#0b57f5] focus:ring-3 focus:ring-[#0b57f5]/12 focus:outline-none"
                />
              </div>
            ))}
          </Card>
          <div className="grid content-start gap-4 lg:sticky lg:top-20">
            <Card className="p-4">
              <p className="text-[12.5px] text-[#6b7690]">
                {o.source === "ai" ? "AI draft · review and edit before submitting" : "Written manually"}
                {savedAt && <span className="text-[#0d7a57]"> · Saved {clock(savedAt)}</span>}
              </p>
              {editable && (
                <>
                  <Button
                    className="mt-3 w-full"
                    disabled={!o.sections[0]?.trim()}
                    onClick={() =>
                      save({ status: "Submitted", submittedAt: Date.now(), adminNote: undefined })
                    }
                  >
                    Submit for approval
                  </Button>
                  <Button
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={() => setConfirmRegen(true)}
                  >
                    <Sparkles size={15} />{" "}
                    {o.source === "ai" ? "Regenerate AI draft" : "Generate AI draft"}
                  </Button>
                </>
              )}
            </Card>
            <Card className="p-4">
              <h3 className="text-[13px] font-semibold text-[#0f1e4d]">Sources</h3>
              <ul className="mt-2.5 grid gap-2 text-[13px] text-[#44506e]">
                <SourceRow
                  ok={!!note.trim()}
                  label={
                    note.trim()
                      ? `Your notes · ${note.trim().split("\n").length} lines`
                      : "Your notes · empty"
                  }
                />
                <SourceRow ok={moderated.length > 0} label={`${moderated.length} moderated audience inputs`} />
                <SourceRow
                  ok
                  label={`${here.filter((i) => states[i.id]?.shortlisted).length} shortlisted · ${here.filter((i) => states[i.id]?.discussed).length} discussed`}
                />
                <SourceRow ok={!!fb} label={fb ? "Feedback received" : "No feedback yet"} />
                <SourceRow ok={false} label="Transcript · admin can upload (optional)" muted />
              </ul>
              <Link
                href={`/coordinator/sessions/${session.id}`}
                className="mt-3 inline-block text-[12.5px] font-medium text-[#0b57f5]"
              >
                Edit notes in workspace →
              </Link>
            </Card>
          </div>
        </div>
      ) : null}

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
    <Card className="flex flex-col p-5">
      <span
        className={`grid h-10 w-10 place-items-center rounded-lg ${primary ? "bg-[#eef3ff] text-[#0b57f5]" : "bg-[#f3f5f9] text-[#44506e]"}`}
      >
        <Icon size={20} />
      </span>
      <h2 className="mt-3 text-[16px] font-semibold text-[#0f1e4d]">{title}</h2>
      <p className="mt-1 flex-1 text-[13.5px] leading-relaxed text-[#5e6a85]">{text}</p>
      {warn && (
        <p className="mt-3 rounded-md bg-[#fff6e5] px-2.5 py-2 text-[12.5px] text-[#9a6100]">
          {warn}
        </p>
      )}
      <Button variant={primary ? "primary" : "secondary"} className="mt-4 w-full" onClick={onClick}>
        {cta}
      </Button>
    </Card>
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
