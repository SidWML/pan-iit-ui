"use client"
import {
  Building2,
  Cpu,
  Dna,
  Landmark,
  Layers,
  Rocket,
  Sprout,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { usePersistedState } from "@/components/shared/use-persisted-state"

/* ------------------------------------------------------------------ */
/* Themes: Annexure A1. Colours match the approved mobile mockups.     */
/* ------------------------------------------------------------------ */
export type ThemeId =
  | "energy"
  | "deeptech"
  | "space"
  | "biovalley"
  | "agritech"
  | "governance"
  | "skilling"
  | "amaravati"
  | "other"

export type Theme = {
  id: ThemeId
  /** Short chip label. */
  label: string
  /** Full name as shown in the Summit Themes list. */
  name: string
  icon: LucideIcon
  /** Solid icon colour. */
  accent: string
  /** Pastel row / card tint. */
  soft: string
  /** Solid fill for icon tiles in admin screens. */
  gradient: string
}

const theme = (
  id: ThemeId,
  label: string,
  name: string,
  icon: LucideIcon,
  accent: string,
  soft: string
): Theme => ({ id, label, name, icon, accent, soft, gradient: accent })

export const themes: Theme[] = [
  theme("energy", "Energy", "Energy in the Age of AI", Zap, "#f5a300", "#fff5d9"),
  theme("deeptech", "Deep Tech", "Deep Tech in All Walks of Life; Product Perfection", Cpu, "#6d4df2", "#f0ecfe"),
  theme("space", "Space", "Space, Aerospace & Defence Manufacturing", Rocket, "#3f5bf0", "#e9eeff"),
  theme("biovalley", "BioValley", "BioValley — Health Access & Screening at Scale", Dna, "#14a150", "#e7f7ec"),
  theme("agritech", "Agri Tech", "Agri Tech — Farmers & Water Security", Sprout, "#e8761c", "#ffefe0"),
  theme("governance", "Governance", "AI in Governance", Landmark, "#d92d2d", "#fdecec"),
  theme("skilling", "Skilling", "Skilling & Entrepreneurship", Users, "#0e9fbf", "#e2f6fa"),
  theme("amaravati", "Amaravati", "Amaravati Capital City", Building2, "#8155f0", "#f2ecfe"),
  theme("other", "Cross-cutting", "Other / Cross-cutting", Layers, "#c2255c", "#fdeaf1"),
]

export const themeById = (id?: string): Theme =>
  themes.find((t) => t.id === id) ?? themes[themes.length - 1]!

/* ------------------------------------------------------------------ */
/* Event configuration (Section 7). Admin toggles live in Settings.    */
/* ------------------------------------------------------------------ */
export type EventConfig = {
  login: { google: boolean; email: boolean; otp: boolean }
  ideaWindowOpen: boolean
  ideaWindowCloses: string
  summitFeedbackOpen: boolean
  summitFeedbackOpens: string
  inputTypes: { question: boolean; idea: boolean; opinion: boolean }
}
export const defaultConfig: EventConfig = {
  login: { google: true, email: true, otp: false },
  ideaWindowOpen: true,
  ideaWindowCloses: "5:00 PM",
  summitFeedbackOpen: false,
  summitFeedbackOpens: "5:15 PM",
  inputTypes: { question: true, idea: true, opinion: true },
}
export function useEventConfig() {
  const [raw, setConfig] = usePersistedState<EventConfig>(
    "summit-config",
    defaultConfig
  )
  return [{ ...defaultConfig, ...raw }, setConfig] as const
}

/** CFG-13 / CFG-14 defaults. */
export const ideaFields = {
  title: { label: "Title", required: true, max: 100 },
  proposed: { label: "Proposed Idea", required: true, max: 500 },
  problem: { label: "Problem / Opportunity", required: false, max: 500 },
  impact: { label: "Expected Impact", required: false, max: 500 },
} as const
export const INPUT_MAX = 500

/** CFG-19 attendee-facing messages. */
export const messages = {
  opensAt: (t: string) => `Opens at ${t}`,
  paused: "Participation is temporarily paused — please try again shortly.",
  closed: "This session has closed.",
  invited: "This Round Table is for invited participants only.",
}

export const EVENT_DATE = "3 Oct 2026"

/* ------------------------------------------------------------------ */
/* Sessions: Annexure A2                                               */
/* ------------------------------------------------------------------ */
export type Speaker = { name: string; role: string; photo?: string }
export type SessionStatus = "Upcoming" | "Live" | "Paused" | "Closed"
export type Session = {
  id: string
  type: string
  title: string
  /** 24-hour "HH:MM–HH:MM". */
  time: string
  venue: string
  status: string
  theme: ThemeId
  access: "Open" | "Invited"
  feedback: boolean
  /** "auto" = event artwork. "media" = picked from the library. */
  cover: "auto" | "media"
  mediaId?: string
  speakers: Speaker[]
  invitees?: string[]
  /** Assigned coordinator (OUT-01). */
  coordinator?: string
  /** Epoch ms when the session last went Live / Closed. */
  liveAt?: number
  closedAt?: number
}

const s = (
  id: string,
  type: string,
  title: string,
  time: string,
  themeId: ThemeId,
  extra: Partial<Session> = {}
): Session => ({
  id,
  type,
  title,
  time,
  venue: "Main Hall",
  status: "Upcoming",
  theme: themeId,
  access: "Open",
  feedback: true,
  cover: "auto",
  speakers: [],
  coordinator: `Coordinator – ${id}`,
  ...extra,
})

export const initialSessions: Session[] = [
  s("S1", "Panel 1", "Energy in the Age of AI", "09:05–09:55", "energy", {
    status: "Live",
    coordinator: "Ravi Kumar",
    speakers: [
      { name: "Anil Sharma", role: "CEO, XYZ Energy" },
      { name: "Meera Iyer", role: "Director, Grid Labs" },
      { name: "Kiran Reddy", role: "Energy Department, GoAP" },
    ],
  }),
  s("S2", "Panel 2", "Deep Tech in All Walks of Life", "11:15–12:05", "deeptech", {
    coordinator: "Ravi Kumar",
    speakers: [
      { name: "Priya Raman", role: "Founder, Quanta Labs" },
      { name: "Vivek Rao", role: "Partner, Deep Ventures" },
    ],
  }),
  s("S3", "Panel 3", "Space, Aerospace & Defence Mfg.", "12:10–13:00", "space"),
  s("S4", "Panel 4", "BioValley", "13:50–14:40", "biovalley"),
  s("S5", "Panel 5", "Agri Tech", "14:45–15:35", "agritech"),
  s("S6", "Talk 1 · Fireside", "Skilling & Entrepreneurship", "15:40–16:10", "skilling"),
  s("S7", "Talk 2 · Fireside", "AI in Governance", "16:10–16:40", "governance"),
  s("S8", "Talk 3 · Presentation", "Amaravati Capital City", "16:40–17:00", "amaravati"),
  s("S9", "Round Table 1", "IIT Directors’ Conclave", "14:00–15:30", "other", {
    coordinator: "Ravi Kumar",
    venue: "First Floor RT Room 1",
    access: "Invited",
    feedback: false,
  }),
  s("S10", "Round Table 2", "VCs & Family Offices", "14:15–15:45", "other", {
    venue: "First Floor RT Room 2",
    access: "Invited",
    feedback: false,
  }),
  s("S11", "Round Table 3", "Industry Leaders & Unicorn CXOs", "14:30–16:00", "other", {
    venue: "First Floor RT Room 3",
    access: "Invited",
    feedback: false,
  }),
]

/** Older saved sessions still render correctly. */
const normalise = (x: Partial<Session> & { id: string; title: string }): Session =>
  s(x.id, x.type ?? "Session", x.title, x.time ?? "", x.theme ?? "other", x)

export function useSessions() {
  const [raw, setSessions, ready] = usePersistedState<Session[]>(
    "summit-sessions-v3",
    initialSessions
  )
  return [raw.map(normalise), setSessions, ready] as const
}

export const liveSession = (list: Session[]) =>
  list.find((x) => x.status === "Live") ?? list[0]

export const startMinutes = (time: string) => {
  const m = /(\d{1,2}):(\d{2})/.exec(time)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}
const to12 = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number)
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`
}
const meridiem = (hhmm: string) => (Number(hhmm.split(":")[0]) >= 12 ? "PM" : "AM")
/** "09:05–09:55" → { start: "9:05 AM", range: "9:05 – 9:55 AM" } */
export const formatTime = (time: string) => {
  const [a = "", b = ""] = time.split(/[–-]/).map((x) => x.trim())
  if (!a) return { start: "", end: "", range: "" }
  const start = `${to12(a)} ${meridiem(a)}`
  const end = b ? `${to12(b)} ${meridiem(b)}` : ""
  const range = b
    ? meridiem(a) === meridiem(b)
      ? `${to12(a)} – ${end}`
      : `${start} – ${end}`
    : start
  return { start, end, range }
}

/* ------------------------------------------------------------------ */
/* The signed-in attendee                                              */
/* ------------------------------------------------------------------ */
export type Profile = {
  name: string
  organisation: string
  email: string
  consented: boolean
}
export const ME = "Arjun Kumar"
export const ME_EMAIL = "arjun.kumar@iitm.ac.in"
export function useProfile() {
  return usePersistedState<Profile | null>("summit-profile", null)
}
export const canJoin = (session: Session, email = ME_EMAIL) =>
  session.access === "Open" || !!session.invitees?.includes(email)

/* ------------------------------------------------------------------ */
/* Event media library (uploaded once, reused everywhere)              */
/* ------------------------------------------------------------------ */
export type Media = { id: string; name: string; src: string }

export function useMedia() {
  return usePersistedState<Media[]>("summit-media", [])
}
/** themeId -> mediaId, so Admin can swap a theme's artwork once for all sessions. */
export function useThemeArt() {
  return usePersistedState<Record<string, string>>("summit-theme-art", {})
}

/** Resize in the browser so uploads stay small and fit in local storage. */
export function fileToMedia(file: File, maxWidth = 1600): Promise<Media> {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type))
      return reject(new Error("Use a PNG, JPG or WebP image."))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve({
        id: `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        src: canvas.toDataURL("image/jpeg", 0.78),
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("That image couldn't be read."))
    }
    img.src = url
  })
}

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("")

