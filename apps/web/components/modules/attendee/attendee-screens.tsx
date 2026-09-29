"use client"
import Link from "next/link"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronUp,
  Clock3,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Send,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react"
import { MobileShell } from "@/components/shells/mobile-shell"
import { Button, Field, inputStyle } from "@/components/ui/primitives"
import { Confetti } from "@/components/shared/confetti"
import { SessionBanner, SpeakerAvatar } from "@/components/shared/session-visual"
import {
  ME,
  clockNow,
  liveSession,
  startMinutes,
  themeById,
  themes,
  useInputActions,
  useInputs,
  useSessions,
  useUpvotes,
  type InputKind,
  type LiveInput,
  type Session,
  type ThemeId,
} from "@/components/shared/summit-data"

const kinds: Record<
  InputKind,
  { label: string; verb: string; icon: LucideIcon; chip: string; prompt: string }
> = {
  question: {
    label: "Ask",
    verb: "Ask a question",
    icon: HelpCircle,
    chip: "bg-blue-50 text-blue-700",
    prompt: "What would you like to ask the speakers?",
  },
  idea: {
    label: "Idea",
    verb: "Share an idea",
    icon: Lightbulb,
    chip: "bg-violet-50 text-violet-700",
    prompt: "What's the idea, in a sentence or two?",
  },
  opinion: {
    label: "Opinion",
    verb: "Share an opinion",
    icon: MessageCircle,
    chip: "bg-emerald-50 text-emerald-700",
    prompt: "What's your take on this?",
  },
}

/** Sessions ordered by start time; `live` is set only when one is actually live. */
function useSchedule() {
  const [sessions] = useSessions()
  const first = liveSession(sessions)
  const live = first?.status === "Live" ? first : undefined
  const rest = sessions
    .filter((s) => s !== first)
    .sort((a, b) => startMinutes(a.time) - startMinutes(b.time))
  return { sessions, live, rest, first }
}

const sessionHref = (s: Session) => `/app/sessions/${s.id}`

