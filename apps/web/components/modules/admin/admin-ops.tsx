"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileUp,
  Lightbulb,
  MessageCircle,
  Radio,
  UserX,
} from "lucide-react"
import { AdminShell } from "@/components/modules/admin/admin-shell"
import {
  Badge,
  Button,
  Card,
  PageTitle,
  Segmented,
  Stat,
  type Tone,
} from "@/components/ui/primitives"
import { Modal, downloadText } from "@/components/shared/modal"
import {
  OUTCOME_SECTIONS,
  formatTime,
  isFlagged,
  startMinutes,
  themeById,
  themes,
  useFeedback,
  useInputStates,
  useInputs,
  useOutcomes,
  useSessions,
  useTranscripts,
  type Outcome,
  type Session,
} from "@/components/shared/summit-data"

const byStart = (a: Session, b: Session) => startMinutes(a.time) - startMinutes(b.time)
const statusTone = (s: string): Tone =>
  s === "Live" ? "green" : s === "Paused" ? "amber" : s === "Closed" ? "gray" : "blue"
const outcomeTone = (o?: Outcome): Tone =>
  !o
    ? "gray"
    : o.status === "Finalised"
      ? "green"
      : o.status === "Submitted"
        ? "blue"
        : o.status === "Changes requested"
          ? "amber"
          : "gray"
const clock = (t: number) =>
  new Date(t)
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    .toUpperCase()

function useNowMinute() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    const tick = () => setNow(Date.now())
    const a = window.setTimeout(tick, 0)
    const b = window.setInterval(tick, 30000)
    return () => {
      window.clearTimeout(a)
      window.clearInterval(b)
    }
  }, [])
  return now
}

const csv = (rows: (string | number | undefined)[][]) =>
  rows
    .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n")

