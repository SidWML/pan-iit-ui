"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  Lightbulb,
  Lock,
  Plus,
  Printer,
  QrCode,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from "lucide-react"
import { AdminShell } from "@/components/modules/admin/admin-shell"
import { SessionQrPanel } from "@/components/shared/session-qr"
export { AdminDashboard, OutcomesScreen } from "@/components/modules/admin/admin-ops"
import { Badge, Button, Field, Segmented, inputStyle, type Tone } from "@/components/ui/primitives"
import {
  KpiTile,
  OpsBody,
  OpsHeader,
  SectionTitle,
  TableCard,
  tableCls,
  tdCls,
  thCls,
} from "@/components/ui/ops-kit"
import { SESSION_FORM_ID, SessionEditor } from "@/components/modules/admin/session-editor"
import { MediaLibrary } from "@/components/modules/admin/media-library"
import {
  BLOCKED_WORDS,
  EVENT_DATE,
  OUTCOME_SECTIONS,
  formatTime,
  initials,
  startMinutes,
  themeById,
  themes,
  useEventConfig,
  useIdeaStatus,
  useInputs,
  useOutcomes,
  usePeople,
  usePrompts,
  useReports,
  useSessions,
  type IdeaStatus,
  type LiveInput,
  type Person,
  type ReportKind,
  type ReportVersion,
  type Role,
  type Session,
} from "@/components/shared/summit-data"
import { Modal, downloadText } from "@/components/shared/modal"
import { Toast } from "@/components/shared/toast"
import { usePersistedState } from "@/components/shared/use-persisted-state"

const Shell = AdminShell
const clock = (t: number) =>
  new Date(t)
    .toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    .toUpperCase()
const csv = (rows: (string | number | undefined)[][]) =>
  "﻿" +
  rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

