"use client"
import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Download,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import { AdminShell } from "@/components/modules/admin/admin-shell"
import { SessionQrPanel } from "@/components/shared/session-qr"
export { AdminDashboard, OutcomesScreen } from "@/components/modules/admin/admin-ops"
import {
  Badge,
  Button,
  Card,
  Field,
  PageTitle,
  inputStyle,
} from "@/components/ui/primitives"
import { SESSION_FORM_ID, SessionEditor } from "@/components/modules/admin/session-editor"
import { MediaLibrary } from "@/components/modules/admin/media-library"
import {
  themeById,
  useEventConfig,
  useSessions,
  type Session,
} from "@/components/shared/summit-data"
import { Modal, downloadText } from "@/components/shared/modal"
import { Toast } from "@/components/shared/toast"
import { usePersistedState } from "@/components/shared/use-persisted-state"

const Shell = AdminShell
const tone = (s: string): "blue" | "green" | "amber" | "red" | "gray" =>
  s.includes("Approved") || s.includes("Shortlisted") || s.includes("Live")
    ? "green"
    : s.includes("Hidden") || s.includes("Closed")
      ? "gray"
      : s.includes("Review") || s.includes("needed") || s.includes("Paused")
        ? "amber"
        : s.includes("Draft") || s.includes("Merged")
          ? "gray"
          : "blue"

