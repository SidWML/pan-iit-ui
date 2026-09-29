"use client"
import Link from "next/link"
import { useState } from "react"
import { useParams } from "next/navigation"
import {
  CalendarDays,
  CheckCircle2,
  CirclePause,
  CircleStop,
  ClipboardList,
  FileText,
  Lightbulb,
  MessageCircle,
  Play,
  Save,
  Send,
  ThumbsUp,
  Users,
} from "lucide-react"
import { DesktopShell } from "@/components/shells/desktop-shell"
import {
  Badge,
  Button,
  Card,
  PageTitle,
  Stat,
} from "@/components/ui/primitives"
import { Toast } from "@/components/shared/toast"
import { usePersistedState } from "@/components/shared/use-persisted-state"
import { SessionBanner } from "@/components/shared/session-visual"
import {
  liveSession,
  useInputActions,
  useInputs,
  useSessions,
} from "@/components/shared/summit-data"
const nav = [
  { label: "My Sessions", href: "/coordinator/sessions", icon: CalendarDays },
  {
    label: "Control Room",
    href: "/coordinator/sessions/energy-ai",
    icon: ClipboardList,
  },
  {
    label: "Session Outcome",
    href: "/coordinator/sessions/energy-ai/outcome",
    icon: FileText,
  },
]
export function CoordinatorSessions() {
  const [sessions] = useSessions()
  return (
    <DesktopShell role="Coordinator" nav={nav}>
      <PageTitle
        eyebrow="Coordinator workspace"
        title="My sessions"
        description="Monitor assigned sessions and open the live control room."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {sessions.map((x) => (
          <SessionBanner
            key={x.id}
            session={x}
            footer={
              <Link
                href={`/coordinator/sessions/${x.id}`}
                className="inline-flex min-h-10 items-center rounded-lg bg-white px-4 text-sm font-bold text-slate-900"
              >
                Open control room
              </Link>
            }
          />
        ))}
      </div>
    </DesktopShell>
  )
}
export function ControlRoom() {
  const [sessionStatus, setSessionStatus] = usePersistedState<
    "Live" | "Paused" | "Closed"
  >("coordinator-session-status", "Live")
  const [filter, setFilter] = useState("All")
  const [query, setQuery] = useState("")
  const [actions, setActions] = useInputActions()
  const [all] = useInputs()
  const [sessions] = useSessions()
  const { id } = useParams<{ id: string }>()
  const session =
    sessions.find((x) => x.id.toLowerCase() === String(id).toLowerCase()) ??
    liveSession(sessions)
  const inputs = all
    .filter((i) => !i.sessionId || i.sessionId === session?.id)
    .map((i) => [i.kind, i.text, i.author, String(i.votes), i.at])
  const added = (kind: string) =>
    all.filter((i) => i.id.startsWith("u") && i.kind === kind).length
  const [toast, setToast] = useState("")
  return (
    <DesktopShell role="Coordinator" nav={nav}>
      <PageTitle
        eyebrow="Live session"
        title={session?.title ?? "Session"}
        description={`${session?.venue ?? ""} · ${session?.time ?? ""}`}
        action={
          <div className="flex gap-2">
            <Badge tone={sessionStatus === "Live" ? "red" : "amber"}>
              {sessionStatus}
            </Badge>
            <Button
              disabled={sessionStatus === "Closed"}
              variant="secondary"
              onClick={() => {
                setSessionStatus(sessionStatus === "Live" ? "Paused" : "Live")
                setToast(
                  sessionStatus === "Live"
                    ? "Participation paused"
                    : "Participation resumed"
                )
                setTimeout(() => setToast(""), 1800)
              }}
            >
              {sessionStatus === "Live" ? (
                <CirclePause size={16} />
              ) : (
                <Play size={16} />
              )}{" "}
              {sessionStatus === "Live" ? "Pause" : "Resume"}
            </Button>
            <Button
              disabled={sessionStatus === "Closed"}
              variant="danger"
              onClick={() => {
                setSessionStatus("Closed")
                setToast("Session closed")
                setTimeout(() => setToast(""), 1800)
              }}
            >
              <CircleStop size={16} />
              Close
            </Button>
          </div>
        }
      />
      <div className="rounded-3xl bg-gradient-to-r from-[#071f46] via-[#0b376d] to-[#164e8f] p-4 shadow-[0_18px_45px_rgba(7,31,70,.18)]">
        <div className="mb-3 flex items-center gap-2 text-xs font-extrabold tracking-[.16em] text-blue-100 uppercase">
          <span className="live-pulse h-2 w-2 rounded-full bg-red-400" />
          Live pulse
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Participants" value="156" icon={<Users size={19} />} />
          <Stat
            label="Questions"
            value={String(48 + added("question"))}
            icon={<MessageCircle size={19} />}
            tone="violet"
          />
          <Stat
            label="Ideas"
            value={String(12 + added("idea"))}
            icon={<Lightbulb size={19} />}
            tone="amber"
          />
          <Stat
            label="Opinions"
            value={String(9 + added("opinion"))}
            icon={<MessageCircle size={19} />}
            tone="green"
          />
        </div>
      </div>
      <Card className="mt-5 overflow-hidden border-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex gap-2">
            {["All", "Questions", "Ideas", "Opinions"].map((x) => (
              <button
                onClick={() => setFilter(x)}
                key={x}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === x ? "bg-primary text-white" : "bg-slate-100"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Search inputs…"
          />
        </div>
        <div className="divide-y">
          {inputs
            .filter(
              (x) => filter === "All" || x[0] + "s" === filter.toLowerCase()
            )
            .filter(
              (x) =>
                x[1]!.toLowerCase().includes(query.toLowerCase()) ||
                x[2]!.toLowerCase().includes(query.toLowerCase())
            )
            .map((x) => (
              <div className="p-4" key={x[1]}>
                <div className="flex gap-3">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${x[0] === "question" ? "bg-blue-50 text-blue-700" : x[0] === "idea" ? "bg-violet-50 text-violet-700" : "bg-emerald-50 text-emerald-700"}`}
                  >
                    {x[0] === "idea" ? (
                      <Lightbulb size={17} />
                    ) : (
                      <MessageCircle size={17} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{x[1]}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {x[2]} · {x[4]} ·{" "}
                      <ThumbsUp className="inline" size={12} /> {x[3]}
                    </p>
                  </div>
                  <Badge tone={actions[x[1]!] ? "green" : "gray"}>
                    {actions[x[1]!] || "New"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="secondary"
                    className="min-h-8 px-3 text-xs"
                    onClick={() =>
                      setActions((a) => ({ ...a, [x[1]!]: "Visible" }))
                    }
                  >
                    Show
                  </Button>
                  <Button
                    variant="secondary"
                    className="min-h-8 px-3 text-xs"
                    onClick={() =>
                      setActions((a) => ({ ...a, [x[1]!]: "Shortlisted" }))
                    }
                  >
                    Shortlist
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-8 px-3 text-xs"
                    onClick={() =>
                      setActions((a) => ({ ...a, [x[1]!]: "Discussed" }))
                    }
                  >
                    Discussed
                  </Button>
                  <Button
                    variant="danger"
                    className="min-h-8 px-3 text-xs"
                    onClick={() =>
                      setActions((a) => ({ ...a, [x[1]!]: "Hidden" }))
                    }
                  >
                    Hide
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Card>
      <Toast message={toast} />
    </DesktopShell>
  )
}
export function OutcomeScreen() {
  const [toast, setToast] = useState("")
  const initial = [
    "The session explored how artificial intelligence can accelerate clean-energy adoption, improve grid intelligence, and unlock new opportunities for Andhra Pradesh.",
    "AI-enabled grid intelligence; clean-energy adoption; public-private collaboration.",
    "A statewide smart-grid sandbox and clean-energy innovation fund.",
    "Create a time-bound policy working group with industry and academia.",
    "Publish a 90-day roadmap and nominate accountable owners.",
  ]
  const [sections, setSections] = usePersistedState<string[]>(
    "coordinator-outcome",
    initial
  )
  const [status, setStatus] = usePersistedState(
    "coordinator-outcome-status",
    "Draft"
  )
  return (
    <DesktopShell role="Coordinator" nav={nav}>
      <PageTitle
        eyebrow="Session outcome"
        title="Turn the conversation into action"
        description="Review the AI-assisted draft, edit it, then submit it to the admin team."
        action={
          <Badge tone={status === "Submitted" ? "green" : "amber"}>
            {status}
          </Badge>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card className="p-5">
          <div className="space-y-5">
            {[
              "Session summary",
              "Key discussion themes",
              "Ideas & opportunities",
              "Recommendations for GoAP",
              "Action points",
            ].map((x, i) => (
              <label className="block" key={x}>
                <span className="text-sm font-bold">{x}</span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-lg border p-3 text-sm leading-6"
                  value={sections[i] ?? ""}
                  onChange={(e) =>
                    setSections((list) =>
                      list.map((value, index) =>
                        index === i ? e.target.value : value
                      )
                    )
                  }
                />
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setToast("Draft saved locally")
                setTimeout(() => setToast(""), 1800)
              }}
            >
              <Save size={16} />
              Save draft
            </Button>
            <Button
              onClick={() => {
                setToast("Outcome submitted for admin approval")
                setStatus("Submitted")
                setTimeout(() => setToast(""), 2500)
              }}
            >
              <Send size={16} />
              Submit outcome
            </Button>
          </div>
        </Card>
        <Card className="h-fit p-5">
          <h3 className="font-bold">Draft sources</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <CheckCircle2 size={17} className="text-emerald-600" />
              48 audience questions
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={17} className="text-emerald-600" />
              12 submitted ideas
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={17} className="text-emerald-600" />
              Coordinator notes
            </li>
          </ul>
          <Button
            variant="secondary"
            className="mt-5 w-full"
            onClick={() => {
              setSections([
                "The session examined how AI can modernise energy systems, unlock investment, and improve delivery across Andhra Pradesh.",
                "Grid intelligence; renewable forecasting; innovation finance.",
                "Launch pilot programmes with measurable public outcomes.",
                "Establish shared data standards and a cross-sector steering group.",
                "Confirm owners, milestones, and a 90-day implementation plan.",
              ])
              setStatus("Draft")
              setToast("AI draft regenerated")
              setTimeout(() => setToast(""), 1800)
            }}
          >
            Regenerate AI draft
          </Button>
        </Card>
      </div>
      <Toast message={toast} />
    </DesktopShell>
  )
}