/* ================================================================ */
/* Dashboard (RPT-01, RPT-03)                                        */
/* ================================================================ */
export function AdminDashboard() {
  const [sessions] = useSessions()
  const [inputs] = useInputs()
  const [states] = useInputStates()
  const [outcomes] = useOutcomes()
  const [feedback] = useFeedback()
  const now = useNowMinute()
  const sorted = [...sessions].sort(byStart)
  const ideas = inputs.filter((i) => i.kind === "idea")
  const sessionInputs = inputs.filter((i) => i.kind !== "idea" || i.sessionId)
  const live = sessions.filter((s) => s.status === "Live")
  const finalised = Object.values(outcomes).filter((o) => o.status === "Finalised").length
  const fbList = Object.values(feedback)
  const avg = fbList.length
    ? (fbList.reduce((n, f) => n + f.rating, 0) / fbList.length).toFixed(1)
    : "—"

  const attention: { tone: Tone; title: string; detail: string; href: string; cta: string }[] = []
  sessions.forEach((s) => {
    const o = outcomes[s.id]
    if (o?.status === "Submitted")
      attention.push({
        tone: "blue",
        title: `${s.title}: outcome awaiting approval`,
        detail: o.submittedAt ? `Submitted at ${clock(o.submittedAt)}` : "Submitted by coordinator",
        href: `/admin/outcomes?open=${s.id}`,
        cta: "Review",
      })
    if (s.status === "Closed" && (!o || o.status === "Draft") && s.closedAt && now && now - s.closedAt > 30 * 60000)
      attention.push({
        tone: "red",
        title: `${s.title}: outcome overdue`,
        detail: `Closed at ${clock(s.closedAt)} · target was 30 minutes`,
        href: "/admin/outcomes",
        cta: "Chase",
      })
    const flagged = inputs.filter(
      (i) => i.sessionId === s.id && isFlagged(i.text) && !states[i.id]?.allowed && !states[i.id]?.hidden
    ).length
    if (flagged)
      attention.push({
        tone: "amber",
        title: `${s.title}: ${flagged} flagged input${flagged > 1 ? "s" : ""}`,
        detail: "Blocked words. Can't be shown to the room until reviewed.",
        href: `/coordinator/sessions/${s.id}`,
        cta: "Moderate",
      })
    if (!s.coordinator)
      attention.push({
        tone: "amber",
        title: `${s.title}: no coordinator`,
        detail: "Every outcome-required session needs one (OUT-01).",
        href: `/admin/sessions?edit=${s.id}`,
        cta: "Assign",
      })
  })

  const byTheme = themes
    .map((t) => ({ t, n: ideas.filter((i) => i.theme === t.id).length }))
    .sort((a, b) => b.n - a.n)
  const maxTheme = Math.max(1, ...byTheme.map((x) => x.n))

  const exportAll = () => {
    const title = (id?: string) => sessions.find((s) => s.id === id)?.title ?? "General"
    const rows = [
      ["Type", "Text / Title", "Proposed idea", "Problem", "Impact", "Theme", "Source", "Submitter", "Organisation", "+1", "Time", "Visible", "Shortlisted", "Discussed", "Hidden"],
      ...inputs.map((i) => [
        i.kind,
        i.text,
        i.proposed,
        i.problem,
        i.impact,
        i.theme ? themeById(i.theme).name : "",
        title(i.sessionId),
        i.author,
        i.org,
        i.votes,
        i.at,
        states[i.id]?.visible ? "Yes" : "",
        states[i.id]?.shortlisted ? "Yes" : "",
        states[i.id]?.discussed ? "Yes" : "",
        states[i.id]?.hidden ? "Yes" : "",
      ]),
    ]
    downloadText(`PAN-IIT-Summit-inputs-${new Date().toISOString().slice(0, 16).replace(":", "")}.csv`, "﻿" + csv(rows), "text/csv")
  }

  return (
    <AdminShell>
      <PageTitle
        eyebrow="Sat 3 Oct · Event overview"
        title="Summit operations"
        description="Live status of every session, what needs you, and where ideas are landing."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportAll}>
              <Download size={15} /> Export data
            </Button>
            <Link
              href="/admin/reports"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0b57f5] px-3.5 text-[13.5px] font-medium text-white shadow-[0_1px_2px_rgba(11,87,245,.35)] hover:bg-[#0a4ddb]"
            >
              Reports <ChevronRight size={15} />
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          label="Live sessions"
          value={`${live.length}`}
          icon={<Radio size={15} />}
          tone="green"
          hint={live[0] ? live[0].title : `${sessions.filter((s) => s.status === "Closed").length} of ${sessions.length} closed`}
        />
        <Stat
          label="Ideas"
          value={`${ideas.length}`}
          icon={<Lightbulb size={15} />}
          tone="amber"
          hint={byTheme[0]?.n ? `Most in ${byTheme[0].t.label}` : "None yet"}
        />
        <Stat
          label="Session inputs"
          value={`${sessionInputs.length}`}
          icon={<MessageCircle size={15} />}
          tone="blue"
          hint={`${inputs.filter((i) => i.kind === "question").length} questions · ${inputs.filter((i) => i.kind === "opinion").length} opinions`}
        />
        <Stat
          label="Outcomes finalised"
          value={`${finalised}/${sessions.length}`}
          icon={<CheckCircle2 size={15} />}
          tone="violet"
          hint={`Feedback avg ${avg} · ${fbList.length} response${fbList.length === 1 ? "" : "s"}`}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#eef1f6] px-4 py-3">
            <h2 className="text-[14px] font-semibold text-[#0f1e4d]">Today&apos;s sessions</h2>
            <Link href="/admin/sessions" className="text-[12.5px] font-medium text-[#0b57f5]">
              Manage sessions →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead className="text-[11.5px] font-medium text-[#6b7690]">
                <tr className="border-b border-[#eef1f6]">
                  <th className="px-4 py-2 font-medium">Time</th>
                  <th className="px-2 py-2 font-medium">Session</th>
                  <th className="px-2 py-2 font-medium">Coordinator</th>
                  <th className="px-2 py-2 text-right font-medium">Inputs</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f3f8]">
                {sorted.map((s) => {
                  const t = themeById(s.theme)
                  const o = outcomes[s.id]
                  return (
                    <tr key={s.id} className="hover:bg-[#fafbfd]">
                      <td className="num px-4 py-2.5 whitespace-nowrap text-[#44506e]">
                        {formatTime(s.time).start}
                      </td>
                      <td className="max-w-[260px] px-2 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-1 shrink-0 rounded-full" style={{ background: t.accent }} />
                          <span className="truncate font-medium text-[#0f1e4d]">{s.title}</span>
                        </span>
                        <span className="block truncate pl-3 text-[12px] text-[#8a93ab]">
                          {s.type} · {s.venue}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 whitespace-nowrap text-[#44506e]">
                        {s.coordinator || <span className="text-[#c62828]">Unassigned</span>}
                      </td>
                      <td className="num px-2 py-2.5 text-right text-[#0f1e4d]">
                        {inputs.filter((i) => i.sessionId === s.id).length}
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        {o || s.status === "Closed" ? (
                          <Badge tone={outcomeTone(o)} dot={false}>
                            {o?.status ?? "Not started"}
                          </Badge>
                        ) : (
                          <span className="text-[#a4acbf]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid content-start gap-4">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#eef1f6] px-4 py-3">
              <h2 className="text-[14px] font-semibold text-[#0f1e4d]">Needs attention</h2>
              <span className="num text-[12.5px] text-[#6b7690]">{attention.length}</span>
            </div>
            {attention.length === 0 ? (
              <p className="flex items-center gap-2 px-4 py-6 text-[13px] text-[#0d7a57]">
                <Check size={15} /> Nothing needs you right now.
              </p>
            ) : (
              <ul className="divide-y divide-[#f1f3f8]">
                {attention.map((a) => (
                  <li key={a.title} className="flex items-start gap-3 px-4 py-3">
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md ${a.tone === "red" ? "bg-[#fdefef] text-[#c62828]" : a.tone === "amber" ? "bg-[#fff6e5] text-[#9a6100]" : "bg-[#eef3ff] text-[#1e4fd8]"}`}
                    >
                      {a.cta === "Assign" ? <UserX size={13} /> : a.tone === "blue" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-[#0f1e4d]">{a.title}</span>
                      <span className="block text-[12px] text-[#6b7690]">{a.detail}</span>
                    </span>
                    <Link href={a.href} className="shrink-0 text-[12.5px] font-medium text-[#0b57f5]">
                      {a.cta} →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#0f1e4d]">Ideas by theme</h2>
              <Link href="/admin/ideas" className="text-[12.5px] font-medium text-[#0b57f5]">
                View →
              </Link>
            </div>
            <ul className="mt-3 grid gap-2">
              {byTheme.map(({ t, n }) => (
                <li key={t.id} className="grid grid-cols-[88px_minmax(0,1fr)_24px] items-center gap-2 text-[12.5px]">
                  <span className="truncate text-[#44506e]">{t.label}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-[#f1f4f9]">
                    <span
                      className="bar-grow block h-full rounded-full"
                      style={{ width: `${(n / maxTheme) * 100}%`, background: t.accent }}
                    />
                  </span>
                  <span className="num text-right text-[#0f1e4d]">{n}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}

/* ================================================================ */
/* Outcomes approval (OUT-03, OUT-05)                                */
/* ================================================================ */
type OutcomeFilter = "all" | "awaiting" | "progress" | "finalised"

export function OutcomesScreen() {
  const [sessions] = useSessions()
  const [outcomes, setOutcomes] = useOutcomes()
  const [transcripts, setTranscripts] = useTranscripts()
  const [filter, setFilter] = useState<OutcomeFilter>("all")
  const [openId, setOpenId] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [asking, setAsking] = useState(false)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("open")
    if (!id) return
    const t = window.setTimeout(() => setOpenId(id), 0)
    return () => window.clearTimeout(t)
  }, [])

  const rows = [...sessions].sort(byStart)
  const is = (s: Session, f: OutcomeFilter) => {
    const o = outcomes[s.id]
    if (f === "awaiting") return o?.status === "Submitted"
    if (f === "finalised") return o?.status === "Finalised"
    if (f === "progress") return !o || o.status === "Draft" || o.status === "Changes requested"
    return true
  }
  const shown = rows.filter((s) => is(s, filter))
  const open = sessions.find((s) => s.id === openId)
  const o = open ? outcomes[open.id] : undefined

  const decide = (status: "Finalised" | "Changes requested") => {
    if (!open || !o) return
    setOutcomes((m) => ({
      ...m,
      [open.id]: { ...o, status, adminNote: status === "Changes requested" ? note : undefined, updatedAt: Date.now() },
    }))
    setAsking(false)
    setNote("")
    setOpenId(null)
  }

  return (
    <AdminShell>
      <PageTitle
        eyebrow="Approval workflow"
        title="Session outcomes"
        description="Coordinators draft and submit. You approve. Only finalised outcomes go into reports."
      />
      <div className="mb-3">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all", label: "All", count: rows.length },
            { id: "awaiting", label: "Awaiting approval", count: rows.filter((s) => is(s, "awaiting")).length },
            { id: "progress", label: "In progress", count: rows.filter((s) => is(s, "progress")).length },
            { id: "finalised", label: "Finalised", count: rows.filter((s) => is(s, "finalised")).length },
          ]}
        />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="text-[11.5px] text-[#6b7690]">
              <tr className="border-b border-[#eef1f6]">
                <th className="px-4 py-2.5 font-medium">Session</th>
                <th className="px-2 py-2.5 font-medium">Coordinator</th>
                <th className="px-2 py-2.5 font-medium">Session status</th>
                <th className="px-2 py-2.5 font-medium">Outcome</th>
                <th className="px-2 py-2.5 font-medium">Updated</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f8]">
              {shown.map((s) => {
                const out = outcomes[s.id]
                return (
                  <tr key={s.id} className="hover:bg-[#fafbfd]">
                    <td className="px-4 py-3">
                      <span className="block font-medium text-[#0f1e4d]">{s.title}</span>
                      <span className="text-[12px] text-[#8a93ab]">
                        {s.type} · {formatTime(s.time).range}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-[#44506e]">{s.coordinator || "—"}</td>
                    <td className="px-2 py-3">
                      <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                    </td>
                    <td className="px-2 py-3">
                      <Badge tone={outcomeTone(out)} dot={false}>
                        {out?.status ?? "Not started"}
                      </Badge>
                    </td>
                    <td className="num px-2 py-3 text-[#6b7690]">{out ? clock(out.updatedAt) : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={out?.status === "Submitted" ? "primary" : "secondary"}
                        onClick={() => setOpenId(s.id)}
                      >
                        {out?.status === "Submitted" ? "Review" : "Open"}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="p-8 text-center text-[13.5px] text-[#6b7690]">Nothing in this view.</p>
          )}
        </div>
      </Card>

      <Modal
        side
        wide
        open={!!open}
        onClose={() => {
          setOpenId(null)
          setAsking(false)
        }}
        title={open?.title ?? ""}
        description={open ? `${open.type} · Coordinator: ${open.coordinator || "unassigned"}` : ""}
        footer={
          o?.status === "Submitted" ? (
            asking ? (
              <>
                <Button variant="secondary" onClick={() => setAsking(false)}>
                  Cancel
                </Button>
                <Button variant="danger" disabled={!note.trim()} onClick={() => decide("Changes requested")}>
                  Send back to coordinator
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setAsking(true)}>
                  Request changes
                </Button>
                <Button onClick={() => decide("Finalised")}>
                  <Check size={15} /> Approve &amp; finalise
                </Button>
              </>
            )
          ) : undefined
        }
      >
        {open && (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={outcomeTone(o)}>{o?.status ?? "Not started"}</Badge>
              {o && (
                <span className="text-[12.5px] text-[#6b7690]">
                  {o.source === "ai" ? "AI draft, edited by coordinator" : "Written manually"} · updated {clock(o.updatedAt)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-[#dfe4ee] px-3 py-2.5 text-[13px]">
              <FileUp size={16} className="text-[#5e6a85]" />
              <span className="min-w-0 flex-1 text-[#44506e]">
                {transcripts[open.id]
                  ? `Transcript: ${transcripts[open.id]!.name}`
                  : "Transcript or notes file (optional, OUT-03)"}
              </span>
              <label className="cursor-pointer text-[12.5px] font-medium text-[#0b57f5]">
                {transcripts[open.id] ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setTranscripts((m) => ({ ...m, [open.id]: { name: f.name, at: Date.now() } }))
                    e.target.value = ""
                  }}
                />
              </label>
            </div>
            {asking && (
              <label className="grid gap-1.5 text-[13px] font-medium text-[#1d2a4d]">
                What should the coordinator change?
                <textarea
                  autoFocus
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="rounded-lg border border-[#dfe4ee] p-3 text-[13.5px] font-normal focus:border-[#0b57f5] focus:outline-none"
                  placeholder="e.g. Recommendations need a department for each point."
                />
              </label>
            )}
            {o?.status === "Changes requested" && o.adminNote && (
              <p className="rounded-lg bg-[#fff6e5] p-3 text-[13px] text-[#9a6100]">
                Sent back: {o.adminNote}
              </p>
            )}
            {o ? (
              <div className="divide-y divide-[#eef1f6] rounded-lg border border-[#e6eaf2]">
                {OUTCOME_SECTIONS.map((h, n) => (
                  <section key={h} className="p-4">
                    <h3 className="text-[13px] font-semibold text-[#0f1e4d]">
                      {n + 1}. {h}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed whitespace-pre-line text-[#44506e]">
                      {o.sections[n]?.trim() || <span className="text-[#a4acbf]">Empty</span>}
                    </p>
                  </section>
                ))}
              </div>
            ) : (
              <p className="flex items-center gap-2 rounded-lg bg-[#f7f9fc] p-4 text-[13.5px] text-[#5e6a85]">
                <CalendarDays size={16} /> The coordinator hasn&apos;t started this outcome yet.
              </p>
            )}
          </div>
        )}
      </Modal>
    </AdminShell>
  )
}