/** Opens a print-ready page (PDF via the browser's Save as PDF). */
function printHtml(title: string, body: string) {
  const w = window.open("", "_blank")
  if (!w) return false
  w.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      body{font-family:Inter,Arial,sans-serif;color:#0f1e4d;max-width:760px;margin:36px auto;padding:0 20px;line-height:1.5}
      h1{font-size:24px;margin:0 0 4px}h2{font-size:17px;margin:24px 0 8px;border-bottom:1px solid #e3e7ef;padding-bottom:4px}
      h3{font-size:14px;margin:16px 0 4px}.muted{color:#5e6a85;font-size:13px}li{margin:4px 0}
      .tag{display:inline-block;background:#eef3ff;color:#1e4fd8;border-radius:4px;padding:1px 6px;font-size:11px}
    </style></head><body>${body}</body></html>`
  )
  w.document.close()
  w.focus()
  w.print()
  return true
}

const statusTone = (s: string): Tone =>
  s === "Live" ? "green" : s === "Paused" ? "amber" : s === "Closed" ? "gray" : "blue"

/* ================================================================ */
/* Ideas (IDE-05 … IDE-08)                                           */
/* ================================================================ */
const ideaTone: Record<IdeaStatus, Tone> = { New: "blue", Shortlisted: "green", Hidden: "gray" }

export function IdeasScreen() {
  const [inputs] = useInputs()
  const [sessions] = useSessions()
  const [status, setStatus] = useIdeaStatus()
  const [q, setQ] = useState("")
  const [theme, setTheme] = useState("all")
  const [source, setSource] = useState("all")
  const [st, setSt] = useState<"all" | IdeaStatus>("all")
  const [open, setOpen] = useState<LiveInput | null>(null)
  const [toast, setToast] = useState("")

  const ideas = inputs.filter((i) => i.kind === "idea")
  const statusOf = (i: LiveInput): IdeaStatus => status[i.id] ?? "New"
  const sourceOf = (i: LiveInput) =>
    i.sessionId ? (sessions.find((s) => s.id === i.sessionId)?.title ?? "Session") : "General"
  const count = (x: IdeaStatus) => ideas.filter((i) => statusOf(i) === x).length
  const shown = ideas
    .filter((i) => theme === "all" || i.theme === theme)
    .filter((i) => source === "all" || (source === "general" ? !i.sessionId : i.sessionId === source))
    .filter((i) => st === "all" || statusOf(i) === st)
    .filter((i) => {
      const t = q.trim().toLowerCase()
      return (
        !t ||
        [i.text, i.proposed, i.author, i.org].some((x) => (x ?? "").toLowerCase().includes(t))
      )
    })
    .reverse()

  const set = (i: LiveInput, s: IdeaStatus) => {
    setStatus((m) => ({ ...m, [i.id]: s }))
    setToast(s === "Hidden" ? "Hidden · excluded from AI and reports" : `Marked ${s.toLowerCase()}`)
    setTimeout(() => setToast(""), 1800)
  }

  const exportCsv = () =>
    downloadText(
      `PAN-IIT-ideas-${new Date().toISOString().slice(0, 10)}.csv`,
      csv([
        ["Title", "Theme", "Proposed idea", "Problem / opportunity", "Expected impact", "Source", "Submitter", "Organisation", "Status", "Time"],
        ...ideas.map((i) => [i.text, themeById(i.theme).name, i.proposed, i.problem, i.impact, sourceOf(i), i.author, i.org, statusOf(i), i.at]),
      ]),
      "text/csv"
    )

  // IDE-07: one page of shortlisted ideas per theme, for Policy Paper Lead Speakers.
  const snapshot = () => {
    const parts = themes
      .map((t) => {
        const list = ideas.filter((i) => i.theme === t.id && statusOf(i) === "Shortlisted")
        if (!list.length) return ""
        return `<h2>${esc(t.name)} <span class="tag">${list.length} shortlisted</span></h2><ol>${list
          .map((i) => `<li><strong>${esc(i.text)}</strong>${i.proposed ? ` — ${esc(i.proposed)}` : ""}<div class="muted">${esc(sourceOf(i))}${i.org ? ` · ${esc(i.org)}` : ""}</div></li>`)
          .join("")}</ol>`
      })
      .join("")
    // Event handler only, never during render.
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    const ok = printHtml(
      "Theme snapshot",
      `<h1>Theme snapshot · shortlisted ideas</h1><p class="muted">PAN IIT Amaravati Summit 2026 · ${EVENT_DATE} · generated ${clock(now)}</p>${parts || "<p>No ideas are shortlisted yet.</p>"}`
    )
    if (!ok) {
      setToast("Allow pop-ups to print the snapshot")
      setTimeout(() => setToast(""), 2500)
    }
  }

  return (
    <Shell>
      <OpsHeader
        eyebrow="Module 1 · Ideas & innovation"
        eyebrowIcon={Lightbulb}
        accent="#e08e00"
        tint="linear-gradient(100deg, #fff1d2 0%, #fff8ea 45%, #ffffff 100%)"
        title="Ideas"
        description="Every idea from the app and from live sessions. Shortlist the strongest; hidden ideas are kept but never reach AI or reports."
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv}>
              <Download size={15} /> Export
            </Button>
            <Button onClick={snapshot}>
              <Printer size={15} /> Theme snapshot
            </Button>
          </>
        }
        kpis={
          <>
            <KpiTile label="All ideas" value={ideas.length} icon={Lightbulb} tone="amber" onClick={() => setSt("all")} />
            <KpiTile label="New" value={count("New")} icon={Sparkles} tone="blue" alert={count("New") > 0} onClick={() => setSt("New")} />
            <KpiTile label="Shortlisted" value={count("Shortlisted")} icon={Star} tone="green" onClick={() => setSt("Shortlisted")} />
            <KpiTile label="Hidden" value={count("Hidden")} icon={EyeOff} tone="red" onClick={() => setSt("Hidden")} />
            <KpiTile label="From sessions" value={ideas.filter((i) => i.sessionId).length} icon={CalendarDays} tone="purple" />
          </>
        }
      />
      <OpsBody>
        <TableCard
          toolbar={
            <>
              <div className="relative min-w-[200px] flex-1">
                <Search size={15} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-[#8a93ab]" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, idea, name or organisation"
                  className={`${inputStyle} pl-8`}
                />
              </div>
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className={`${inputStyle} sm:!w-48`} aria-label="Theme">
                <option value="all">All themes</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <select value={source} onChange={(e) => setSource(e.target.value)} className={`${inputStyle} sm:!w-48`} aria-label="Source">
                <option value="all">All sources</option>
                <option value="general">General</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <Segmented
                value={st}
                onChange={setSt}
                size="sm"
                options={[
                  { id: "all", label: "All" },
                  { id: "New", label: "New" },
                  { id: "Shortlisted", label: "Shortlisted" },
                  { id: "Hidden", label: "Hidden" },
                ]}
              />
            </>
          }
        >
          <table className={`${tableCls} md:min-w-[860px]`}>
            <thead>
              <tr className="border-b border-[#eef1f6]">
                <th className={thCls}>Idea</th>
                <th className={`${thCls} hidden md:table-cell`}>Theme</th>
                <th className={`${thCls} hidden lg:table-cell`}>Source</th>
                <th className={`${thCls} hidden md:table-cell`}>Submitted by</th>
                <th className={thCls}>Status</th>
                <th className={`${thCls} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f8]">
              {shown.map((i) => {
                const t = themeById(i.theme)
                const s = statusOf(i)
                return (
                  <tr key={i.id} className={`hover:bg-[#fafbfd] ${s === "Hidden" ? "opacity-55" : ""}`}>
                    <td className={tdCls}>
                      <button onClick={() => setOpen(i)} className="block max-w-[420px] text-left">
                        <span className="block font-semibold text-[#0f1e4d] hover:text-[#0b57f5]">{i.text}</span>
                        {i.proposed && <span className="line-clamp-1 text-[12.5px] text-[#6b7690]">{i.proposed}</span>}
                      </button>
                    </td>
                    <td className={`${tdCls} hidden md:table-cell`}>
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-medium" style={{ background: t.soft, color: t.accent }}>
                        <t.icon size={12} /> {t.label}
                      </span>
                    </td>
                    <td className={`${tdCls} hidden max-w-[180px] truncate text-[#44506e] lg:table-cell`}>{sourceOf(i)}</td>
                    <td className={`${tdCls} hidden md:table-cell`}>
                      <span className="block text-[#0f1e4d]">{i.author}</span>
                      <span className="text-[12px] text-[#8a93ab]">{i.org ?? "—"} · {i.at}</span>
                    </td>
                    <td className={tdCls}>
                      <Badge tone={ideaTone[s]}>{s}</Badge>
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <span className="inline-flex gap-1.5">
                        <Button size="sm" variant={s === "Shortlisted" ? "primary" : "secondary"} onClick={() => set(i, s === "Shortlisted" ? "New" : "Shortlisted")}>
                          <Star size={13} className={s === "Shortlisted" ? "fill-current" : ""} />
                          <span className="hidden sm:inline">{s === "Shortlisted" ? "Shortlisted" : "Shortlist"}</span>
                        </Button>
                        <Button size="sm" variant={s === "Hidden" ? "secondary" : "danger"} onClick={() => set(i, s === "Hidden" ? "New" : "Hidden")} aria-label={s === "Hidden" ? "Unhide" : "Hide"}>
                          {s === "Hidden" ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span className="hidden sm:inline">{s === "Hidden" ? "Unhide" : "Hide"}</span>
                        </Button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {shown.length === 0 && <p className="p-10 text-center text-[13.5px] text-[#6b7690]">No ideas match these filters.</p>}
        </TableCard>
        <p className="mt-3 px-1 text-[12.5px] text-[#8a93ab]">
          Merging duplicates (IDE-08) and AI grouping into sub-themes (IDE-09) arrive with the backend AI service.
        </p>
      </OpsBody>

      <Modal
        side
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.text ?? ""}
        description={open ? `${themeById(open.theme).name} · ${sourceOf(open)}` : ""}
        footer={
          open && (
            <>
              <Button variant="danger" className="mr-auto" onClick={() => { set(open, statusOf(open) === "Hidden" ? "New" : "Hidden"); setOpen(null) }}>
                <EyeOff size={15} /> {statusOf(open) === "Hidden" ? "Unhide" : "Hide"}
              </Button>
              <Button onClick={() => { set(open, statusOf(open) === "Shortlisted" ? "New" : "Shortlisted"); setOpen(null) }}>
                <Star size={15} /> {statusOf(open) === "Shortlisted" ? "Remove from shortlist" : "Shortlist"}
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={ideaTone[statusOf(open)]}>{statusOf(open)}</Badge>
              <span className="text-[12.5px] text-[#6b7690]">{open.author} · {open.org ?? "—"} · {open.at}</span>
            </div>
            {([["Proposed idea", open.proposed], ["Problem / opportunity", open.problem], ["Expected impact", open.impact]] as const).map(([h, v]) => (
              <section key={h} className="rounded-lg border border-[#e6eaf2] p-3.5">
                <h3 className="text-[12.5px] font-semibold tracking-wide text-[#6b7690] uppercase">{h}</h3>
                <p className="mt-1 text-[14px] leading-relaxed whitespace-pre-line text-[#0f1e4d]">{v || <span className="text-[#a4acbf]">Not provided</span>}</p>
              </section>
            ))}
          </div>
        )}
      </Modal>
      <Toast message={toast} />
    </Shell>
  )
}

/* ================================================================ */
/* Sessions (CFG-09 … CFG-11)                                        */
/* ================================================================ */
export function SessionsAdmin() {
  const [sessions, setSessions] = useSessions()
  const [inputs] = useInputs()
  const [editing, setEditing] = useState<Session | null>(null)
  const [qrFor, setQrFor] = useState<Session | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [filter, setFilter] = useState<"all" | "Live" | "Upcoming" | "Closed" | "unassigned">("all")
  // Deep link: /admin/sessions?edit=S1 opens that session's drawer.
  const [deepLinked, setDeepLinked] = useState(false)
  useEffect(() => {
    if (deepLinked || !sessions.length) return
    const id = new URLSearchParams(window.location.search).get("edit")
    const target = sessions.find((x) => x.id === id)
    const t = window.setTimeout(() => {
      setDeepLinked(true)
      if (target) setEditing(target)
    }, 0)
    return () => window.clearTimeout(t)
  }, [deepLinked, sessions])
  const [toast, setToast] = useState("")
  const save = (data: Session) => {
    setSessions((list) =>
      data.id ? list.map((x) => (x.id === data.id ? data : x)) : [...list, { ...data, id: `S${Date.now().toString().slice(-5)}` }]
    )
    setEditing(null)
    setToast("Session saved")
    setTimeout(() => setToast(""), 1800)
  }
  const live = sessions.filter((s) => s.status === "Live" || s.status === "Paused").length
  const unassigned = sessions.filter((s) => !s.coordinator).length
  const shown = [...sessions]
    .sort((a, b) => startMinutes(a.time) - startMinutes(b.time))
    .filter((s) =>
      filter === "all" ? true : filter === "unassigned" ? !s.coordinator : filter === "Live" ? s.status === "Live" || s.status === "Paused" : s.status === filter
    )

  return (
    <Shell>
      <OpsHeader
        eyebrow="Programme · Sat 3 Oct"
        eyebrowIcon={CalendarDays}
        title="Sessions"
        description="Set the basics, assign a coordinator, and print the QR for the hall screen. Every session gets its look from its theme."
        actions={
          <Button
            onClick={() =>
              setEditing({ id: "", type: "Panel", title: "", time: "", venue: "Main Hall", status: "Upcoming", theme: "other", access: "Open", feedback: true, cover: "auto", speakers: [] })
            }
          >
            <Plus size={16} /> Add session
          </Button>
        }
        kpis={
          <>
            <KpiTile label="Sessions" value={sessions.length} icon={CalendarDays} tone="blue" onClick={() => setFilter("all")} />
            <KpiTile label="Live now" value={live} icon={Sparkles} tone="green" onClick={() => setFilter("Live")} />
            <KpiTile label="Upcoming" value={sessions.filter((s) => s.status === "Upcoming").length} icon={CalendarDays} tone="purple" onClick={() => setFilter("Upcoming")} />
            <KpiTile label="Closed" value={sessions.filter((s) => s.status === "Closed").length} icon={CheckCircle2} tone="amber" onClick={() => setFilter("Closed")} />
            <KpiTile label="No coordinator" value={unassigned} icon={AlertTriangle} tone="red" alert={unassigned > 0} onClick={() => setFilter("unassigned")} />
          </>
        }
      />
      <OpsBody>
        <TableCard
          toolbar={
            <Segmented
              value={filter}
              onChange={setFilter}
              size="sm"
              options={[
                { id: "all", label: "All" },
                { id: "Live", label: "Live" },
                { id: "Upcoming", label: "Upcoming" },
                { id: "Closed", label: "Closed" },
                { id: "unassigned", label: "No coordinator" },
              ]}
            />
          }
        >
          <table className={`${tableCls} md:min-w-[860px]`}>
            <thead>
              <tr className="border-b border-[#eef1f6]">
                <th className={thCls}>Session</th>
                <th className={`${thCls} hidden sm:table-cell`}>Time</th>
                <th className={`${thCls} hidden lg:table-cell`}>Venue</th>
                <th className={`${thCls} hidden md:table-cell`}>Coordinator</th>
                <th className={`${thCls} hidden xl:table-cell`}>Inputs</th>
                <th className={thCls}>Status</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f8]">
              {shown.map((x) => {
                const t = themeById(x.theme)
                return (
                  <tr key={x.id} className="hover:bg-[#fafbfd]">
                    <td className={`${tdCls} relative`}>
                      <span className="absolute inset-y-2 left-0 w-1 rounded-r-full" style={{ background: t.accent }} />
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: t.accent }}>
                          <t.icon size={15} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-[#0f1e4d]">{x.title}</span>
                          <span className="text-[12px] text-[#8a93ab]">
                            <span className="num sm:hidden">{x.time} · </span>
                            {x.type} · {t.label}
                            {x.access === "Invited" && " · Invited only"}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className={`${tdCls} num hidden whitespace-nowrap text-[#44506e] sm:table-cell`}>{formatTime(x.time).range}</td>
                    <td className={`${tdCls} hidden text-[#44506e] lg:table-cell`}>{x.venue}</td>
                    <td className={`${tdCls} hidden whitespace-nowrap md:table-cell`}>
                      {x.coordinator ? (
                        <span className="inline-flex items-center gap-2 text-[#44506e]">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#eef3ff] text-[10.5px] font-semibold text-[#1e4fd8]">{initials(x.coordinator)}</span>
                          {x.coordinator}
                        </span>
                      ) : (
                        <button onClick={() => setEditing(x)} className="inline-flex items-center gap-1 font-medium text-[#c62828] hover:underline">
                          <AlertTriangle size={13} /> Assign
                        </button>
                      )}
                    </td>
                    <td className={`${tdCls} num hidden text-[#0f1e4d] xl:table-cell`}>{inputs.filter((i) => i.sessionId === x.id).length}</td>
                    <td className={tdCls}>
                      <Badge tone={statusTone(x.status)}>{x.status}</Badge>
                    </td>
                    <td className={tdCls}>
                      <span className="flex justify-end gap-1.5">
                        <Button size="sm" variant="secondary" className="max-sm:hidden" onClick={() => setQrFor(x)} aria-label={`QR code for ${x.title}`}>
                          <QrCode size={14} /> QR
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditing(x)}>
                          Manage
                        </Button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {shown.length === 0 && <p className="p-10 text-center text-[13.5px] text-[#6b7690]">No sessions in this view.</p>}
        </TableCard>
      </OpsBody>
      <Modal open={!!qrFor} onClose={() => setQrFor(null)} title="Session QR code" description={qrFor?.title}>
        {qrFor && <SessionQrPanel session={qrFor} />}
      </Modal>
      <Modal
        wide
        side
        open={!!editing}
        onClose={() => {
          setEditing(null)
          setConfirmDelete(false)
        }}
        title={editing?.id ? editing.title : "Add session"}
        description={editing?.id ? `${editing.type} · ${editing.time}` : "Fill in the basics. Everything else is optional."}
        footer={
          editing && (
            <>
              {editing.id &&
                (confirmDelete ? (
                  <span className="mr-auto flex items-center gap-2 text-[13px] text-[#c62828]">
                    Delete this session?
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSessions((x) => x.filter((s) => s.id !== editing.id))
                        setEditing(null)
                        setConfirmDelete(false)
                      }}
                    >
                      Yes, delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Keep
                    </Button>
                  </span>
                ) : (
                  <Button variant="ghost" className="mr-auto text-[#c62828]" onClick={() => setConfirmDelete(true)}>
                    <Trash2 size={15} /> Delete
                  </Button>
                ))}
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" form={SESSION_FORM_ID}>
                {editing.id ? "Save changes" : "Add session"}
              </Button>
            </>
          )
        }
      >
        {editing && <SessionEditor key={editing.id || "new"} session={editing} onSave={save} />}
      </Modal>
      <Toast message={toast} />
    </Shell>
  )
}

/* ================================================================ */
/* Reports (RPT-04 … RPT-07)                                         */
/* ================================================================ */
const reportTone: Record<ReportVersion["status"], Tone> = { Draft: "amber", Reviewed: "blue", Approved: "green" }
const kinds: ReportKind[] = ["Consolidated", "Theme-wise Ideas", "Session Outcomes"]

export function ReportsScreen() {
  const [reports, setReports] = useReports()
  const [sessions] = useSessions()
  const [outcomes] = useOutcomes()
  const [inputs] = useInputs()
  const [ideaStatus] = useIdeaStatus()
  const [people] = usePeople()
  const [kind, setKind] = useState<ReportKind>("Consolidated")
  const [type, setType] = useState<"Interim" | "Final">("Interim")
  const [generating, setGenerating] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState("")
  const me = people.find((p) => p.email === "anita.menon@aqv.in")
  const canApprove = !!me?.approver

  const finalised = sessions.filter((s) => outcomes[s.id]?.status === "Finalised")
  const pending = sessions.filter((s) => outcomes[s.id]?.status !== "Finalised")
  const ideas = inputs.filter((i) => i.kind === "idea" && ideaStatus[i.id] !== "Hidden")
  const list = reports.filter((r) => r.kind === kind).sort((a, b) => b.generatedAt - a.generatedAt)
  const current = list.find((r) => r.id === selectedId) ?? list[0]

  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(""), 2000)
  }

  const generate = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1400))
    const at = Date.now()
    const sections: string[] = []
    if (kind === "Session Outcomes") {
      finalised.forEach((s) => {
        const o = outcomes[s.id]!
        sections.push(`<h2>${esc(s.title)}</h2>` + OUTCOME_SECTIONS.map((h, n) => (o.sections[n]?.trim() ? `<h3>${h}</h3><p>${esc(o.sections[n]!).replace(/\n/g, "<br>")}</p>` : "")).join(""))
      })
    } else if (kind === "Theme-wise Ideas") {
      themes.forEach((t) => {
        const l = ideas.filter((i) => i.theme === t.id)
        if (l.length) sections.push(`<h2>${esc(t.name)}</h2><p class="muted">${l.length} ideas · ${l.filter((i) => ideaStatus[i.id] === "Shortlisted").length} shortlisted</p><ul>${l.map((i) => `<li>${esc(i.text)}</li>`).join("")}</ul>`)
      })
    } else {
      sections.push(`<h2>1. Executive Summary</h2><ul><li>${finalised.length} of ${sessions.length} session outcomes approved.</li><li>${ideas.length} ideas received across ${new Set(ideas.map((i) => i.theme)).size} themes.</li><li>${inputs.filter((i) => i.kind !== "idea").length} audience questions and opinions captured.</li></ul>`)
      sections.push(`<h2>2. Participation at a Glance</h2><p>Questions: ${inputs.filter((i) => i.kind === "question").length} · Ideas: ${ideas.length} · Opinions: ${inputs.filter((i) => i.kind === "opinion").length}</p>`)
      finalised.forEach((s) => sections.push(`<h3>${esc(s.title)}</h3><p>${esc(outcomes[s.id]!.sections[0] ?? "")}</p>`))
    }
    if (type === "Interim" && pending.length)
      sections.push(`<h2>Pending</h2><p class="muted">Not yet included: ${pending.map((s) => esc(s.title)).join(", ")}.</p>`)
    const version = list.length + 1
    const r: ReportVersion = {
      id: `r${at}`,
      kind,
      type,
      version,
      generatedAt: at,
      status: "Draft",
      snapshot: { outcomes: finalised.length, sessions: sessions.length, ideas: ideas.length, inputs: inputs.length, pending: pending.map((s) => s.title) },
      body: sections.join("") || "<p>No approved content yet.</p>",
    }
    setReports((l) => [...l, r])
    setSelectedId(r.id)
    setGenerating(false)
    flash(`Version ${version} generated as of ${clock(at)}`)
  }

  const setStatus = (r: ReportVersion, status: ReportVersion["status"]) => {
    setReports((l) => l.map((x) => (x.id === r.id ? { ...x, status, approvedBy: status === "Approved" ? me?.name : x.approvedBy } : x)))
    flash(status === "Approved" ? "Approved. Ready to send to the CMO." : `Marked ${status.toLowerCase()}`)
  }

  const cover = (r: ReportVersion) =>
    `<h1>PAN IIT Amaravati Summit 2026</h1><p class="muted">${r.kind} Report · ${r.type} · Version ${r.version} · ${r.status}</p><p class="muted">Addressee: Chief Minister's Office, Government of Andhra Pradesh</p><p><strong>Generated as of ${EVENT_DATE}, ${clock(r.generatedAt)}</strong></p>`

  const exportPdf = (r: ReportVersion) => {
    if (!printHtml(`Summit report v${r.version}`, cover(r) + r.body)) flash("Allow pop-ups to export the PDF")
  }
  const exportWord = (r: ReportVersion) =>
    downloadText(
      `PAN-IIT-${r.kind.replace(/\W+/g, "-")}-${r.type}-v${r.version}.doc`,
      `<!doctype html><html><head><meta charset="utf-8"></head><body style="font-family:Arial">${cover(r)}${r.body}</body></html>`,
      "application/msword"
    )

  return (
    <Shell>
      <OpsHeader
        eyebrow="Same-day reporting · CMO"
        eyebrowIcon={FileText}
        accent="#7c5cfa"
        tint="linear-gradient(100deg, #efe9ff 0%, #f6f2ff 45%, #ffffff 100%)"
        title="Reports"
        description="Built only from approved content. Generate as often as you like; every version is kept with the time it was generated."
        kpis={
          <>
            <KpiTile label="Outcomes approved" value={`${finalised.length}/${sessions.length}`} icon={CheckCircle2} tone="green" />
            <KpiTile label="Sessions pending" value={pending.length} icon={AlertTriangle} tone="amber" alert={pending.length > 0} />
            <KpiTile label="Ideas in scope" value={ideas.length} icon={Lightbulb} tone="blue" />
            <KpiTile label="Versions" value={reports.length} icon={FileText} tone="purple" />
            <KpiTile label="Approved" value={reports.filter((r) => r.status === "Approved").length} icon={ShieldCheck} tone="rose" />
          </>
        }
      />
      <OpsBody>
        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="grid content-start gap-4">
            <section className="rounded-xl border border-[#e1e6ef] bg-white p-4 shadow-[0_1px_2px_rgba(15,30,77,.05)]">
              <h2 className="text-[14px] font-semibold text-[#0f1e4d]">Generate a report</h2>
              <div className="mt-3 grid gap-3">
                <Field label="Report">
                  <select value={kind} onChange={(e) => { setKind(e.target.value as ReportKind); setSelectedId(null) }} className={inputStyle}>
                    {kinds.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Type">
                  <Segmented full value={type} onChange={setType} options={[{ id: "Interim", label: "Interim" }, { id: "Final", label: "Final" }]} />
                </Field>
                {type === "Final" && pending.length > 0 && (
                  <p className="flex gap-2 rounded-lg bg-[#fff6e5] p-2.5 text-[12.5px] text-[#9a6100]">
                    <AlertTriangle size={14} className="mt-px shrink-0" /> {pending.length} sessions still pending. A final report usually waits for all outcomes.
                  </p>
                )}
                <Button size="lg" onClick={() => void generate()} disabled={generating}>
                  <Sparkles size={16} /> {generating ? "Generating…" : "Generate as of now"}
                </Button>
              </div>
            </section>
            <section className="overflow-hidden rounded-xl border border-[#e1e6ef] bg-white shadow-[0_1px_2px_rgba(15,30,77,.05)]">
              <div className="border-b border-[#eef1f6] px-4 py-3 text-[14px] font-semibold text-[#0f1e4d]">Versions · {kind}</div>
              {list.length === 0 ? (
                <p className="px-4 py-6 text-[13px] text-[#6b7690]">No versions yet.</p>
              ) : (
                <ul className="divide-y divide-[#f1f3f8]">
                  {list.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => setSelectedId(r.id)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#fafbfd] ${current?.id === r.id ? "bg-[#f5f8ff]" : ""}`}
                      >
                        <span className="num grid h-8 w-8 place-items-center rounded-lg bg-[#efe9ff] text-[12.5px] font-semibold text-[#6d4df2]">v{r.version}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium text-[#0f1e4d]">{r.type} · {clock(r.generatedAt)}</span>
                          <span className="block text-[12px] text-[#8a93ab]">{r.snapshot.outcomes}/{r.snapshot.sessions} outcomes</span>
                        </span>
                        <Badge tone={reportTone[r.status]}>{r.status}</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="min-w-0 overflow-hidden rounded-xl border border-[#e1e6ef] bg-white shadow-[0_1px_2px_rgba(15,30,77,.05)]">
            {current ? (
              <>
                <div className="flex flex-wrap items-center gap-3 border-b border-[#eef1f6] bg-[#fbfcfe] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#0f1e4d]">
                      {current.kind} · {current.type} · v{current.version}
                    </p>
                    <p className="text-[12.5px] text-[#6b7690]">
                      Generated as of {EVENT_DATE}, {clock(current.generatedAt)}
                      {current.approvedBy && ` · approved by ${current.approvedBy}`}
                    </p>
                  </div>
                  {/* Draft → Reviewed → Approved */}
                  <div className="flex items-center gap-1 text-[12px]">
                    {(["Draft", "Reviewed", "Approved"] as const).map((s, n, arr) => {
                      const reached = arr.indexOf(current.status) >= n
                      return (
                        <span key={s} className="flex items-center gap-1">
                          <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 font-medium ${reached ? "bg-[#0f1e4d] text-white" : "bg-[#eef1f6] text-[#6b7690]"}`}>
                            {reached && <Check size={11} />} {s}
                          </span>
                          {n < 2 && <span className="h-px w-3 bg-[#d5dbe6]" />}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-b border-[#eef1f6] px-4 py-2.5">
                  {current.status === "Draft" && (
                    <Button size="sm" onClick={() => setStatus(current, "Reviewed")}>
                      <Check size={14} /> Mark reviewed
                    </Button>
                  )}
                  {current.status === "Reviewed" && (
                    <Button size="sm" disabled={!canApprove} onClick={() => setStatus(current, "Approved")} title={canApprove ? "" : "Only authorised approvers can approve"}>
                      <ShieldCheck size={14} /> Approve
                    </Button>
                  )}
                  {current.status === "Reviewed" && !canApprove && (
                    <span className="flex items-center gap-1 text-[12px] text-[#6b7690]">
                      <Lock size={12} /> Needs an authorised approver
                    </span>
                  )}
                  <span className="ml-auto flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => exportPdf(current)}>
                      <Download size={14} /> PDF
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => exportWord(current)}>
                      <Download size={14} /> Word
                    </Button>
                  </span>
                </div>
                <article
                  className="prose-report max-h-[70svh] overflow-y-auto px-6 py-5 text-[14px] leading-relaxed text-[#0f1e4d] [&_h2]:mt-5 [&_h2]:border-b [&_h2]:border-[#eef1f6] [&_h2]:pb-1 [&_h2]:text-[16px] [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-[14px] [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_.muted]:text-[13px] [&_.muted]:text-[#6b7690]"
                  dangerouslySetInnerHTML={{ __html: current.body }}
                />
              </>
            ) : (
              <div className="grid place-items-center gap-2 px-6 py-20 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#efe9ff] text-[#7c5cfa]">
                  <FileText size={22} />
                </span>
                <p className="text-[15px] font-semibold text-[#0f1e4d]">No {kind.toLowerCase()} report yet</p>
                <p className="max-w-sm text-[13px] text-[#6b7690]">Generate one as of now. It uses only approved outcomes and non-hidden ideas, and prints the time on the cover.</p>
              </div>
            )}
          </section>
        </div>
        <p className="mt-3 px-1 text-[12.5px] text-[#8a93ab]">
          The text is assembled from approved content here; AI drafting with the Annexure B3 prompt comes from the backend.
        </p>
      </OpsBody>
      <Toast message={toast} />
    </Shell>
  )
}

/* ================================================================ */
/* People & roles (CFG-06, CFG-22)                                   */
/* ================================================================ */
const allRoles: Role[] = ["Attendee", "Coordinator", "Admin", "Round Table invitee"]
const roleTone: Record<Role, Tone> = { Attendee: "gray", Coordinator: "blue", Admin: "violet", "Round Table invitee": "amber" }

export function PeopleScreen() {
  const [people, setPeople] = usePeople()
  const [q, setQ] = useState("")
  const [role, setRole] = useState<"all" | Role>("all")
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Person>({ id: "", name: "", email: "", roles: ["Coordinator"] })
  const [toast, setToast] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(""), 2200)
  }
  const n = (r: Role) => people.filter((p) => p.roles.includes(r)).length
  const shown = people.filter(
    (p) =>
      (role === "all" || p.roles.includes(role)) &&
      (!q.trim() || `${p.name} ${p.email}`.toLowerCase().includes(q.trim().toLowerCase()))
  )
  const toggleRole = (p: Person, r: Role) =>
    setPeople((l) =>
      l.map((x) =>
        x.id === p.id ? { ...x, roles: x.roles.includes(r) ? x.roles.filter((y) => y !== r) : [...x.roles, r] } : x
      )
    )

  // CFG-06: bulk upload. Columns: name, email, role (Excel → Save as CSV).
  const upload = async (file?: File) => {
    if (!file) return
    const text = await file.text()
    const rows = text.split(/\r?\n/).map((l) => l.split(",").map((c) => c.replace(/^"|"$/g, "").trim())).filter((r) => r.some(Boolean))
    const body = /email/i.test(rows[0]?.join(",") ?? "") ? rows.slice(1) : rows
    let added = 0
    setPeople((l) => {
      const next = [...l]
      body.forEach(([name = "", email = "", r = "Attendee"]) => {
        if (!/\S+@\S+/.test(email)) return
        const rr = (allRoles.find((x) => x.toLowerCase() === r.toLowerCase()) ?? "Attendee") as Role
        const ex = next.find((p) => p.email.toLowerCase() === email.toLowerCase())
        if (ex) {
          if (!ex.roles.includes(rr)) ex.roles = [...ex.roles, rr]
        } else {
          next.push({ id: `p${Date.now()}${added}`, name: name || email.split("@")[0]!, email, roles: [rr] })
          added++
        }
      })
      return next
    })
    flash(`Imported ${body.length} rows`)
  }

  return (
    <Shell>
      <OpsHeader
        eyebrow="Access control"
        eyebrowIcon={Users}
        title="People & roles"
        description="Coordinator, admin and Round Table access comes only from this list. One person can hold several roles."
        actions={
          <>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={15} /> Bulk upload
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => {
                void upload(e.target.files?.[0])
                e.target.value = ""
              }}
            />
            <Button onClick={() => { setDraft({ id: "", name: "", email: "", roles: ["Coordinator"] }); setAdding(true) }}>
              <UserPlus size={15} /> Add person
            </Button>
          </>
        }
        kpis={
          <>
            <KpiTile label="Coordinators" value={n("Coordinator")} icon={CalendarDays} tone="blue" onClick={() => setRole("Coordinator")} />
            <KpiTile label="Admins" value={n("Admin")} icon={ShieldCheck} tone="purple" onClick={() => setRole("Admin")} />
            <KpiTile label="Round Table invitees" value={n("Round Table invitee")} icon={Lock} tone="amber" onClick={() => setRole("Round Table invitee")} />
            <KpiTile label="Report approvers" value={people.filter((p) => p.approver).length} icon={CheckCircle2} tone="green" />
            <KpiTile label="Everyone" value={people.length} icon={Users} tone="rose" onClick={() => setRole("all")} />
          </>
        }
      />
      <OpsBody>
        <TableCard
          toolbar={
            <>
              <div className="relative min-w-[200px] flex-1">
                <Search size={15} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-[#8a93ab]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className={`${inputStyle} pl-8`} />
              </div>
              <Segmented
                size="sm"
                value={role}
                onChange={setRole}
                options={[{ id: "all", label: "All" }, ...allRoles.map((r) => ({ id: r, label: r === "Round Table invitee" ? "RT invitees" : `${r}s` }))]}
              />
            </>
          }
        >
          <table className={`${tableCls} md:min-w-[820px]`}>
            <thead>
              <tr className="border-b border-[#eef1f6]">
                <th className={thCls}>Person</th>
                <th className={thCls}>Roles</th>
                <th className={`${thCls} hidden md:table-cell`}>Report approver</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f8]">
              {shown.map((p) => (
                <tr key={p.id} className="hover:bg-[#fafbfd]">
                  <td className={tdCls}>
                    <span className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef3ff] text-[12px] font-semibold text-[#1e4fd8]">{initials(p.name)}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#0f1e4d]">{p.name}</span>
                        <span className="text-[12px] text-[#8a93ab]">{p.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className={tdCls}>
                    <span className="flex flex-wrap gap-1.5">
                      {allRoles.map((r) => {
                        const on = p.roles.includes(r)
                        return (
                          <button
                            key={r}
                            onClick={() => toggleRole(p, r)}
                            aria-pressed={on}
                            className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[12px] font-medium transition-colors ${on ? "" : "text-[#8a93ab] ring-1 ring-[#e3e7ef] ring-inset hover:bg-[#f7f9fc]"}`}
                            style={on ? { background: badgeBg[roleTone[r]][0], color: badgeBg[roleTone[r]][1] } : undefined}
                          >
                            {on ? <Check size={11} /> : <Plus size={11} />} {r}
                          </button>
                        )
                      })}
                    </span>
                  </td>
                  <td className={`${tdCls} hidden md:table-cell`}>
                    {p.roles.includes("Admin") ? (
                      <label className="inline-flex cursor-pointer items-center gap-2 text-[12.5px] text-[#44506e]">
                        <input
                          type="checkbox"
                          checked={!!p.approver}
                          onChange={(e) => setPeople((l) => l.map((x) => (x.id === p.id ? { ...x, approver: e.target.checked } : x)))}
                          className="h-4 w-4 accent-[#0b57f5]"
                        />
                        Can approve reports
                      </label>
                    ) : (
                      <span className="text-[12px] text-[#a4acbf]">Admins only</span>
                    )}
                  </td>
                  <td className={`${tdCls} text-right`}>
                    <button
                      onClick={() => setPeople((l) => l.filter((x) => x.id !== p.id))}
                      aria-label={`Remove ${p.name}`}
                      className="rounded-md p-2 text-[#8a93ab] hover:bg-[#fdefef] hover:text-[#c62828]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="p-10 text-center text-[13.5px] text-[#6b7690]">No one matches.</p>}
        </TableCard>
        <p className="mt-3 px-1 text-[12.5px] text-[#8a93ab]">
          Bulk upload: save the Excel sheet as CSV with columns name, email, role. Existing emails get the extra role.
        </p>
      </OpsBody>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add person"
        description="They sign in with Google or an email link; their role comes from here."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
            <Button
              disabled={!/\S+@\S+\.\S+/.test(draft.email) || !draft.roles.length}
              onClick={() => {
                setPeople((l) => [...l, { ...draft, id: `p${Date.now()}`, name: draft.name || draft.email.split("@")[0]! }])
                setAdding(false)
                flash("Person added")
              }}
            >
              Add person
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Name">
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputStyle} placeholder="e.g. Ravi Kumar" />
          </Field>
          <Field label="Email">
            <input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={inputStyle} placeholder="name@organisation.in" />
          </Field>
          <Field label="Roles">
            <span className="flex flex-wrap gap-1.5">
              {allRoles.map((r) => {
                const on = draft.roles.includes(r)
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDraft({ ...draft, roles: on ? draft.roles.filter((x) => x !== r) : [...draft.roles, r] })}
                    className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-[12.5px] font-medium ${on ? "bg-[#0b57f5] text-white" : "text-[#44506e] ring-1 ring-[#dfe4ee]"}`}
                  >
                    {on && <Check size={12} />} {r}
                  </button>
                )
              })}
            </span>
          </Field>
        </div>
      </Modal>
      <Toast message={toast} />
    </Shell>
  )
}
const badgeBg: Record<Tone, [string, string]> = {
  blue: ["#eef3ff", "#1e4fd8"],
  green: ["#ebf8f2", "#0d7a57"],
  amber: ["#fff6e5", "#9a6100"],
  red: ["#fdefef", "#c62828"],
  gray: ["#f3f5f9", "#4a5572"],
  violet: ["#f3efff", "#5b3fd6"],
}

/* ================================================================ */
/* Event settings (Section 7)                                        */
/* ================================================================ */
type EventSettings = { name: string; themeLine: string; date: string; venue: string }
const settingTabs = [
  { id: "General", icon: Settings, hint: "Name, date, venue" },
  { id: "Access", icon: Lock, hint: "Login methods" },
  { id: "Participation", icon: Sparkles, hint: "Windows & input types" },
  { id: "Moderation", icon: ShieldCheck, hint: "Blocked words" },
  { id: "AI prompts", icon: FileText, hint: "Annexure B templates" },
  { id: "Media", icon: Upload, hint: "Artwork library" },
] as const
type SettingTab = (typeof settingTabs)[number]["id"]

export function SettingsScreen() {
  const [active, setActive] = useState<SettingTab>("General")
  const [settings, setSettings] = usePersistedState<EventSettings>("summit-settings-v2", {
    name: "PAN IIT Amaravati Summit 2026",
    themeLine: "Andhra’s Resilient DeepTech Decade: Anchored by PanIIT",
    date: "2026-10-03",
    venue: "Dr. Ambedkar Kalavedika, Vijayawada",
  })
  const [edits, setEdits] = useState<Partial<EventSettings>>({})
  const draft = { ...settings, ...edits }
  const [toast, setToast] = useState("")
  const flash = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(""), 1800)
  }
  const tab = settingTabs.find((t) => t.id === active)!

  return (
    <Shell>
      <OpsHeader
        eyebrow="Configuration · no deployment needed"
        eyebrowIcon={Settings}
        title="Event settings"
        description="Everything in Section 7 of the requirements is set here and takes effect immediately."
      />
      <OpsBody>
        <div className="grid min-w-0 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-[#e1e6ef] bg-white p-1.5 lg:h-fit lg:flex-col">
            {settingTabs.map(({ id, icon: Icon, hint }) => {
              const on = active === id
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${on ? "bg-[#0f1e4d] text-white" : "text-[#44506e] hover:bg-[#f4f6fa]"}`}
                >
                  <Icon size={16} className={on ? "text-[#9dbcff]" : "text-[#8a93ab]"} />
                  <span className="leading-tight">
                    <span className="block text-[13.5px] font-semibold">{id}</span>
                    <span className={`hidden text-[11.5px] lg:block ${on ? "text-white/60" : "text-[#8a93ab]"}`}>{hint}</span>
                  </span>
                </button>
              )
            })}
          </nav>
          <section className="min-w-0 rounded-xl border border-[#e1e6ef] bg-white p-5 shadow-[0_1px_2px_rgba(15,30,77,.05)]">
            <SectionTitle title={tab.id} aside={tab.hint} />
            {active === "General" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSettings(draft)
                  setEdits({})
                  flash("Settings saved")
                }}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="md:col-span-2">
                  <Field label="Summit name">
                    <input value={draft.name} onChange={(e) => setEdits({ ...edits, name: e.target.value })} className={inputStyle} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Theme line">
                    <input value={draft.themeLine} onChange={(e) => setEdits({ ...edits, themeLine: e.target.value })} className={inputStyle} />
                  </Field>
                </div>
                <Field label="Date">
                  <input type="date" value={draft.date} onChange={(e) => setEdits({ ...edits, date: e.target.value })} className={inputStyle} />
                </Field>
                <Field label="Time zone">
                  <input value="IST (UTC+5:30)" readOnly className={`${inputStyle} bg-[#f7f9fc]`} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Venue">
                    <input value={draft.venue} onChange={(e) => setEdits({ ...edits, venue: e.target.value })} className={inputStyle} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={!Object.keys(edits).length}>Save changes</Button>
                </div>
              </form>
            )}
            {(active === "Access" || active === "Participation") && <ConfigToggles section={active} />}
            {active === "Moderation" && <BlockedWords />}
            {active === "AI prompts" && <PromptEditor onSaved={flash} />}
            {active === "Media" && <MediaLibrary />}
          </section>
        </div>
      </OpsBody>
      <Toast message={toast} />
    </Shell>
  )
}

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-[#0b57f5]" : "bg-[#d5dbe6]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  )
}