/* ------------------------------------------------------------------ */
/* Inputs: ideas (Module 1) and session inputs (Module 2).             */
/* Author names are for Coordinator/Admin views only, never attendees. */
/* ------------------------------------------------------------------ */
export type InputKind = "question" | "idea" | "opinion"
export type LiveInput = {
  id: string
  kind: InputKind
  /** Question / opinion text, or the idea title. */
  text: string
  author: string
  votes: number
  at: string
  theme?: ThemeId
  /** Session the input came from. Ideas without one have Source "General". */
  sessionId?: string
  proposed?: string
  problem?: string
  impact?: string
  mine?: boolean
  /** Submitter's organisation. Coordinator / Admin only. */
  org?: string
  /** NFR-03: "queued" = held on the phone until the network returns. */
  delivery?: "sent" | "queued"
}

export const seedInputs: LiveInput[] = [
  { id: "q1", kind: "question", text: "How can Andhra Pradesh attract more deep-tech startups?", author: "Anjali Sharma", org: "IIT Bombay", votes: 28, at: "9:14 AM", sessionId: "S1" },
  { id: "q2", kind: "question", text: "What incentives would accelerate clean-energy adoption?", author: "Rahul Verma", org: "Tata Power", votes: 19, at: "9:18 AM", sessionId: "S1" },
  { id: "q3", kind: "question", text: "How do we build an AI-ready workforce for the grid?", author: "Priya Nair", org: "IIT Madras", votes: 11, at: "9:21 AM", sessionId: "S1" },
  { id: "q4", kind: "question", text: "Will the state publish open grid data that startups can build on?", author: "Meera Joshi", org: "NIT Warangal", votes: 4, at: "9:24 AM", sessionId: "S1" },
  { id: "i1", kind: "idea", text: "Alumni-led innovation hubs", author: "Suresh K", org: "Infosys", votes: 0, at: "9:16 AM", theme: "amaravati", proposed: "Alumni-led innovation hubs in AP could connect startups with mentors and capital." },
  { id: "i2", kind: "idea", text: "Rooftop solar marketplace for MSMEs", author: "Karthik Menon", org: "Ather Energy", votes: 0, at: "9:19 AM", theme: "energy", sessionId: "S1", proposed: "A state-backed marketplace that matches MSME rooftops with solar installers and financing." },
  { id: "o1", kind: "opinion", text: "Government procurement could create early markets for local clean-tech.", author: "Priya Nair", org: "IIT Madras", votes: 0, at: "9:17 AM", sessionId: "S1" },
  { id: "o2", kind: "opinion", text: "Storage, not generation, is the real bottleneck for renewables in AP.", author: "Neha Kapoor", org: "IISc Bengaluru", votes: 0, at: "9:22 AM", sessionId: "S1" },
  { id: "o3", kind: "opinion", text: "Damn, these panels never answer the real questions about power cuts.", author: "Vikram Desai", org: "Independent", votes: 0, at: "9:25 AM", sessionId: "S1" },
  { id: "m1", kind: "idea", text: "Affordable clean energy for rural areas", author: ME, org: "IIT Madras", votes: 0, at: "8:24 AM", theme: "energy", proposed: "Expand solar micro-grids to power rural communities and improve livelihoods.", problem: "Many rural areas face unreliable power supply, affecting education, healthcare and economic growth.", impact: "Reliable clean energy can improve quality of life, support local businesses and accelerate inclusive growth.", mine: true, delivery: "sent" },
  { id: "m2", kind: "idea", text: "AI-driven grid demand forecasting", author: ME, org: "IIT Madras", votes: 0, at: "9:12 AM", theme: "energy", sessionId: "S1", proposed: "Use AI to forecast district-level demand so DISCOMs can plan renewable intake.", mine: true, delivery: "sent" },
  { id: "m3", kind: "question", text: "How can startups take part in state energy pilots?", author: ME, org: "IIT Madras", votes: 6, at: "9:20 AM", sessionId: "S1", mine: true, delivery: "sent" },
]