export function AttendeeHome() {
  const { live, rest, first } = useSchedule()
  const [inputs] = useInputs()
  const hero = live ?? rest[0] ?? first
  const upNext = rest.filter((s) => s !== hero && s.status !== "Closed")
  const themeCounts = themes
    .map((t) => ({
      t,
      n: inputs.filter((i) => i.kind === "idea" && i.theme === t.id).length,
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
  return (
    <MobileShell>
      <div className="p-5">
        <div className="float-in py-3">
          <p className="text-sm font-semibold text-blue-600">
            Good morning, Arjun 👋
          </p>
          <h1 className="mt-1 font-display text-[34px] leading-tight font-semibold tracking-tight">
            Ready to shape
            <br />
            <em className="font-normal text-blue-600">some ideas?</em>
          </h1>
        </div>

        {hero && (
          <div className="float-in mt-3">
            <p className="mb-2 text-[11px] font-extrabold tracking-[.16em] text-slate-500 uppercase">
              {live ? "Happening now" : "Up next"}
            </p>
            <SessionBanner
              session={hero}
              size="hero"
              footer={
                <div className="grid gap-3">
                  {live && (
                    <span className="flex items-center gap-2 text-xs font-semibold text-white/90">
                      <Users size={15} />
                      156 people participating
                    </span>
                  )}
                  <Link
                    href={sessionHref(hero)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-extrabold text-slate-900 shadow-lg transition-transform active:scale-[.98]"
                  >
                    {live ? "Join the room" : "View session"}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              }
            />
          </div>
        )}

        <p className="mt-8 mb-3 text-[11px] font-extrabold tracking-[.16em] text-slate-500 uppercase">
          ✨ What&apos;s on your mind?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/app/ideas/new"
            className="tap-card grid min-h-32 content-between rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-4 text-white shadow-[0_14px_35px_rgba(91,33,182,.25)]"
          >
            <Lightbulb size={26} />
            <span>
              <strong className="block text-lg">Idea</strong>
              <span className="text-xs text-violet-100">Inspire the summit</span>
            </span>
          </Link>
          <Link
            href={hero ? sessionHref(hero) : "/app/sessions"}
            className="tap-card grid min-h-32 content-between rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 p-4 text-white shadow-[0_14px_35px_rgba(29,78,216,.25)]"
          >
            <HelpCircle size={26} />
            <span>
              <strong className="block text-lg">Ask</strong>
              <span className="text-xs text-blue-100">Question the room</span>
            </span>
          </Link>
        </div>

        {upNext.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-extrabold tracking-[.16em] text-slate-500 uppercase">
                Coming up
              </h2>
              <Link
                href="/app/sessions"
                className="text-xs font-semibold text-blue-600"
              >
                See all
              </Link>
            </div>
            <div className="mt-3 grid gap-3">
              {upNext.slice(0, 2).map((s) => (
                <Link key={s.id} href={sessionHref(s)} className="tap-card block">
                  <SessionBanner session={s} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {themeCounts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[11px] font-extrabold tracking-[.16em] text-slate-500 uppercase">
              🔥 Trending at the summit
            </h2>
            <div className="mt-3 grid gap-2">
              {themeCounts.map(({ t, n }) => (
                <Link
                  key={t.id}
                  href="/app/ideas/new"
                  className="tap-card flex items-center gap-3 rounded-2xl p-3.5"
                  style={{ background: t.soft }}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl text-white"
                    style={{ background: t.gradient }}
                  >
                    <t.icon size={18} />
                  </span>
                  <strong className="flex-1 text-sm">{t.label}</strong>
                  <span className="num text-xs text-slate-600">
                    {n} idea{n > 1 ? "s" : ""} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  )
}

export function SessionsScreen() {
  const [tab, setTab] = useState("Today")
  const [sessions] = useSessions()
  const ordered = [...sessions].sort(
    (a, b) =>
      Number(b.status === "Live") - Number(a.status === "Live") ||
      startMinutes(a.time) - startMinutes(b.time)
  )
  const shown = ordered.filter(
    (s) => tab === "Today" || (tab === "Upcoming" && s.status === "Upcoming")
  )
  return (
    <MobileShell>
      <div className="p-5">
        <h1 className="font-display text-3xl font-semibold">Live</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your summit schedule and live rooms.
        </p>
        <div className="mt-5 flex gap-2">
          {["Today", "Upcoming", "Round tables"].map((x) => (
            <button
              onClick={() => setTab(x)}
              key={x}
              className={`rounded-full px-3 py-2 text-xs font-semibold ${tab === x ? "bg-primary text-white" : "bg-slate-100"}`}
            >
              {x}
            </button>
          ))}
        </div>
        {shown.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed bg-white p-6 text-center text-sm text-muted-foreground">
            {tab === "Round tables"
              ? "Round-table sessions will appear here once the schedule is published."
              : "No upcoming sessions right now."}
          </p>
        )}
        <div className="mt-5 grid gap-3">
          {shown.map((s) => (
            <Link key={s.id} href={sessionHref(s)} className="tap-card block">
              <SessionBanner session={s} />
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}

export function LiveSession() {
  const { id } = useParams<{ id: string }>()
  const { sessions, first } = useSchedule()
  const session =
    sessions.find((s) => s.id.toLowerCase() === String(id).toLowerCase()) ??
    first
  const [inputs, setInputs] = useInputs()
  const [actions] = useInputActions()
  const [upvotes, setUpvotes] = useUpvotes()
  const [sheet, setSheet] = useState<InputKind | null>(null)
  const [text, setText] = useState("")
  const [anon, setAnon] = useState(false)
  const [celebrate, setCelebrate] = useState<InputKind | null>(null)
  const [sort, setSort] = useState<"Top" | "New">("Top")

  if (!session)
    return (
      <MobileShell>
        <p className="p-8 text-center text-sm text-muted-foreground">
          This session isn&apos;t available.
        </p>
      </MobileShell>
    )

  const open = session.status === "Live"
  const theme = themeById(session.theme)
  const here = (i: LiveInput) => !i.sessionId || i.sessionId === session.id
  const all = inputs.filter((i) => i.kind === "question" && here(i))
  const questions = all
    .filter((i) => actions[i.text] !== "Hidden")
    .map((q, order) => ({ q, order }))
  const votes = (q: LiveInput) => q.votes + (upvotes.includes(q.id) ? 1 : 0)
  const sorted = [...questions].sort((a, b) =>
    sort === "Top" ? votes(b.q) - votes(a.q) : b.order - a.order
  )

  const submit = () => {
    const body = text.trim()
    if (!body || !sheet) return
    setInputs((list) => [
      ...list,
      {
        id: `u${Date.now()}`,
        kind: sheet,
        text: body,
        author: anon ? "Anonymous" : ME,
        votes: 0,
        at: clockNow(),
        sessionId: session.id,
        theme: sheet === "idea" ? session.theme : undefined,
        mine: !anon,
      },
    ])
    setCelebrate(sheet)
    setSheet(null)
    setText("")
    setAnon(false)
  }
  const toggleVote = (qid: string) =>
    setUpvotes((v) =>
      v.includes(qid) ? v.filter((x) => x !== qid) : [...v, qid]
    )

  return (
    <MobileShell>
      <div className="p-5 pb-24">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href="/app/sessions"
            aria-label="Back to sessions"
            className="inline-flex rounded-full p-1 hover:bg-slate-100"
          >
            <ArrowLeft />
          </Link>
          {open && (
            <span className="text-xs font-bold text-red-600">🔴 LIVE NOW</span>
          )}
        </div>
        <SessionBanner
          session={session}
          size="hero"
          footer={
            <div className="num flex gap-5 text-xs text-white/85">
              <span>
                <strong className="text-lg text-white">156</strong> here
              </span>
              <span>
                <strong className="text-lg text-white">{all.length}</strong>{" "}
                questions
              </span>
            </div>
          }
        />
        {session.speakers.some((s) => s.name) && (
          <div className="mt-4 grid gap-3 rounded-2xl border bg-white p-4">
            {session.speakers
              .filter((s) => s.name)
              .map((s, i) => (
                <SpeakerAvatar key={i} speaker={s} tone={theme.accent} />
              ))}
          </div>
        )}

        <h2 className="mt-7 text-center text-sm font-extrabold">
          What&apos;s on your mind?
        </h2>
        {!open && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-center text-xs font-semibold text-amber-800">
            {session.status === "Upcoming"
              ? "Participation opens when the session goes live."
              : `Participation is ${session.status.toLowerCase()}.`}
          </p>
        )}
        <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border bg-white p-2 shadow-sm">
          {(Object.keys(kinds) as InputKind[]).map((k) => {
            const K = kinds[k]
            return (
              <button
                key={k}
                disabled={!open}
                onClick={() => setSheet(k)}
                className={`tap-card grid min-h-24 place-items-center rounded-xl p-3 text-center text-xs font-bold disabled:opacity-40 ${K.chip}`}
              >
                <K.icon />
                {K.label}
              </button>
            )
          })}
        </div>

        <div className="mt-7 flex items-end justify-between">
          <h2 className="text-[11px] font-extrabold tracking-[.16em] text-slate-500 uppercase">
            Questions moving up
          </h2>
          <div className="flex gap-1 text-xs font-semibold">
            {(["Top", "New"] as const).map((x) => (
              <button
                key={x}
                onClick={() => setSort(x)}
                aria-pressed={sort === x}
                className={`rounded-full px-2.5 py-1 ${sort === x ? "bg-primary text-white" : "text-muted-foreground"}`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-3">
          {sorted.length === 0 && (
            <p className="rounded-2xl border border-dashed bg-white p-6 text-center text-sm text-muted-foreground">
              No questions yet. Be the first to ask.
            </p>
          )}
          {sorted.map(({ q }) => {
            const up = upvotes.includes(q.id)
            return (
              <div
                key={q.id}
                className="tap-card float-in rounded-2xl border bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                    <HelpCircle size={16} />
                  </span>
                  <p className="text-sm leading-5 font-medium">{q.text}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{q.at}</span>
                  <button
                    onClick={() => toggleVote(q.id)}
                    aria-pressed={up}
                    aria-label={`Upvote, ${votes(q)} votes`}
                    className={`num flex items-center gap-1 rounded-full px-3 py-1.5 font-bold transition-colors ${up ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    <ChevronUp size={14} />
                    {votes(q)}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {open && (
        <button
          onClick={() => setSheet("question")}
          className="fixed bottom-[84px] left-1/2 z-20 flex h-12 w-[calc(100%-24px)] max-w-[408px] -translate-x-1/2 items-center justify-between rounded-2xl border bg-white px-4 text-sm text-muted-foreground shadow-lg"
        >
          Ask your question…
          <Send size={16} className="text-blue-600" />
        </button>
      )}

      {sheet && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45"
          onClick={() => setSheet(null)}
        >
          <div
            role="dialog"
            aria-label={kinds[sheet].verb}
            className="sheet-up absolute bottom-0 left-1/2 w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200" />
            <div className="flex gap-2">
              {(Object.keys(kinds) as InputKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setSheet(k)}
                  aria-pressed={sheet === k}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${sheet === k ? kinds[k].chip + " ring-2 ring-current" : "bg-slate-100 text-slate-500"}`}
                >
                  {kinds[k].label}
                </button>
              ))}
            </div>
            <h2 className="mt-4 text-xl font-extrabold">{kinds[sheet].verb}</h2>
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={400}
              className={`${inputStyle} mt-3 min-h-32 py-3`}
              placeholder={kinds[sheet].prompt}
            />
            <label className="mt-3 flex items-center justify-between text-sm">
              <span>
                Submit anonymously
                <span className="block text-xs text-muted-foreground">
                  Other attendees never see your name either way.
                </span>
              </span>
              <input
                type="checkbox"
                checked={anon}
                onChange={(e) => setAnon(e.target.checked)}
              />
            </label>
            <Button
              onClick={submit}
              disabled={!text.trim()}
              className="mt-5 w-full"
            >
              <Send size={16} />
              Submit
            </Button>
          </div>
        </div>
      )}

      {celebrate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#071f46]/70 p-6 backdrop-blur-sm">
          <div className="pop-in relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <Confetti />
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={34} />
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold">
              You&apos;re in.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your {celebrate} is with the session coordinator.
            </p>
            <Button onClick={() => setCelebrate(null)} className="mt-6 w-full">
              Back to live
            </Button>
          </div>
        </div>
      )}
    </MobileShell>
  )
}

const inspiration = ["What changes?", "Who benefits?", "Why Andhra Pradesh?"]

export function IdeaForm() {
  const router = useRouter()
  const [, setInputs] = useInputs()
  const { first, live } = useSchedule()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [title, setTitle] = useState("")
  const [theme, setTheme] = useState<ThemeId | "">("")
  const [idea, setIdea] = useState("")
  const [problem, setProblem] = useState("")
  const [impact, setImpact] = useState("")

  const submit = () => {
    if (!theme) return
    const session = live ?? first
    setInputs((list) => [
      ...list,
      {
        id: `u${Date.now()}`,
        kind: "idea",
        text: title.trim(),
        author: ME,
        votes: 0,
        at: clockNow(),
        theme,
        sessionId: session?.id,
        problem: [idea.trim(), problem.trim()].filter(Boolean).join("\n\n"),
        impact: impact.trim(),
        mine: true,
      },
    ])
    setDone(true)
  }

  if (done)
    return (
      <MobileShell>
        <div className="relative grid min-h-[75svh] place-items-center p-6 text-center">
          <Confetti />
          <div className="pop-in">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={42} />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold">Idea submitted!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your idea is now with the Summit moderation team.
            </p>
            <Button
              onClick={() => router.push("/app/activity")}
              className="mt-6"
            >
              View my impact
            </Button>
          </div>
        </div>
      </MobileShell>
    )

  const canNext =
    step === 1 ? !!title.trim() && !!theme : step === 2 ? !!idea.trim() : true
  return (
    <MobileShell>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => (step === 1 ? router.back() : setStep(step - 1))}
            aria-label="Back"
            className="rounded-full p-1 hover:bg-slate-100"
          >
            <ArrowLeft />
          </button>
          <span className="num text-xs font-bold text-slate-500">{step}/3</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-colors ${n <= step ? "bg-violet-600" : "bg-slate-200"}`}
            />
          ))}
        </div>

        <form
          key={step}
          className="float-in mt-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (step < 3) setStep(step + 1)
            else submit()
          }}
        >
          {step === 1 && (
            <>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-200 to-orange-100 text-3xl shadow-sm">
                💡
              </span>
              <h1 className="mt-4 font-display text-3xl leading-tight font-semibold">
                Got something
                <br />
                <em className="font-normal text-violet-600">worth building?</em>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with the idea. We&apos;ll get the details after.
              </p>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className={`${inputStyle} mt-6 min-h-14 text-base`}
                placeholder="Give your idea a name…"
              />
              <p className="mt-6 mb-2 text-sm font-bold">
                What does it belong to?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    aria-pressed={theme === t.id}
                    className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm font-bold transition-all ${theme === t.id ? "scale-[1.02] text-white shadow-lg" : "bg-white"}`}
                    style={
                      theme === t.id
                        ? { background: t.gradient, borderColor: t.accent }
                        : undefined
                    }
                  >
                    <t.icon size={18} />
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-xs font-extrabold tracking-[.16em] text-violet-600 uppercase">
                Your idea
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold">
                {title}
              </h1>
              <p className="mt-4 text-sm font-bold">
                Tell us the idea in your words.
              </p>
              <textarea
                autoFocus
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className={`${inputStyle} mt-2 min-h-40 py-3`}
                placeholder="Describe your idea in a few lines…"
              />
              <p className="mt-5 mb-2 text-xs font-bold text-slate-500">
                Need some inspiration? Tap to add a prompt.
              </p>
              <div className="flex flex-wrap gap-2">
                {inspiration.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() =>
                      setIdea((v) => (v ? `${v}\n\n${p} ` : `${p} `))
                    }
                    className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800"
                  >
                    ✨ {p}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="font-display text-3xl font-semibold">
                Almost there 🚀
              </h1>
              <div className="mt-6 grid gap-5">
                <Field label="What problem does this solve?">
                  <textarea
                    autoFocus
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    className={`${inputStyle} min-h-24 py-3`}
                    placeholder="Optional"
                  />
                </Field>
                <Field label="What could the impact be?">
                  <textarea
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    className={`${inputStyle} min-h-24 py-3`}
                    placeholder="Optional"
                  />
                </Field>
              </div>
            </>
          )}
          <Button
            type="submit"
            disabled={!canNext}
            className="mt-8 min-h-12 w-full"
          >
            {step < 3 ? (
              <>
                Continue <ArrowRight size={16} />
              </>
            ) : (
              "Submit my idea 🚀"
            )}
          </Button>
        </form>
      </div>
    </MobileShell>
  )
}

export function ActivityScreen() {
  const [filter, setFilter] = useState("All")
  const [inputs] = useInputs()
  const [actions] = useInputActions()
  const mine = inputs.filter((i) => i.mine || i.author === ME).reverse()
  const ideas = mine.filter((i) => i.kind === "idea")
  const questions = mine.filter((i) => i.kind === "question")
  const byTheme = themes
    .map((t) => ({ t, n: ideas.filter((i) => i.theme === t.id).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
  const max = Math.max(1, ...byTheme.map((x) => x.n))
  const shown = mine.filter(
    (i) =>
      filter === "All" ||
      (filter === "Ideas" && i.kind === "idea") ||
      (filter === "Questions" && i.kind === "question") ||
      (filter === "Opinions" && i.kind === "opinion")
  )
  return (
    <MobileShell>
      <div className="p-5">
        <p className="text-[11px] font-extrabold tracking-[.16em] text-violet-600 uppercase">
          You&apos;ve contributed
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">My Impact</h1>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 p-4">
            <Lightbulb className="text-amber-700" />
            <strong className="num mt-3 block text-3xl">{ideas.length}</strong>
            <span className="text-xs text-slate-600">
              Idea{ideas.length === 1 ? "" : "s"} shared
            </span>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 p-4">
            <HelpCircle className="text-blue-700" />
            <strong className="num mt-3 block text-3xl">
              {questions.length}
            </strong>
            <span className="text-xs text-slate-600">
              Question{questions.length === 1 ? "" : "s"} asked
            </span>
          </div>
        </div>

        {byTheme.length > 0 && (
          <div className="mt-6 rounded-2xl border bg-white p-4">
            <p className="text-xs font-bold text-slate-500">
              Your ideas have joined
            </p>
            <div className="mt-3 grid gap-3">
              {byTheme.map(({ t, n }) => (
                <div key={t.id}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <t.icon size={13} style={{ color: t.accent }} />
                      {t.label}
                    </span>
                    <span className="num text-slate-500">{n}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bar-grow h-full rounded-full"
                      style={{
                        width: `${(n / max) * 100}%`,
                        background: t.gradient,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2 overflow-auto">
          {["All", "Ideas", "Questions", "Opinions"].map((x) => (
            <button
              onClick={() => setFilter(x)}
              key={x}
              className={`rounded-full px-3 py-2 text-xs font-semibold ${filter === x ? "bg-primary text-white" : "bg-slate-100"}`}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          {shown.length === 0 && (
            <p className="rounded-2xl border border-dashed bg-white p-6 text-center text-sm text-muted-foreground">
              Nothing here yet.{" "}
              <Link href="/app/ideas/new" className="font-bold text-blue-600">
                Share an idea
              </Link>
            </p>
          )}
          {shown.map((i) => {
            const K = kinds[i.kind]
            const t = i.theme ? themeById(i.theme) : null
            const status = actions[i.text]
            return (
              <div
                key={i.id}
                className="tap-card flex gap-3 rounded-2xl border bg-white p-4"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${K.chip}`}
                >
                  <K.icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold">{i.text}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {i.kind === "question"
                      ? i.votes > 0
                        ? `▲ ${i.votes} people also want this answered`
                        : "Waiting for votes"
                      : status === "Shortlisted"
                        ? "⭐ Shortlisted by the team"
                        : status === "Discussed"
                          ? "✓ Discussed in the room"
                          : t
                            ? `In the ${t.label} conversation`
                            : "Submitted"}
                  </p>
                </div>
                <span className="num shrink-0 text-xs text-slate-400">
                  {i.at.replace(" AM", "").replace(" PM", "")}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </MobileShell>
  )
}

export function MoreScreen() {
  return (
    <MobileShell>
      <div className="p-5">
        <h1 className="text-2xl font-extrabold">Profile & settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account and summit resources.
        </p>
        <div className="mt-5 grid gap-3">
          {[
            ["Edit profile", "/profile/setup"],
            ["Summit feedback", "/app/feedback"],
            ["Privacy & consent", "/consent"],
            ["Sign out", "/login"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href!}
              className="flex min-h-12 items-center justify-between rounded-xl border bg-white px-4 text-sm font-semibold"
            >
              {label}
              <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  )
}

const moods = [
  ["😕", "Meh"],
  ["😐", "Okay"],
  ["🙂", "Good"],
  ["🤩", "Great"],
  ["🔥", "Fire"],
] as const

export function FeedbackScreen() {
  const [rating, setRating] = useState(4)
  const [sent, setSent] = useState(false)
  const { first } = useSchedule()
  return (
    <MobileShell>
      <div className="relative p-5 text-center">
        {sent && <Confetti />}
        <div className="mt-8 text-5xl">🎉</div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-emerald-800">
          That was a wrap!
        </h1>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold">
          <Clock3 size={14} /> {first?.title ?? "The session"}
        </p>
        {sent ? (
          <div className="pop-in mt-14">
            <CheckCircle2 className="mx-auto text-emerald-600" size={54} />
            <h2 className="mt-4 text-xl font-bold">
              Thank you for your feedback
            </h2>
            <Link
              href="/app/home"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
            >
              <Sparkles size={15} /> Back to discover
            </Link>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSent(true)
            }}
            className="mt-10 grid gap-5 rounded-3xl border border-white bg-white p-5 text-left shadow-[0_16px_45px_rgba(16,33,61,.08)]"
          >
            <div>
              <p className="text-center text-sm font-bold">
                How did that session feel?
              </p>
              <div className="mt-3 flex justify-center gap-2">
                {moods.map(([emoji, label], i) => (
                  <button
                    type="button"
                    onClick={() => setRating(i + 1)}
                    key={label}
                    aria-label={`${i + 1} of 5: ${label}`}
                    aria-pressed={i + 1 === rating}
                    className="grid gap-1 text-center"
                  >
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-xl text-2xl transition-all ${i + 1 === rating ? "scale-110 bg-amber-100" : "bg-slate-50 opacity-55"}`}
                    >
                      {emoji}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <Field label="What stuck with you?">
              <textarea
                className={`${inputStyle} min-h-24 py-3`}
                placeholder="One thought you'll remember…"
              />
            </Field>
            <Field label="What should we do better?">
              <textarea
                className={`${inputStyle} min-h-24 py-3`}
                placeholder="Optional"
              />
            </Field>
            <Button type="submit" className="min-h-12">
              Send it ✨
            </Button>
          </form>
        )}
      </div>
    </MobileShell>
  )
}