function ConfigToggles({ section }: { section: "Access" | "Participation" }) {
  const [config, setConfig] = useEventConfig()
  const logins = Object.values(config.login).filter(Boolean).length
  const rows: [string, string, boolean, (v: boolean) => void][] =
    section === "Access"
      ? [
          ["Google Sign-In", "Primary login (ACC-01)", config.login.google, (v) => setConfig((c) => ({ ...c, login: { ...c.login, google: v } }))],
          ["Email login link", "For attendees without Google (ACC-02)", config.login.email, (v) => setConfig((c) => ({ ...c, login: { ...c.login, email: v } }))],
          ["Mobile + OTP", "Turn on only with a DLT-approved SMS route (ACC-03)", config.login.otp, (v) => setConfig((c) => ({ ...c, login: { ...c.login, otp: v } }))],
        ]
      : [
          ["Idea window open", `Attendees can submit and edit ideas · closes ${config.ideaWindowCloses} (CFG-12)`, config.ideaWindowOpen, (v) => setConfig((c) => ({ ...c, ideaWindowOpen: v }))],
          ["Summit feedback open", `Opens at the Valedictory, ${config.summitFeedbackOpens} (CFG-18)`, config.summitFeedbackOpen, (v) => setConfig((c) => ({ ...c, summitFeedbackOpen: v }))],
          ["Questions", "Session input type (CFG-14)", config.inputTypes.question, (v) => setConfig((c) => ({ ...c, inputTypes: { ...c.inputTypes, question: v } }))],
          ["Ideas in sessions", "Session input type (CFG-14)", config.inputTypes.idea, (v) => setConfig((c) => ({ ...c, inputTypes: { ...c.inputTypes, idea: v } }))],
          ["Opinions", "Session input type (CFG-14)", config.inputTypes.opinion, (v) => setConfig((c) => ({ ...c, inputTypes: { ...c.inputTypes, opinion: v } }))],
        ]
  return (
    <div className="divide-y divide-[#eef1f6] rounded-lg border border-[#e6eaf2]">
      {rows.map(([label, help, on, set]) => {
        // CFG-03: at least one login method must always stay on.
        const locked = section === "Access" && on && logins === 1
        return (
          <div key={label} className="flex items-center justify-between gap-4 px-4 py-3.5">
            <span>
              <span className="block text-[13.5px] font-medium text-[#0f1e4d]">{label}</span>
              <span className="text-[12.5px] text-[#6b7690]">{locked ? "At least one login method must stay on." : help}</span>
            </span>
            <Toggle checked={on} disabled={locked} onChange={set} />
          </div>
        )
      })}
    </div>
  )
}

