"use client"
import Link from "next/link"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowRight,
  CalendarClock,
  ChevronUp,
  ClipboardList,
  Clock3,
  HelpCircle,
  Info,
  Lightbulb,
  Lock,
  MessageCircle,
  MessageSquareHeart,
  PauseCircle,
  Plus,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react"
import { MobileShell } from "@/components/shells/mobile-shell"
import { Confetti } from "@/components/shared/confetti"
import {
  ChevronDot,
  FeatureCard,
  Illus,
  PageHero,
  Pill,
  PrimaryButton,
  QueuedNotice,
  SecondaryButton,
  SessionMeta,
  SessionRow,
  SpeakerChips,
  StateCard,
  Stars,
  TextField,
  UnderlineTabs,
  selectClass,
  useSubmit,
} from "@/components/modules/attendee/kit"
import {
  EVENT_DATE,
  INPUT_MAX,
  ME,
  canJoin,
  formatTime,
  ideaFields,
  messages,
  startMinutes,
  themeById,
  themes,
  useEventConfig,
  useFeedback,
  useInputStates,
  visibleToRoom,
  useInputs,
  useProfile,
  useSessions,
  useSummitFeedback,
  useUpvotes,
  type InputKind,
  type LiveInput,
  type Session,
  type ThemeId,
  matchesSessionId,
} from "@/components/shared/summit-data"

const sessionHref = (s: Session) => `/app/sessions/${s.id}`
const byStart = (a: Session, b: Session) =>
  startMinutes(a.time) - startMinutes(b.time)

/** Closed sessions the attendee can still give feedback on (FDB-01). */
function useFeedbackDue() {
  const [sessions] = useSessions()
  const [feedback] = useFeedback()
  return sessions.filter(
    (s) => s.status === "Closed" && s.feedback && canJoin(s) && !feedback[s.id]
  )
}