export const useInputs = () =>
  usePersistedState<LiveInput[]>("summit-inputs-v3", seedInputs)

/* ------------------------------------------------------------------ */
/* Moderation (SES-07 / SES-09)                                        */
/* ------------------------------------------------------------------ */
export type InputState = {
  visible?: boolean
  shortlisted?: boolean
  discussed?: boolean
  hidden?: boolean
  /** Coordinator reviewed a flagged input and allowed it. */
  allowed?: boolean
}
export const useInputStates = () =>
  usePersistedState<Record<string, InputState>>("input-states-v3", {
    q1: { visible: true, shortlisted: true },
    q2: { visible: true, shortlisted: true },
    q3: { visible: true },
  })
/** Attendees only ever see these (SES-05). */
export const visibleToRoom = (s?: InputState) => !!s?.visible && !s.hidden

/** CFG-17 blocked-word list (editable by AQV in production). */
export const BLOCKED_WORDS = ["damn", "idiot", "stupid", "crap", "bloody", "nonsense", "shut up"]
export const isFlagged = (text: string) => {
  const t = text.toLowerCase()
  return BLOCKED_WORDS.some((w) => new RegExp(`\\b${w}\\b`).test(t))
}

/** Relay order of shortlisted inputs per session (SES-08). */
export const useShortlistOrder = () =>
  usePersistedState<Record<string, string[]>>("shortlist-order-v3", { S1: ["q1", "q2"] })