function BlockedWords() {
  return (
    <div className="grid gap-3">
      <p className="text-[13.5px] text-[#44506e]">
        Inputs containing these words are flagged and can&apos;t be shown to the room until a coordinator reviews them (SES-09).
      </p>
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-[#e6eaf2] p-3">
        {BLOCKED_WORDS.map((w) => (
          <span key={w} className="inline-flex h-7 items-center rounded-full bg-[#fdefef] px-2.5 text-[12.5px] font-medium text-[#c62828]">
            {w}
          </span>
        ))}
      </div>
      <p className="text-[12.5px] text-[#8a93ab]">Editing the list (CFG-17) is saved on the server, so it arrives with the backend.</p>
    </div>
  )
}

function PromptEditor({ onSaved }: { onSaved: (m: string) => void }) {
  const [prompts, setPrompts] = usePrompts()
  const names = useMemo(() => Object.keys(prompts), [prompts])
  const [name, setName] = useState(names[0] ?? "")
  const cur = prompts[name]
  const [text, setText] = useState(cur?.text ?? "")
  const dirty = text !== cur?.text
  return (
    <div className="grid gap-3">
      <Segmented
        value={name}
        onChange={(n) => {
          setName(n)
          setText(prompts[n]?.text ?? "")
        }}
        size="sm"
        options={names.map((n) => ({ id: n, label: n }))}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        className="w-full resize-y rounded-lg border border-[#dfe4ee] p-3 font-mono text-[12.5px] leading-relaxed text-[#0f1e4d] focus:border-[#0b57f5] focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={!dirty}
          onClick={() => {
            setPrompts((m) => ({ ...m, [name]: { text, version: (m[name]?.version ?? 0) + 1, savedAt: Date.now() } }))
            onSaved(`Saved as version ${(cur?.version ?? 0) + 1}`)
          }}
        >
          Save new version
        </Button>
        <span className="text-[12.5px] text-[#6b7690]">
          Version {cur?.version ?? 1}
          {cur?.savedAt && ` · saved ${clock(cur.savedAt)}`} · AI output is never auto-published.
        </span>
      </div>
    </div>
  )
}