/* ================================================================ */
/* Home                                                              */
/* ================================================================ */
export function AttendeeHome() {
  const [sessions] = useSessions()
  const [profile] = useProfile()
  const [config] = useEventConfig()
  const due = useFeedbackDue()
  const open = sessions.filter((s) => s.access === "Open").sort(byStart)
  const live = open.find((s) => s.status === "Live")
  const next = open.find((s) => s.status === "Upcoming")
  const hero = live ?? next
  const first = (profile?.name || ME).split(" ")[0]

  return (
    <MobileShell>
      <section className="sunrise relative overflow-hidden">
        <div className="px-5 pt-7">
          <h1 className="font-display text-[30px] leading-tight text-[#0f1e4d]">
            Welcome, {first}!
          </h1>
          <p className="mt-1 text-[16px] text-[#5e6a85]">
            Let&apos;s make a brighter Andhra together.
          </p>
        </div>
        <Illus name="skyline-hero" priority className="mt-2 block w-full" />
      </section>

      <div className="relative z-10 -mt-12 space-y-3 px-4">
        {hero && (
          <div className="card-soft p-4">
            {live ? (
              <Pill tone="red">
                <span className="live-pulse h-1.5 w-1.5 rounded-full bg-white" />
                Happening Now
              </Pill>
            ) : (
              <Pill tone="upcoming">Up next</Pill>
            )}
            <h2 className="mt-3 text-[20px] leading-snug font-bold text-[#0f1e4d]">
              {hero.title}
            </h2>
            <SessionMeta session={hero} />
            <Link
              href={sessionHref(hero)}
              className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0b57f5] text-[16px] font-semibold text-white shadow-[0_8px_20px_rgba(11,87,245,.25)]"
            >
              {live ? "Join Session" : "View Session"} <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {due.map((s) => (
          <Link
            key={s.id}
            href={sessionHref(s)}
            className="tap-card flex items-center gap-3 rounded-2xl bg-[#e6f6ef] p-4"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#12a37a] text-white">
              <MessageSquareHeart size={21} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-[16px] text-[#0f1e4d]">
                How was {s.title}?
              </strong>
              <span className="text-[13px] text-[#44506e]">
                Rate it in under 30 seconds
              </span>
            </span>
            <ChevronDot />
          </Link>
        ))}

        {config.summitFeedbackOpen && (
          <FeatureCard
            href="/app/feedback"
            tone="green"
            icon={MessageSquareHeart}
            title="Summit Feedback"
            text="Tell us how the Summit went."
          />
        )}

        <FeatureCard
          href="/app/ideas/new"
          tone="amber"
          icon={Lightbulb}
          title="Share Your Idea"
          text="Contribute to a brighter Andhra across Summit themes."
        />
        <FeatureCard
          href="/app/sessions"
          tone="blue"
          icon={Users}
          title="Join Live Session"
          text="Ask questions, share ideas and give opinions."
        />
        <FeatureCard
          href="/app/submissions"
          tone="lavender"
          icon={ClipboardList}
          title="My Submissions"
          text="View and manage your ideas and session inputs."
        />

        <div className="relative flex min-h-32 items-center overflow-hidden rounded-2xl bg-[#fff3d6]">
          <p className="relative z-10 w-[50%] py-5 pl-5 text-[16px] leading-snug font-semibold text-[#0f1e4d]">
            Ideas from the Summit will help shape real impact.
          </p>
          <Illus
            name="audience"
            className="absolute right-0 bottom-0 h-full w-[48%] object-cover object-left"
          />
        </div>
      </div>
    </MobileShell>
  )
}

/* ================================================================ */
/* Ideas & Innovation                                                */
/* ================================================================ */
export function IdeasHub() {
  const [config] = useEventConfig()
  const open = config.ideaWindowOpen
  return (
    <MobileShell>
      <PageHero
        title="Ideas & Innovation"
        subtitle="Share your ideas for a brighter Andhra."
        art="lightbulb"
      />
      <div className="px-5">
        {open ? (
          <>
            <Link
              href="/app/ideas/new"
              className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#0b57f5] text-[17px] font-semibold text-white shadow-[0_8px_20px_rgba(11,87,245,.25)]"
            >
              <Plus size={20} /> Submit a New Idea
            </Link>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[13px] text-[#5e6a85]">
              <Clock3 size={14} /> Open until {config.ideaWindowCloses} today
            </p>
          </>
        ) : (
          <StateCard
            icon={Clock3}
            tone="slate"
            title="The idea window has closed"
            text={`Ideas closed at ${config.ideaWindowCloses}. Thank you for contributing.`}
          />
        )}

        <h2 className="mt-7 mb-3 text-[20px] font-bold text-[#0f1e4d]">
          Summit Themes
        </h2>
        <div className="grid gap-2">
          {themes.map((t) => {
            const row = (
              <>
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white"
                  style={{ background: t.accent }}
                >
                  <t.icon size={21} />
                </span>
                <span className="min-w-0 flex-1 text-[15px] leading-snug text-[#0f1e4d]">
                  {t.name}
                </span>
                {open && <ArrowRight size={17} className="shrink-0 text-[#0f1e4d]" />}
              </>
            )
            return open ? (
              <Link
                key={t.id}
                href={`/app/ideas/new?theme=${t.id}`}
                className="tap-card flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2.5"
                style={{ background: t.soft }}
              >
                {row}
              </Link>
            ) : (
              <div
                key={t.id}
                className="flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2.5"
                style={{ background: t.soft }}
              >
                {row}
              </div>
            )
          })}
        </div>
      </div>
    </MobileShell>
  )
}

/* ================================================================ */
/* Submit / edit idea                                                */
/* ================================================================ */
type IdeaDraft = {
  title: string
  theme: ThemeId | ""
  proposed: string
  problem: string
  impact: string
}

export function IdeaForm({
  initialTheme,
  editId,
}: {
  initialTheme?: string
  editId?: string
}) {
  const [inputs, , ready] = useInputs()
  const [config] = useEventConfig()
  const idea = editId ? inputs.find((i) => i.id === editId && i.mine) : undefined

  if (!config.ideaWindowOpen)
    return (
      <MobileShell>
        <PageHero title="Share Your Idea" art="lightbulb" back="/app/ideas" />
        <div className="px-5">
          <StateCard
            icon={Clock3}
            tone="slate"
            title="The idea window has closed"
            text={`Ideas closed at ${config.ideaWindowCloses}.`}
          />
        </div>
      </MobileShell>
    )
  if (editId && !ready) return <MobileShell bare>{null}</MobileShell>
  if (editId && !idea)
    return (
      <MobileShell>
        <PageHero title="Idea not found" back="/app/submissions" />
      </MobileShell>
    )
  const valid = themes.some((t) => t.id === initialTheme)
  return (
    <IdeaFormInner
      editing={idea}
      initial={{
        title: idea?.text ?? "",
        theme: idea?.theme ?? (valid ? (initialTheme as ThemeId) : ""),
        proposed: idea?.proposed ?? "",
        problem: idea?.problem ?? "",
        impact: idea?.impact ?? "",
      }}
    />
  )
}

function IdeaFormInner({
  initial,
  editing,
}: {
  initial: IdeaDraft
  editing?: LiveInput
}) {
  const router = useRouter()
  const { submit, busy } = useSubmit()
  const [d, setD] = useState<IdeaDraft>(initial)
  const [result, setResult] = useState<"sent" | "queued" | null>(null)
  const set = (k: keyof IdeaDraft) => (v: string) => setD((x) => ({ ...x, [k]: v }))
  const valid =
    d.title.trim() &&
    d.theme &&
    d.proposed.trim() &&
    (!ideaFields.problem.required || d.problem.trim()) &&
    (!ideaFields.impact.required || d.impact.trim())

  if (result)
    return (
      <SuccessScreen
        title={
          result === "queued"
            ? "Saved on your phone"
            : editing
              ? "Idea Updated!"
              : "Idea Submitted!"
        }
        text="Thank you for your contribution to a brighter Andhra."
        queued={result === "queued"}
      >
        {!editing && (
          <PrimaryButton
            onClick={() => {
              setD({ title: "", theme: "", proposed: "", problem: "", impact: "" })
              setResult(null)
            }}
          >
            Submit Another Idea
          </PrimaryButton>
        )}
        <SecondaryButton onClick={() => router.push("/app/submissions")}>
          View My Submissions
        </SecondaryButton>
      </SuccessScreen>
    )

  return (
    <MobileShell>
      <PageHero
        title={editing ? "Edit Idea" : "Share Your Idea"}
        subtitle={
          editing ? undefined : "Contribute to a brighter Andhra across the Summit themes."
        }
        art="lightbulb"
        back={editing ? `/app/submissions/ideas/${editing.id}` : true}
      />
      <form
        className="grid gap-4 px-5"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!valid || !d.theme) return
          setResult(
            await submit({
              id: editing?.id,
              kind: "idea",
              text: d.title.trim(),
              theme: d.theme,
              proposed: d.proposed.trim(),
              problem: d.problem.trim(),
              impact: d.impact.trim(),
              sessionId: editing?.sessionId,
              author: ME,
              votes: 0,
              mine: true,
            })
          )
        }}
      >
        <TextField
          {...ideaFields.title}
          value={d.title}
          onChange={set("title")}
          placeholder="Enter a clear and concise title"
        />
        <label className="-mt-3 block">
          <span className="mb-2 block text-[15px] font-semibold text-[#0f1e4d]">
            Theme <span className="text-[#e5373b]">*</span>
          </span>
          <select
            value={d.theme}
            onChange={(e) => set("theme")(e.target.value)}
            className={`${selectClass} ${d.theme ? "" : "text-[#9aa3ba]"}`}
          >
            <option value="" disabled>
              Select a theme
            </option>
            {themes.map((t) => (
              <option key={t.id} value={t.id} className="text-[#0f1e4d]">
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <TextField
          {...ideaFields.proposed}
          multiline
          value={d.proposed}
          onChange={set("proposed")}
          placeholder="Describe your idea…"
        />
        <TextField
          {...ideaFields.problem}
          multiline
          rows={3}
          value={d.problem}
          onChange={set("problem")}
          placeholder="What problem or opportunity does this address?"
        />
        <TextField
          {...ideaFields.impact}
          multiline
          rows={3}
          value={d.impact}
          onChange={set("impact")}
          placeholder="How will this benefit Andhra?"
        />
        <PrimaryButton type="submit" disabled={!valid} busy={busy} className="mt-1">
          {busy ? "Submitting…" : editing ? "Update Idea" : "Submit Idea"}
        </PrimaryButton>
      </form>
    </MobileShell>
  )
}

function SuccessScreen({
  title,
  text,
  queued,
  children,
}: {
  title: string
  text: string
  queued?: boolean
  children: React.ReactNode
}) {
  return (
    <MobileShell>
      <div className="relative px-6 pt-8 text-center">
        {!queued && <Confetti />}
        <Illus name="success" priority className="pop-in mx-auto w-56" />
        <h1 className="font-display mt-4 text-[28px] text-[#0f1e4d]">{title}</h1>
        <p className="mx-auto mt-2 max-w-72 text-[16px] leading-relaxed text-[#5e6a85]">
          {text}
        </p>
        {queued && (
          <div className="mt-4 text-left">
            <QueuedNotice />
          </div>
        )}
        <div className="mt-7 grid gap-3">{children}</div>
      </div>
    </MobileShell>
  )
}

/* ================================================================ */
/* Live Sessions list                                                */
/* ================================================================ */
export function SessionsScreen() {
  const [tab, setTab] = useState<"all" | "completed">("all")
  const [sessions] = useSessions()
  const list = [...sessions]
    .filter((s) => (tab === "completed" ? s.status === "Closed" : true))
    .sort(byStart)
  const open = list.filter((s) => s.access === "Open")
  const rt = list.filter((s) => s.access === "Invited")
  return (
    <MobileShell>
      <PageHero
        title="Live Sessions"
        subtitle="Join the conversation. Ask questions, share ideas and give opinions."
        art="podium"
      />
      <div className="bg-white">
        <UnderlineTabs
          tabs={[
            { id: "all", label: "All Sessions" },
            { id: "completed", label: "Completed" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <div className="px-4 pt-5">
        <h2 className="mb-3 px-1 text-[17px] font-semibold text-[#0f1e4d]">
          Today · {EVENT_DATE}
        </h2>
        {list.length === 0 && (
          <p className="card-soft p-6 text-center text-[15px] text-[#5e6a85]">
            No sessions have finished yet.
          </p>
        )}
        <div className="grid gap-2.5">
          {open.map((s) => (
            <SessionRow key={s.id} session={s} href={sessionHref(s)} />
          ))}
        </div>
        {rt.length > 0 && (
          <>
            <h2 className="mt-6 mb-3 px-1 text-[17px] font-semibold text-[#0f1e4d]">
              Round Tables · First Floor
            </h2>
            <div className="grid gap-2.5">
              {rt.map((s) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  href={sessionHref(s)}
                  locked={!canJoin(s)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </MobileShell>
  )
}

/* ================================================================ */
/* Session page                                                      */
/* ================================================================ */
const kinds: Record<
  InputKind,
  {
    tab: string
    title: string
    help: string
    button: string
    icon: LucideIcon
    color: { from: string; to: string; soft: string }
  }
> = {
  question: {
    tab: "Ask",
    title: "Ask a Question",
    help: "Your question may be shortlisted by the session coordinator.",
    button: "Submit Question",
    icon: HelpCircle,
    color: { from: "#3d7bff", to: "#0b57f5", soft: "#eaf1ff" },
  },
  idea: {
    tab: "Share Idea",
    title: "Share an Idea",
    help: "It also joins Ideas & Innovation, tagged with this session.",
    button: "Submit Idea",
    icon: Lightbulb,
    color: { from: "#ffc53d", to: "#f59e0b", soft: "#fff4d9" },
  },
  opinion: {
    tab: "Opinion",
    title: "Share Your Opinion",
    help: "What's your view on the discussion?",
    button: "Submit Opinion",
    icon: MessageCircle,
    color: { from: "#a58bff", to: "#7c5cfa", soft: "#f1ecff" },
  },
}

export function LiveSession() {
  const { id } = useParams<{ id: string }>()
  const [sessions, , ready] = useSessions()
  const session = sessions.find(
    (s) => matchesSessionId(s, id)
  )
  if (!session)
    return (
      <MobileShell>
        <PageHero title={ready ? "Session not found" : ""} back="/app/sessions" />
      </MobileShell>
    )
  return <SessionPage session={session} />
}

function SessionPage({ session }: { session: Session }) {
  const t = themeById(session.theme)
  const locked = !canJoin(session)
  const live = session.status === "Live"
  return (
    <MobileShell>
      <section className="sunrise relative overflow-hidden px-5 pt-6 pb-6">
        <div className="flex items-center justify-between">
          <BackLink />
          {!locked &&
            (live ? (
              <Pill tone="red">
                <span className="live-pulse h-1.5 w-1.5 rounded-full bg-white" />
                LIVE NOW
              </Pill>
            ) : session.status === "Paused" ? (
              <Pill tone="paused">Paused</Pill>
            ) : session.status === "Closed" ? (
              <Pill tone="closed">Closed</Pill>
            ) : (
              <Pill tone="upcoming">Opens {formatTime(session.time).start}</Pill>
            ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="relative z-10 min-w-0 flex-1">
            <p
              className="text-[12px] font-semibold tracking-[.14em] uppercase"
              style={{ color: t.accent }}
            >
              {session.type}
              {session.theme !== "other" && ` · ${t.label}`}
            </p>
            <h1 className="font-display mt-1 text-[26px] leading-[1.15] text-[#0f1e4d]">
              {session.title}
            </h1>
            <SessionMeta session={session} />
          </div>
          <Illus name="podium" priority className="-mr-3 w-[34%] max-w-36 shrink-0" />
        </div>
        {session.speakers.some((s) => s.name) && (
          <div className="mt-4">
            <SpeakerChips speakers={session.speakers} accent={t.accent} soft={t.soft} />
          </div>
        )}
      </section>

      <div className="px-4 pt-5">
        {locked ? (
          <StateCard icon={Lock} tone="slate" title="Invited Round Table" text={messages.invited} />
        ) : session.status === "Upcoming" ? (
          <StateCard
            icon={CalendarClock}
            title={messages.opensAt(formatTime(session.time).start)}
            text="Questions, ideas and opinions open when the session goes live."
          />
        ) : session.status === "Closed" ? (
          session.feedback ? (
            <SessionFeedback session={session} />
          ) : (
            <StateCard icon={Clock3} tone="slate" title={messages.closed} />
          )
        ) : (
          <>
            {session.status === "Paused" ? (
              <StateCard
                icon={PauseCircle}
                tone="amber"
                title="Participation paused"
                text={messages.paused}
              />
            ) : (
              <Composer session={session} />
            )}
            <VisibleQuestions session={session} />
          </>
        )}
      </div>
    </MobileShell>
  )
}

function BackLink() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push("/app/sessions")}
      aria-label="Back to sessions"
      className="-ml-2 grid h-10 w-10 place-items-center rounded-full text-[#0f1e4d] hover:bg-white/60"
    >
      <ArrowRight size={22} className="rotate-180" />
    </button>
  )
}

function Composer({ session }: { session: Session }) {
  const [config] = useEventConfig()
  const enabled = (Object.keys(kinds) as InputKind[]).filter(
    (k) => config.inputTypes[k]
  )
  const [kind, setKind] = useState<InputKind>(enabled[0] ?? "question")
  const [text, setText] = useState("")
  const [idea, setIdea] = useState({ title: "", proposed: "", problem: "", impact: "" })
  const [done, setDone] = useState<{ kind: InputKind; result: "sent" | "queued" } | null>(null)
  const { submit, busy } = useSubmit()
  if (!enabled.length) return null
  const K = kinds[kind]
  const valid =
    kind === "idea" ? idea.title.trim() && idea.proposed.trim() : text.trim()

  const send = async () => {
    if (!valid) return
    const result = await submit(
      kind === "idea"
        ? {
            kind,
            text: idea.title.trim(),
            proposed: idea.proposed.trim(),
            problem: idea.problem.trim(),
            impact: idea.impact.trim(),
            theme: session.theme,
            sessionId: session.id,
            author: ME,
            votes: 0,
            mine: true,
          }
        : {
            kind,
            text: text.trim(),
            sessionId: session.id,
            author: ME,
            votes: 0,
            mine: true,
          }
    )
    setText("")
    setIdea({ title: "", proposed: "", problem: "", impact: "" })
    setDone({ kind, result })
  }

  return (
    <>
      {enabled.length > 1 && (
        <div
          role="tablist"
          aria-label="What would you like to share?"
          className="grid gap-2.5"
          style={{ gridTemplateColumns: `repeat(${enabled.length}, minmax(0,1fr))` }}
        >
          {enabled.map((k) => {
            const I = kinds[k].icon
            const c = kinds[k].color
            const active = kind === k
            return (
              <button
                key={k}
                role="tab"
                aria-selected={active}
                onClick={() => setKind(k)}
                className={`relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold transition-all duration-200 active:scale-95 ${active ? "-translate-y-0.5 text-white" : "text-[#0f1e4d]"}`}
                style={
                  active
                    ? {
                        background: `linear-gradient(160deg, ${c.from}, ${c.to})`,
                        boxShadow: `0 12px 24px -8px ${c.to}99`,
                      }
                    : { background: c.soft }
                }
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-full transition-colors"
                  style={
                    active
                      ? { background: "rgba(255,255,255,.22)", color: "#fff" }
                      : { background: c.to, color: "#fff" }
                  }
                >
                  <I size={21} strokeWidth={2.1} />
                </span>
                {kinds[k].tab}
                {active && (
                  <span
                    className="absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px]"
                    style={{ background: c.to }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      <form
        className="card-soft mt-3 grid gap-4 border-t-4 p-4"
        style={{ borderTopColor: K.color.to }}
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
      >
        <div className="flex gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white"
            style={{ background: K.color.to }}
          >
            <K.icon size={21} />
          </span>
          <div>
            <h2 className="text-[18px] font-bold text-[#0f1e4d]">{K.title}</h2>
            <p className="text-[14px] leading-snug text-[#5e6a85]">{K.help}</p>
          </div>
        </div>
        {kind === "idea" ? (
          <>
            <TextField
              {...ideaFields.title}
              value={idea.title}
              onChange={(v) => setIdea((x) => ({ ...x, title: v }))}
              placeholder="Enter a clear and concise title"
            />
            <TextField
              {...ideaFields.proposed}
              multiline
              rows={3}
              value={idea.proposed}
              onChange={(v) => setIdea((x) => ({ ...x, proposed: v }))}
              placeholder="Describe your idea…"
            />
            <TextField
              {...ideaFields.problem}
              multiline
              rows={2}
              value={idea.problem}
              onChange={(v) => setIdea((x) => ({ ...x, problem: v }))}
              placeholder="What problem or opportunity does this address?"
            />
            <TextField
              {...ideaFields.impact}
              multiline
              rows={2}
              value={idea.impact}
              onChange={(v) => setIdea((x) => ({ ...x, impact: v }))}
              placeholder="How will this benefit Andhra?"
            />
          </>
        ) : (
          <TextField
            label={kind === "question" ? "Your question" : "Your opinion"}
            required
            multiline
            max={INPUT_MAX}
            value={text}
            onChange={setText}
            placeholder={
              kind === "question" ? "Type your question…" : "Share your view…"
            }
          />
        )}
        <PrimaryButton type="submit" disabled={!valid} busy={busy}>
          {busy ? "Submitting…" : K.button}
        </PrimaryButton>
        <p className="-mt-1 flex items-center justify-center gap-1.5 text-[12px] text-[#8a93ab]">
          <Info size={13} /> Other attendees never see your name.
        </p>
      </form>

      {done && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-[#0f1e4d]/45 sm:place-items-center"
          onClick={() => setDone(null)}
        >
          <div
            role="dialog"
            aria-label="Submitted"
            onClick={(e) => e.stopPropagation()}
            className="sheet-up relative left-1/2 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white px-6 pt-6 pb-8 text-center"
          >
            {done.result === "sent" && <Confetti />}
            <Illus name="success" className="mx-auto w-40" />
            <h2 className="font-display mt-2 text-[24px] text-[#0f1e4d]">
              {done.result === "sent" ? "Submitted!" : "Saved on your phone"}
            </h2>
            <p className="mt-1.5 text-[15px] text-[#5e6a85]">
              {done.result === "sent"
                ? `Your ${done.kind} is with the session coordinator.`
                : ""}
            </p>
            {done.result === "queued" && (
              <div className="mt-3 text-left">
                <QueuedNotice />
              </div>
            )}
            <PrimaryButton className="mt-6" onClick={() => setDone(null)}>
              Done
            </PrimaryButton>
          </div>
        </div>
      )}
    </>
  )
}

function VisibleQuestions({ session }: { session: Session }) {
  const [inputs] = useInputs()
  const [states] = useInputStates()
  const [upvotes, setUpvotes] = useUpvotes()
  const [sort, setSort] = useState<"top" | "recent">("top")
  const here = inputs.filter((i) => i.kind === "question" && i.sessionId === session.id)
  // SES-05: only coordinator-approved questions; never a name or avatar.
  const visible = here
    .map((q, order) => ({ q, order }))
    .filter(({ q }) => visibleToRoom(states[q.id]))
  const pending = here.filter(
    (q) => q.mine && !states[q.id]?.visible && !states[q.id]?.hidden
  )
  const votes = (q: LiveInput) => q.votes + (upvotes.includes(q.id) ? 1 : 0)
  const sorted = [...visible].sort((a, b) =>
    sort === "top" ? votes(b.q) - votes(a.q) : b.order - a.order
  )
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#0f1e4d]">
          Questions
          <span className="num rounded-full bg-[#0b57f5] px-2 py-0.5 text-[12px] font-semibold text-white">
            {visible.length}
          </span>
        </h2>
        <div
          role="tablist"
          aria-label="Sort questions"
          className="flex shrink-0 rounded-full bg-[#e9eef8] p-1"
        >
          {(
            [
              ["top", "Top"],
              ["recent", "New"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={sort === id}
              onClick={() => setSort(id)}
              className={`min-h-8 rounded-full px-3.5 text-[13px] font-semibold transition-all ${sort === id ? "bg-white text-[#0b57f5] shadow-[0_2px_8px_rgba(15,30,77,.12)]" : "text-[#5e6a85]"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="-mt-1 mb-3 flex items-center gap-1.5 px-1 text-[13px] text-[#5e6a85]">
        <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[#12a37a]" />
        Tap +1 on the questions you want answered
      </p>

      <div className="grid gap-2.5">
        {pending.map((q) => (
          <div
            key={q.id}
            className="flex gap-3 rounded-2xl border border-dashed border-[#f2c75c] bg-[#fffaf0] p-4"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff1d0] text-[#b27700]">
              <Clock3 size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[15px] leading-snug text-[#0f1e4d]">{q.text}</p>
              <p className="mt-1.5 text-[12px] font-medium text-[#8a5a00]">
                Only you can see this · waiting for the coordinator
              </p>
            </div>
          </div>
        ))}
        {sorted.length === 0 && pending.length === 0 && (
          <div className="card-soft p-6 text-center">
            <Illus name="waves-leaves" className="mx-auto w-40" />
            <p className="mt-2 text-[15px] text-[#5e6a85]">
              Questions appear here once the coordinator shares them with the room.
            </p>
          </div>
        )}
        {sorted.map(({ q }) => {
          const up = upvotes.includes(q.id)
          return (
            <div
              key={q.id}
              className={`flex items-stretch gap-3 rounded-2xl border p-3 transition-colors ${up ? "border-[#b9cffd] bg-[#f7faff]" : "border-[#e8edf6] bg-white"}`}
            >
              <button
                onClick={() =>
                  setUpvotes((v) => (up ? v.filter((x) => x !== q.id) : [...v, q.id]))
                }
                aria-pressed={up}
                aria-label={up ? `Remove your +1, ${votes(q)} so far` : `Plus one, ${votes(q)} so far`}
                className={`num flex w-14 shrink-0 flex-col items-center justify-center rounded-xl transition-all active:scale-90 ${up ? "bg-[#0b57f5] text-white shadow-[0_8px_16px_-6px_rgba(11,87,245,.6)]" : "bg-[#eef4ff] text-[#0b57f5]"}`}
              >
                <ChevronUp size={20} strokeWidth={2.6} className={up ? "pop-in" : ""} />
                <span className="text-[16px] leading-none font-bold">{votes(q)}</span>
              </button>
              <div className="min-w-0 flex-1 py-1">
                <p className="text-[15px] leading-snug text-[#0f1e4d]">{q.text}</p>
                <p className="mt-1.5 text-[12px] text-[#8a93ab]">
                  {q.at}
                  {up && <span className="text-[#0b57f5]"> · You +1&apos;d this</span>}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SessionFeedback({ session }: { session: Session }) {
  const [feedback, setFeedback] = useFeedback()
  const [rating, setRating] = useState(0)
  const [valuable, setValuable] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [busy, setBusy] = useState(false)
  if (feedback[session.id])
    return (
      <div className="card-soft px-6 py-8 text-center">
        <Illus name="success" className="mx-auto w-40" />
        <h2 className="font-display mt-3 text-[22px] text-[#0f1e4d]">
          Thanks for your feedback
        </h2>
        <p className="mt-1 text-[15px] text-[#5e6a85]">
          It helps us make the next session better.
        </p>
      </div>
    )
  return (
    <form
      className="card-soft grid gap-5 p-5"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!rating) return
        setBusy(true)
        await new Promise((r) => setTimeout(r, 500))
        setFeedback((f) => ({ ...f, [session.id]: { rating, valuable, suggestion } }))
        setBusy(false)
      }}
    >
      <div>
        <h2 className="text-[18px] font-bold text-[#0f1e4d]">Session Feedback</h2>
        <p className="text-[14px] text-[#5e6a85]">
          This session has closed. Takes under 30 seconds.
        </p>
      </div>
      <div>
        <p className="mb-2 text-[15px] font-semibold text-[#0f1e4d]">
          How would you rate this session? <span className="text-[#e5373b]">*</span>
        </p>
        <Stars value={rating} onChange={setRating} />
      </div>
      <TextField
        label="Most valuable point"
        multiline
        rows={3}
        max={INPUT_MAX}
        value={valuable}
        onChange={setValuable}
        placeholder="What worked well for you?"
      />
      <TextField
        label="Suggestion"
        multiline
        rows={3}
        max={INPUT_MAX}
        value={suggestion}
        onChange={setSuggestion}
        placeholder="How could it be better?"
      />
      <PrimaryButton type="submit" disabled={!rating} busy={busy}>
        Submit Feedback
      </PrimaryButton>
    </form>
  )
}

/* ================================================================ */
/* My Submissions                                                    */
/* ================================================================ */
export function MySubmissions() {
  const [tab, setTab] = useState<"ideas" | "inputs">("ideas")
  const [inputs] = useInputs()
  const [sessions] = useSessions()
  const [states] = useInputStates()
  const due = useFeedbackDue()
  const mine = inputs.filter((i) => i.mine).reverse()
  const ideas = mine.filter((i) => i.kind === "idea")
  const others = mine.filter((i) => i.kind !== "idea")
  const sessionTitle = (id?: string) => sessions.find((s) => s.id === id)?.title
  return (
    <MobileShell>
      <PageHero
        title="My Submissions"
        subtitle="View and manage your ideas and session inputs."
        art="skyline-card"
      />
      {due.length > 0 && (
        <div className="grid gap-2 px-4 pb-4">
          {due.map((s) => (
            <Link
              key={s.id}
              href={sessionHref(s)}
              className="flex items-center gap-3 rounded-2xl bg-[#e6f6ef] p-3.5"
            >
              <MessageSquareHeart size={20} className="text-[#12a37a]" />
              <span className="flex-1 text-[15px] text-[#0f1e4d]">
                Feedback due: <strong>{s.title}</strong>
              </span>
              <ChevronDot />
            </Link>
          ))}
        </div>
      )}
      <div className="bg-white">
        <UnderlineTabs
          tabs={[
            { id: "ideas", label: `Ideas (${ideas.length})` },
            { id: "inputs", label: `Session Inputs (${others.length})` },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <div className="grid gap-3 px-4 pt-4">
        {tab === "ideas" &&
          (ideas.length ? (
            ideas.map((i) => {
              const t = themeById(i.theme)
              return (
                <Link
                  key={i.id}
                  href={`/app/submissions/ideas/${i.id}`}
                  className="card-soft tap-card flex items-start gap-3 p-4"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#fff3d6] text-[#f5a300]">
                    <Lightbulb size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[16px] leading-snug text-[#0f1e4d]">
                      {i.text}
                    </strong>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className="rounded-full px-2.5 py-1 text-[12px] font-medium"
                        style={{ background: t.soft, color: t.accent }}
                      >
                        {t.label}
                      </span>
                      <Pill tone="neutral">
                        {i.sessionId ? sessionTitle(i.sessionId) ?? "Session" : "General"}
                      </Pill>
                      {i.delivery === "queued" ? (
                        <Pill tone="queued">Waiting to send</Pill>
                      ) : (
                        <Pill tone="sent">Submitted</Pill>
                      )}
                    </span>
                    <span className="mt-2 block text-[13px] text-[#8a93ab]">
                      {EVENT_DATE.replace(" 2026", "")}, {i.at}
                    </span>
                  </span>
                  <ArrowRight size={17} className="mt-1 shrink-0 text-[#0f1e4d]" />
                </Link>
              )
            })
          ) : (
            <EmptySubmissions
              text="You haven't shared an idea yet."
              href="/app/ideas/new"
              cta="Share Your Idea"
            />
          ))}
        {tab === "inputs" &&
          (others.length ? (
            others.map((i) => {
              const I = i.kind === "question" ? HelpCircle : MessageCircle
              const shown = visibleToRoom(states[i.id])
              return (
                <div key={i.id} className="card-soft flex items-start gap-3 p-4">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${i.kind === "question" ? "bg-[#eef4ff] text-[#0b57f5]" : "bg-[#f1ecff] text-[#7c5cfa]"}`}
                  >
                    <I size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold tracking-wide text-[#8a93ab] uppercase">
                      {i.kind}
                    </span>
                    <span className="mt-0.5 block text-[15px] leading-snug text-[#0f1e4d]">
                      {i.text}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px] text-[#8a93ab]">
                      {sessionTitle(i.sessionId)} · {i.at}
                      {i.delivery === "queued" && <Pill tone="queued">Waiting to send</Pill>}
                      {i.kind === "question" && shown && (
                        <Pill tone="upcoming">Shown to the room · +{i.votes}</Pill>
                      )}
                    </span>
                  </span>
                </div>
              )
            })
          ) : (
            <EmptySubmissions
              text="Questions and opinions you share in sessions appear here."
              href="/app/sessions"
              cta="Browse Sessions"
            />
          ))}
      </div>
    </MobileShell>
  )
}

function EmptySubmissions({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="card-soft p-6 text-center">
      <Illus name="waves-leaves" className="mx-auto w-44 opacity-90" />
      <p className="mt-2 text-[15px] text-[#5e6a85]">{text}</p>
      <Link href={href} className="mt-3 inline-block text-[15px] font-semibold text-[#0b57f5]">
        {cta} →
      </Link>
    </div>
  )
}

/* ================================================================ */
/* Idea details / withdraw                                           */
/* ================================================================ */
export function IdeaDetail({ id }: { id: string }) {
  const router = useRouter()
  const [inputs, setInputs, ready] = useInputs()
  const [sessions] = useSessions()
  const [config] = useEventConfig()
  const [confirm, setConfirm] = useState(false)
  const idea = inputs.find((i) => i.id === id && i.mine && i.kind === "idea")
  if (!idea)
    return (
      <MobileShell>
        <PageHero title={ready ? "Idea not found" : "Idea Details"} back="/app/submissions" />
      </MobileShell>
    )
  const t = themeById(idea.theme)
  const source = idea.sessionId
    ? sessions.find((s) => s.id === idea.sessionId)?.title ?? "Session"
    : "General"
  const editable = config.ideaWindowOpen
  const sections = [
    ["Proposed Idea", idea.proposed],
    ["Problem / Opportunity", idea.problem],
    ["Expected Impact", idea.impact],
  ] as const
  return (
    <MobileShell>
      <PageHero title="Idea Details" back="/app/submissions" />
      <div className="px-4">
        <div className="card-soft p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#fff3d6] text-[#f5a300]">
              <Lightbulb size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[20px] leading-snug font-bold text-[#0f1e4d]">{idea.text}</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className="rounded-full px-2.5 py-1 text-[12px] font-medium"
                  style={{ background: t.soft, color: t.accent }}
                >
                  {t.name}
                </span>
                <Pill tone="neutral">Source: {source}</Pill>
                {idea.delivery === "queued" ? (
                  <Pill tone="queued">Waiting to send</Pill>
                ) : (
                  <Pill tone="sent">Submitted</Pill>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {sections.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#f6f8fd] p-4">
                <h3 className="text-[14px] font-semibold text-[#0f1e4d]">{label}</h3>
                <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-[#44506e]">
                  {value || <span className="text-[#9aa3ba]">Not provided</span>}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-[14px] text-[#5e6a85]">
            <CalendarClock size={17} /> Submitted on {EVENT_DATE}, {idea.at}
          </p>
        </div>
        {editable ? (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <SecondaryButton onClick={() => router.push(`/app/submissions/ideas/${idea.id}/edit`)}>
              Edit
            </SecondaryButton>
            <SecondaryButton
              onClick={() => setConfirm(true)}
              className="border-[#e5373b]/40! text-[#e5373b]! hover:bg-[#fdecec]!"
            >
              Withdraw
            </SecondaryButton>
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-[#f1f4fa] p-3 text-center text-[14px] text-[#44506e]">
            The idea window closed at {config.ideaWindowCloses}. Ideas can no longer be changed.
          </p>
        )}
      </div>

      {confirm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0f1e4d]/45 p-6"
          onClick={() => setConfirm(false)}
        >
          <div
            role="alertdialog"
            aria-labelledby="withdraw-title"
            onClick={(e) => e.stopPropagation()}
            className="pop-in w-full max-w-sm rounded-3xl bg-white p-6 text-center"
          >
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fdecec] text-[#e5373b]">
              <Trash2 size={24} />
            </span>
            <h2 id="withdraw-title" className="mt-4 text-[20px] font-bold text-[#0f1e4d]">
              Withdraw Idea?
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[#5e6a85]">
              Your idea will be removed from the Summit. This can&apos;t be undone.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <SecondaryButton onClick={() => setConfirm(false)}>Cancel</SecondaryButton>
              <button
                onClick={() => {
                  setInputs((list) => list.filter((i) => i.id !== idea.id))
                  router.push("/app/submissions")
                }}
                className="min-h-13 rounded-xl bg-[#e5373b] text-[16px] font-semibold text-white"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  )
}

/* ================================================================ */
/* Summit feedback (FDB-03)                                          */
/* ================================================================ */
export function SummitFeedbackScreen() {
  const [config] = useEventConfig()
  const [sessions] = useSessions()
  const [given, setGiven] = useSummitFeedback()
  const [rating, setRating] = useState(0)
  const [best, setBest] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [busy, setBusy] = useState(false)
  const pickable = sessions.filter((s) => s.access === "Open").sort(byStart)
  return (
    <MobileShell>
      <PageHero
        title="Summit Feedback"
        subtitle="Tell us how the PAN IIT Amaravati Summit went."
        art="venue"
      />
      <div className="px-4">
        {given ? (
          <div className="card-soft px-6 py-8 text-center">
            <Confetti />
            <Illus name="success" className="mx-auto w-44" />
            <h2 className="font-display mt-3 text-[24px] text-[#0f1e4d]">Thank you!</h2>
            <p className="mt-1 text-[15px] text-[#5e6a85]">
              Your feedback will shape the next Summit.
            </p>
          </div>
        ) : !config.summitFeedbackOpen ? (
          <StateCard
            icon={Clock3}
            title={messages.opensAt(config.summitFeedbackOpens)}
            text="Summit feedback opens at the Valedictory session."
          />
        ) : (
          <form
            className="card-soft grid gap-5 p-5"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!rating) return
              setBusy(true)
              await new Promise((r) => setTimeout(r, 500))
              setGiven({ rating, best, suggestion })
              setBusy(false)
            }}
          >
            <div>
              <p className="mb-2 text-[15px] font-semibold text-[#0f1e4d]">
                Overall, how was the Summit? <span className="text-[#e5373b]">*</span>
              </p>
              <Stars value={rating} onChange={setRating} />
            </div>
            <label className="block">
              <span className="mb-2 block text-[15px] font-semibold text-[#0f1e4d]">
                Best session <span className="font-normal text-[#8a93ab]">(optional)</span>
              </span>
              <select value={best} onChange={(e) => setBest(e.target.value)} className={selectClass}>
                <option value="">Select a session</option>
                {pickable.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
            <TextField
              label="Suggestion for the next Summit"
              multiline
              max={INPUT_MAX}
              value={suggestion}
              onChange={setSuggestion}
              placeholder="What should we do differently?"
            />
            <PrimaryButton type="submit" disabled={!rating} busy={busy}>
              Submit Feedback
            </PrimaryButton>
          </form>
        )}
      </div>
    </MobileShell>
  )
}

/* ================================================================ */
/* Privacy notice                                                    */
/* ================================================================ */
export function PrivacyItems() {
  const items = [
    ["Why we collect it", "To let you submit ideas, take part in live sessions and give feedback, and to prepare the Summit outcomes report for the Government of Andhra Pradesh."],
    ["What we collect", "Your name, organisation and email from sign-in, plus what you submit. Optional profile fields only if you fill them."],
    ["Who sees your name", "Only the session coordinators and the Summit admin team. Other attendees never see who asked or submitted anything."],
    ["AI processing", "Summaries are drafted with AI. Your name, email and phone number are never sent to the AI service."],
    ["Data owner", "As confirmed by PAN IIT. Data is hosted in India."],
  ]
  return (
    <div className="grid gap-3">
      {items.map(([h, p]) => (
        <div key={h} className="card-soft p-4">
          <h2 className="text-[16px] font-semibold text-[#0f1e4d]">{h}</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-[#44506e]">{p}</p>
        </div>
      ))}
      <p className="px-1 text-[13px] text-[#8a93ab]">
        Final wording to be confirmed by PAN IIT (CFG-05).
      </p>
    </div>
  )
}

export function PrivacyScreen() {
  return (
    <MobileShell>
      <PageHero title="Privacy Notice" back art="skyline-faded" />
      <div className="px-4">
        <PrivacyItems />
      </div>
    </MobileShell>
  )
}