/** Coordinator key discussion points per session (OUT-02). */
export const useNotes = () =>
  usePersistedState<Record<string, string>>("coordinator-notes-v3", {})

/* ------------------------------------------------------------------ */
/* Session outcomes (OUT-04 … OUT-06)                                  */
/* ------------------------------------------------------------------ */
export const OUTCOME_SECTIONS = [
  "Session Summary",
  "Key Discussion Themes",
  "Key Audience Inputs",
  "Ideas & Opportunities",
  "Recommendations for GoAP",
  "Action Points",
  "Participation",
] as const
export type OutcomeStatus = "Draft" | "Submitted" | "Changes requested" | "Finalised"
export type Outcome = {
  status: OutcomeStatus
  sections: string[]
  source: "ai" | "manual"
  updatedAt: number
  submittedAt?: number
  adminNote?: string
}
export const useOutcomes = () =>
  usePersistedState<Record<string, Outcome>>("session-outcomes-v3", {})

/** The signed-in coordinator for the demo. */
export const COORDINATOR = { name: "Ravi Kumar", email: "ravi.kumar@aqv.in" }

export const useUpvotes = () =>
  usePersistedState<string[]>("attendee-upvotes", [])

export type SessionFeedback = { rating: number; valuable: string; suggestion: string }
export const useFeedback = () =>
  usePersistedState<Record<string, SessionFeedback>>("attendee-feedback", {})
export const useSummitFeedback = () =>
  usePersistedState<{ rating: number; best: string; suggestion: string } | null>(
    "attendee-summit-feedback",
    null
  )

export const clockNow = () =>
  new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()

/** OUT-03: optional transcript / notes file uploaded by an admin, per session. */
export const useTranscripts = () =>
  usePersistedState<Record<string, { name: string; at: number }>>("session-transcripts-v3", {})