type Idea = {
  id: number
  title: string
  theme: string
  submitter: string
  status: string
}
const initialIdeas: Idea[] = [
  ["Green Hydrogen for AP", "Clean Energy", "Arjun Mehta", "Shortlisted"],
  ["AI for Agriculture Supply Chain", "Agriculture", "Priya Nair", "New"],
  ["Alumni Innovation Hubs", "Ecosystem", "Rahul Verma", "Under Review"],
  ["Skill Development Platform", "Education", "Anjali Sharma", "Merged"],
  ["Smart Energy Grid", "Clean Energy", "Suresh K", "Shortlisted"],
].map((x, i) => ({
  id: i + 1,
  title: x[0]!,
  theme: x[1]!,
  submitter: x[2]!,
  status: x[3]!,
}))
export function IdeasScreen() {
  const [ideas, setIdeas] = usePersistedState<Idea[]>(
    "summit-ideas",
    initialIdeas
  )
  const [q, setQ] = useState("")
  const [theme, setTheme] = useState("All themes")
  const [status, setStatus] = useState("All statuses")
  const [editing, setEditing] = useState<Idea | null>(null)
  const [toast, setToast] = useState("")
  const shown = ideas.filter(
    (x) =>
      x.title.toLowerCase().includes(q.toLowerCase()) &&
      (theme === "All themes" || x.theme === theme) &&
      (status === "All statuses" || x.status === status)
  )
  const save = (form: FormData) => {
    const data = {
      title: String(form.get("title")),
      theme: String(form.get("theme")),
      submitter: String(form.get("submitter")),
      status: String(form.get("status")),
    }
    setIdeas((list) =>
      editing?.id
        ? list.map((x) => (x.id === editing.id ? { ...x, ...data } : x))
        : [...list, { id: Date.now(), ...data }]
    )
    setEditing(null)
    setToast("Idea saved")
    setTimeout(() => setToast(""), 1800)
  }
  return (
    <Shell>
      <PageTitle
        eyebrow="Ideas & innovation"
        title="Ideas management"
        description="Review, moderate, shortlist and combine duplicate submissions."
        action={
          <Button
            onClick={() =>
              setEditing({
                id: 0,
                title: "",
                theme: "Clean Energy",
                submitter: "",
                status: "New",
              })
            }
          >
            <Plus size={16} />
            Add idea
          </Button>
        }
      />
      <Card className="min-w-0 overflow-hidden">
        <div className="grid gap-3 border-b p-4 md:grid-cols-[minmax(180px,1fr)_180px_180px]">
          <div className="relative">
            <Search
              className="absolute top-3 left-3 text-muted-foreground"
              size={16}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={`${inputStyle} pl-9`}
              placeholder="Search ideas…"
            />
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className={inputStyle}
          >
            <option>All themes</option>
            {[...new Set(ideas.map((x) => x.theme))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputStyle}
          >
            <option>All statuses</option>
            {[...new Set(ideas.map((x) => x.status))].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] text-muted-foreground uppercase">
              <tr>
                {["Title", "Theme", "Submitter", "Status", "Actions"].map(
                  (x) => (
                    <th className="px-4 py-3" key={x}>
                      {x}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {shown.map((x) => (
                <tr key={x.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold">{x.title}</td>
                  <td className="px-4 py-4">{x.theme}</td>
                  <td className="px-4 py-4">{x.submitter}</td>
                  <td className="px-4 py-4">
                    <Badge tone={tone(x.status)}>{x.status}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(x)}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setIdeas((list) => list.filter((i) => i.id !== x.id))
                        }
                        aria-label={`Delete ${x.title}`}
                        className="text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No ideas match these filters.
            </p>
          )}
        </div>
      </Card>
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit idea" : "Add idea"}
      >
        <form action={save} className="grid gap-4">
          <Field label="Title">
            <input
              required
              name="title"
              defaultValue={editing?.title}
              className={inputStyle}
            />
          </Field>
          <Field label="Theme">
            <select
              name="theme"
              defaultValue={editing?.theme}
              className={inputStyle}
            >
              <option>Clean Energy</option>
              <option>Agriculture</option>
              <option>Ecosystem</option>
              <option>Education</option>
              <option>Deep Tech</option>
            </select>
          </Field>
          <Field label="Submitter">
            <input
              required
              name="submitter"
              defaultValue={editing?.submitter}
              className={inputStyle}
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue={editing?.status}
              className={inputStyle}
            >
              <option>New</option>
              <option>Under Review</option>
              <option>Shortlisted</option>
              <option>Merged</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button type="submit">Save idea</Button>
          </div>
        </form>
      </Modal>
      <Toast message={toast} />
    </Shell>
  )
}

export function SessionsAdmin() {
  const [sessions, setSessions] = useSessions()
  const [editing, setEditing] = useState<Session | null>(null)
  const [qrFor, setQrFor] = useState<Session | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
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
      data.id
        ? list.map((x) => (x.id === data.id ? data : x))
        : [...list, { ...data, id: `S${Date.now().toString().slice(-5)}` }]
    )
    setEditing(null)
    setToast("Session saved")
    setTimeout(() => setToast(""), 1800)
  }
  return (
    <Shell>
      <PageTitle
        eyebrow="Programme"
        title="Sessions"
        description="Set the basics. Every session gets its look from its theme, no images needed."
        action={
          <Button
            onClick={() =>
              setEditing({
                id: "",
                type: "Panel",
                title: "",
                time: "",
                venue: "Main Hall",
                status: "Upcoming",
                theme: "other",
                access: "Open",
                feedback: true,
                cover: "auto",
                speakers: [],
              })
            }
          >
            <Plus size={16} />
            Add session
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full md:min-w-[760px] text-left text-[13px]">
            <thead className="text-[11.5px] text-[#6b7690]">
              <tr className="border-b border-[#eef1f6]">
                <th className="px-4 py-2.5 font-medium">Session</th>
                <th className="hidden px-2 py-2.5 font-medium sm:table-cell">Time</th>
                <th className="hidden px-2 py-2.5 font-medium lg:table-cell">Venue</th>
                <th className="hidden px-2 py-2.5 font-medium md:table-cell">Coordinator</th>
                <th className="hidden px-2 py-2.5 font-medium md:table-cell">Access</th>
                <th className="px-2 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f8]">
              {[...sessions]
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((x) => {
                  const t = themeById(x.theme)
                  return (
                    <tr key={x.id} className="hover:bg-[#fafbfd]">
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2.5">
                          <span
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                            style={{ background: t.accent }}
                          >
                            <t.icon size={15} />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-[#0f1e4d]">{x.title}</span>
                            <span className="text-[12px] text-[#8a93ab]">
                              <span className="num sm:hidden">{x.time} · </span>
                              {x.type} · {t.label}
                              {x.speakers.length > 0 &&
                                ` · ${x.speakers.length} speaker${x.speakers.length > 1 ? "s" : ""}`}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="num hidden px-2 py-2.5 whitespace-nowrap text-[#44506e] sm:table-cell">{x.time}</td>
                      <td className="hidden px-2 py-2.5 text-[#44506e] lg:table-cell">{x.venue}</td>
                      <td className="hidden px-2 py-2.5 whitespace-nowrap md:table-cell">
                        {x.coordinator ? (
                          <span className="text-[#44506e]">{x.coordinator}</span>
                        ) : (
                          <span className="text-[#c62828]">Unassigned</span>
                        )}
                      </td>
                      <td className="hidden px-2 py-2.5 md:table-cell">
                        <Badge tone={x.access === "Invited" ? "violet" : "gray"} dot={false}>
                          {x.access === "Invited" ? "Invited" : "Open"}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5">
                        <Badge tone={tone(x.status)}>{x.status}</Badge>
                      </td>
                      <td className="py-2.5 pr-3 pl-1 sm:px-4">
                        <span className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="max-sm:hidden"
                            onClick={() => setQrFor(x)}
                            aria-label={`QR code for ${x.title}`}
                          >
                            <QrCode size={14} /> <span className="hidden sm:inline">QR</span>
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
        </div>
      </Card>
      <Modal
        open={!!qrFor}
        onClose={() => setQrFor(null)}
        title="Session QR code"
        description={qrFor?.title}
      >
        {qrFor && <SessionQrPanel session={qrFor} />}
      </Modal>
      <Modal
        wide
        open={!!editing}
        onClose={() => {
          setEditing(null)
          setConfirmDelete(false)
        }}
        side
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

export function ReportsScreen() {
  const [version, setVersion] = usePersistedState("summit-report-version", 3)
  const [reviewed, setReviewed] = usePersistedState(
    "summit-report-reviewed",
    false
  )
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState("")
  const summary =
    "The summit brought together leaders across technology, policy and industry to define practical opportunities for Andhra Pradesh. Priority themes include clean energy, deep tech, AI-enabled governance and talent development."
  const generate = () => {
    setGenerating(true)
    setTimeout(() => {
      setVersion((x) => x + 1)
      setGenerating(false)
      setReviewed(false)
      setToast("New report version generated")
      setTimeout(() => setToast(""), 1800)
    }, 900)
  }
  const exportReport = (format: "pdf" | "doc") => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>PAN IIT Summit Report v${version}</title></head><body style="font-family:Arial,sans-serif;max-width:720px;margin:40px auto"><h1>PAN IIT Amaravati Summit 2026</h1><p>Version ${version} · ${reviewed ? "Reviewed" : "Draft"}</p><h2>Executive Summary</h2><p>${summary}</p></body></html>`
    if (format === "doc") {
      downloadText(
        `PAN-IIT-Summit-Report-v${version}.doc`,
        html,
        "application/msword"
      )
      return
    }
    const win = window.open("", "_blank")
    if (!win) {
      setToast("Allow pop-ups to export the PDF")
      setTimeout(() => setToast(""), 2500)
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }
  return (
    <Shell>
      <PageTitle
        eyebrow="Same-day reporting"
        title="Reports"
        description="Build an interim or final report from approved outcomes and theme summaries."
        action={
          <Button disabled={generating} onClick={generate}>
            <Sparkles size={16} />
            {generating ? "Generating…" : "Generate report"}
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">Consolidated Summit Outcomes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Final report · Version {version} ·{" "}
                {reviewed ? "Reviewed" : "Draft"}
              </p>
            </div>
            <Badge tone={reviewed ? "green" : "amber"}>
              {reviewed ? "Reviewed" : "Draft"}
            </Badge>
          </div>
          <div className="mt-5 rounded-lg border bg-slate-50 p-5">
            <h3 className="font-bold">Executive summary</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {summary}
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => exportReport("pdf")} variant="secondary">
              <Download size={16} />
              PDF
            </Button>
            <Button onClick={() => exportReport("doc")} variant="secondary">
              <Download size={16} />
              Word
            </Button>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold">Readiness</h3>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ["8 of 11 outcomes approved", true],
              ["9 theme summaries approved", true],
              ["3 sessions still pending", false],
            ].map(([x, ok]) => (
              <div className="flex gap-2" key={String(x)}>
                <CheckCircle2
                  size={17}
                  className={ok ? "text-emerald-600" : "text-amber-500"}
                />
                {String(x)}
              </div>
            ))}
          </div>
          <Button
            disabled={reviewed}
            onClick={() => setReviewed(true)}
            className="mt-6 w-full"
          >
            {reviewed ? "Report reviewed" : "Mark reviewed"}
          </Button>
        </Card>
      </div>
      <Toast message={toast} />
    </Shell>
  )
}

type Person = { id: number; name: string; email: string; role: string }
const initialPeople: Person[] = [
  ["Arjun Mehta", "Attendee"],
  ["Rahul Verma", "Coordinator"],
  ["Priya Nair", "Admin"],
  ["Anjali Sharma", "Coordinator"],
].map((x, i) => ({
  id: i + 1,
  name: x[0]!,
  role: x[1]!,
  email: `${x[0]!.toLowerCase().replace(" ", ".")}@example.com`,
}))
export function PeopleScreen() {
  const [people, setPeople] = usePersistedState("summit-people", initialPeople)
  const [adding, setAdding] = useState(false)
  const add = (f: FormData) => {
    const name = String(f.get("name"))
    setPeople((x) => [
      ...x,
      {
        id: Date.now(),
        name,
        email: String(f.get("email")),
        role: String(f.get("role")),
      },
    ])
    setAdding(false)
  }
  return (
    <Shell>
      <PageTitle
        eyebrow="Access control"
        title="People & roles"
        description="Assign attendee, coordinator and admin privileges."
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus size={16} />
            Add user
          </Button>
        }
      />
      <Card className="p-5">
        <div className="grid gap-3">
          {people.map((x) => (
            <div
              className="flex flex-wrap items-center gap-3 border-b pb-3 last:border-0"
              key={x.id}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                {x.name
                  .split(" ")
                  .map((v) => v[0])
                  .join("")}
              </span>
              <div className="min-w-[180px] flex-1">
                <p className="text-sm font-bold">{x.name}</p>
                <p className="text-xs text-muted-foreground">{x.email}</p>
              </div>
              <select
                value={x.role}
                onChange={(e) =>
                  setPeople((list) =>
                    list.map((p) =>
                      p.id === x.id ? { ...p, role: e.target.value } : p
                    )
                  )
                }
                className="rounded-lg border bg-white px-3 py-2 text-sm"
              >
                <option>Attendee</option>
                <option>Coordinator</option>
                <option>Admin</option>
              </select>
              <button
                onClick={() =>
                  setPeople((list) => list.filter((p) => p.id !== x.id))
                }
                aria-label={`Remove ${x.name}`}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Modal open={adding} onClose={() => setAdding(false)} title="Add user">
        <form action={add} className="grid gap-4">
          <Field label="Name">
            <input required name="name" className={inputStyle} />
          </Field>
          <Field label="Email">
            <input required name="email" type="email" className={inputStyle} />
          </Field>
          <Field label="Role">
            <select name="role" className={inputStyle}>
              <option>Attendee</option>
              <option>Coordinator</option>
              <option>Admin</option>
            </select>
          </Field>
          <Button type="submit">Add user</Button>
        </form>
      </Modal>
    </Shell>
  )
}

type EventSettings = { name: string; date: string; venue: string }
export function SettingsScreen() {
  const tabs = [
    "General",
    "Branding",
    "Access",
    "Media",
    "Themes",
    "Venues",
    "Participation",
    "Feedback",
    "AI settings",
  ]
  const [active, setActive] = useState("General")
  const [settings, setSettings] = usePersistedState<EventSettings>(
    "summit-settings",
    {
      name: "PAN IIT Amaravati Summit 2026",
      date: "2026-10-03",
      venue: "Dr. Ambedkar Kalavedika, Vijayawada",
    }
  )
  const [edits, setEdits] = useState<Partial<EventSettings>>({})
  const draft = { ...settings, ...edits }
  const setDraft = (next: EventSettings) => setEdits(next)
  const [toast, setToast] = useState("")
  return (
    <Shell>
      <PageTitle
        eyebrow="Configuration"
        title="Event settings"
        description="Configure the summit without a deployment."
      />
      <div className="grid min-w-0 gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
        <Card className="h-fit p-2">
          {tabs.map((x) => (
            <button
              onClick={() => setActive(x)}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${active === x ? "bg-secondary font-bold text-blue-800" : "text-muted-foreground hover:bg-slate-50"}`}
              key={x}
            >
              {x}
            </button>
          ))}
        </Card>
        <Card className="min-w-0 p-5">
          <h2 className="font-bold">{active}</h2>
          {active === "General" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSettings(draft)
                setEdits({})
                setToast("Settings saved")
                setTimeout(() => setToast(""), 1800)
              }}
            >
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Event name">
                  <input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                    className={inputStyle}
                  />
                </Field>
                <Field label="Event date">
                  <input
                    value={draft.date}
                    onChange={(e) =>
                      setDraft({ ...draft, date: e.target.value })
                    }
                    type="date"
                    className={inputStyle}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Venue">
                    <input
                      value={draft.venue}
                      onChange={(e) =>
                        setDraft({ ...draft, venue: e.target.value })
                      }
                      className={inputStyle}
                    />
                  </Field>
                </div>
              </div>
              <Button type="submit" className="mt-6">
                Save settings
              </Button>
            </form>
          ) : active === "Media" ? (
            <MediaLibrary />
          ) : active === "Access" || active === "Participation" ? (
            <ConfigToggles section={active} />
          ) : (
            <div className="mt-5 rounded-lg border border-dashed p-6">
              <p className="text-sm text-muted-foreground">
                {active} controls are enabled for this frontend model.
              </p>
              <label className="mt-4 flex items-center justify-between gap-4 text-sm font-semibold">
                <span>Enable {active.toLowerCase()}</span>
                <input type="checkbox" defaultChecked />
              </label>
              <Button
                onClick={() => {
                  setToast(`${active} settings saved`)
                  setTimeout(() => setToast(""), 1800)
                }}
                className="mt-5"
              >
                Save {active.toLowerCase()}
              </Button>
            </div>
          )}
        </Card>
      </div>
      <Toast message={toast} />
    </Shell>
  )
}

function ConfigToggles({ section }: { section: "Access" | "Participation" }) {
  const [config, setConfig] = useEventConfig()
  const logins = Object.values(config.login).filter(Boolean).length
  const rows: [string, string, boolean, (v: boolean) => void, boolean?][] =
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
    <div className="mt-5 divide-y rounded-lg border">
      {rows.map(([label, help, on, set]) => {
        // CFG-03: at least one login method must always stay on.
        const locked = section === "Access" && on && logins === 1
        return (
          <label
            key={label}
            className="flex items-center justify-between gap-4 p-4 text-sm"
          >
            <span>
              <span className="block font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">
                {locked ? "At least one login method must stay on." : help}
              </span>
            </span>
            <input
              type="checkbox"
              checked={on}
              disabled={locked}
              onChange={(e) => set(e.target.checked)}
              className="h-5 w-5 accent-[#0b57f5]"
            />
          </label>
        )
      })}
    </div>
  )
}