/** Old links used named IDs (e.g. /sessions/energy-ai); map them to codes. */
const LEGACY_IDS: Record<string, string> = { "energy-ai": "s1" }
export const matchesSessionId = (session: Session, id: string) => {
  const want = String(id).toLowerCase()
  return session.id.toLowerCase() === (LEGACY_IDS[want] ?? want)
}

/* ------------------------------------------------------------------ */
/* Admin: idea moderation (IDE-06), reports (RPT-04…07), people (CFG-06) */
/* ------------------------------------------------------------------ */
export type IdeaStatus = "New" | "Shortlisted" | "Hidden"
export const useIdeaStatus = () =>
  usePersistedState<Record<string, IdeaStatus>>("idea-status-v1", {})

export type ReportKind = "Consolidated" | "Theme-wise Ideas" | "Session Outcomes"
export type ReportStatus = "Draft" | "Reviewed" | "Approved"
export type ReportVersion = {
  id: string
  kind: ReportKind
  type: "Interim" | "Final"
  version: number
  generatedAt: number
  status: ReportStatus
  approvedBy?: string
  /** What was included at generation time (RPT-06). */
  snapshot: { outcomes: number; sessions: number; ideas: number; inputs: number; pending: string[] }
  body: string
}
export const useReports = () => usePersistedState<ReportVersion[]>("reports-v1", [])

export type Role = "Attendee" | "Coordinator" | "Admin" | "Round Table invitee"
export type Person = { id: string; name: string; email: string; roles: Role[]; approver?: boolean }
export const seedPeople: Person[] = [
  { id: "p1", name: "Anita Menon", email: "anita.menon@aqv.in", roles: ["Admin"], approver: true },
  { id: "p2", name: "Ravi Kumar", email: "ravi.kumar@aqv.in", roles: ["Coordinator"] },
  { id: "p3", name: "Priya Nair", email: "priya.nair@iitm.ac.in", roles: ["Attendee", "Round Table invitee"] },
  { id: "p4", name: "Arjun Kumar", email: "arjun.kumar@iitm.ac.in", roles: ["Attendee"] },
  { id: "p5", name: "Sunil Rao", email: "sunil.rao@paniit.org", roles: ["Admin", "Coordinator"] },
]
export const usePeople = () => usePersistedState<Person[]>("people-v1", seedPeople)

/** CFG-20 prompt templates (Annexure B), editable and versioned. */
export const usePrompts = () =>
  usePersistedState<Record<string, { text: string; version: number; savedAt?: number }>>("prompts-v1", {
    "Session Outcome (B1)": {
      version: 1,
      text: "You are the official rapporteur of the PAN IIT Amaravati Summit 2026. Prepare the outcome of one session for submission to the Chief Minister's Office, Government of Andhra Pradesh.\n\nSession: {session_title} · Type: {session_type} · Theme: {theme} · Speakers: {speakers}\n\nInputs — (A) Coordinator notes: {coordinator_notes} · (B) Transcript: {transcript} · (C) Audience inputs: {audience_inputs} · (D) Feedback: {feedback_stats}\n\nRules: use only the inputs above; never name audience members; keep speaker views separate from audience views; formal, neutral government English.\n\nOutput — max 600 words: Session Summary · Key Discussion Themes · Key Audience Inputs · Ideas & Opportunities · Recommendations for GoAP · Action Points · Participation.",
    },
    "Theme-wise Ideas Summary (B2)": {
      version: 1,
      text: "Summarise the attendee ideas submitted under the theme \"{theme}\" for the Chief Minister's Office. Ideas: {ideas}\n\nRules: use only these ideas; group into at most 5 sub-themes with counts; never name individuals; add no facts or figures.\n\nOutput — max 400 words: Overview · Sub-themes · Notable Ideas · Recommended Next Steps.",
    },
    "Consolidated Report (B3)": {
      version: 1,
      text: "Prepare the Consolidated Outcomes Report of the PAN IIT Amaravati Summit 2026 for the Chief Minister's Office, GoAP. Inputs: approved session outcomes {session_outcomes}; approved theme summaries {idea_summaries}; statistics {stats}. Report type: {Interim | Final}, generated as of {timestamp}.\n\nOutput — max 1,200 words: Executive Summary · Participation at a Glance · Cross-cutting Themes · Theme-wise Highlights · Priority Recommendations for GoAP · Next Steps & Follow-up.",
    },
  })
