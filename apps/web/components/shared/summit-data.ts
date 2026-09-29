"use client"
import {
  Building2,
  Cpu,
  Dna,
  Leaf,
  Landmark,
  Rocket,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { usePersistedState } from "@/components/shared/use-persisted-state"

/* ------------------------------------------------------------------ */
/* Themes: every session gets its look from these, with zero uploads.  */
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

export type Theme = {
  id: ThemeId
  label: string
  icon: LucideIcon
  gradient: string
  accent: string
  soft: string
  pattern: "dots" | "grid" | "rings" | "waves"
}

export const themes: Theme[] = [
  {
    id: "energy",
    label: "Energy",
    icon: Zap,
    gradient: "linear-gradient(135deg,#92400e 0%,#d97706 55%,#f59e0b 100%)",
    accent: "#b45309",
    soft: "#fef3c7",
    pattern: "waves",
  },
  {
    id: "deeptech",
    label: "Deep Tech",
    icon: Cpu,
    gradient: "linear-gradient(135deg,#4c1d95 0%,#6d28d9 55%,#2563eb 100%)",
    accent: "#6d28d9",
    soft: "#ede9fe",
    pattern: "grid",
  },
  {
    id: "space",
    label: "Space",
    icon: Rocket,
    gradient: "linear-gradient(135deg,#0f172a 0%,#312e81 60%,#4338ca 100%)",
    accent: "#4338ca",
    soft: "#e0e7ff",
    pattern: "dots",
  },
  {
    id: "biovalley",
    label: "BioValley",
    icon: Dna,
    gradient: "linear-gradient(135deg,#9d174d 0%,#db2777 55%,#fb7185 100%)",
    accent: "#be185d",
    soft: "#fce7f3",
    pattern: "rings",
  },
  {
    id: "agritech",
    label: "Agri Tech",
    icon: Leaf,
    gradient: "linear-gradient(135deg,#14532d 0%,#15803d 55%,#65a30d 100%)",
    accent: "#15803d",
    soft: "#dcfce7",
    pattern: "waves",
  },
  {
    id: "governance",
    label: "Governance",
    icon: Landmark,
    gradient: "linear-gradient(135deg,#0c4a6e 0%,#0e7490 55%,#0891b2 100%)",
    accent: "#0e7490",
    soft: "#cffafe",
    pattern: "grid",
  },
  {
    id: "skilling",
    label: "Skilling",
    icon: TrendingUp,
    gradient: "linear-gradient(135deg,#9a3412 0%,#ea580c 55%,#fb923c 100%)",
    accent: "#c2410c",
    soft: "#ffedd5",
    pattern: "dots",
  },
  {
    id: "amaravati",
    label: "Amaravati",
    icon: Building2,
    gradient: "linear-gradient(135deg,#713f12 0%,#a16207 55%,#ca8a04 100%)",
    accent: "#a16207",
    soft: "#fef9c3",
    pattern: "rings",
  },
]

export const themeById = (id?: string): Theme =>
  themes.find((t) => t.id === id) ?? themes[1]!

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */
export type Speaker = { name: string; role: string; photo?: string }
export type Session = {
  id: string
  title: string
  time: string
  venue: string
  status: string
  theme: ThemeId
  /** "auto" = generated from theme. "media" = picked from the library. */
  cover: "auto" | "media"
  mediaId?: string
  speakers: Speaker[]
}

export const initialSessions: Session[] = [
  {
    id: "S1",
    title: "Energy in the Age of AI",
    time: "09:05–09:55",
    venue: "Main Hall",
    status: "Live",
    theme: "energy",
    cover: "auto",
    speakers: [
      { name: "Anil Sharma", role: "CEO, XYZ Energy" },
      { name: "Meera Iyer", role: "Director, Grid Labs" },
      { name: "Kiran Reddy", role: "Secretary, Energy Dept" },
    ],
  },
  {
    id: "S2",
    title: "Deep Tech in All Walks of Life",
    time: "11:15–12:05",
    venue: "Main Hall",
    status: "Upcoming",
    theme: "deeptech",
    cover: "auto",
    speakers: [{ name: "Priya Nair", role: "Founder, Quanta" }],
  },
  {
    id: "S3",
    title: "Space, Aerospace & Defence",
    time: "12:10–13:00",
    venue: "Main Hall",
    status: "Upcoming",
    theme: "space",
    cover: "auto",
    speakers: [],
  },
  {
    id: "S4",
    title: "BioValley",
    time: "13:50–14:40",
    venue: "Main Hall",
    status: "Upcoming",
    theme: "biovalley",
    cover: "auto",
    speakers: [],
  },
]

const guessTheme = (title: string): ThemeId =>
  /energy|power|grid/i.test(title)
    ? "energy"
    : /space|aero|defen/i.test(title)
      ? "space"
      : /bio|health/i.test(title)
        ? "biovalley"
        : /agri|farm/i.test(title)
          ? "agritech"
          : /govern|policy/i.test(title)
            ? "governance"
            : /skill|talent|educat/i.test(title)
              ? "skilling"
              : /amaravati/i.test(title)
                ? "amaravati"
                : "deeptech"

/** Older saved sessions (before themes existed) still render correctly. */
const normalise = (s: Partial<Session> & { id: string; title: string }): Session => ({
  time: "",
  venue: "Main Hall",
  status: "Upcoming",
  theme: guessTheme(s.title),
  cover: "auto",
  speakers: [],
  ...s,
})

export function useSessions() {
  const [raw, setSessions] = usePersistedState<Session[]>(
    "summit-sessions",
    initialSessions
  )
  return [raw.map(normalise), setSessions] as const
}

export const liveSession = (list: Session[]) =>
  list.find((s) => s.status === "Live") ?? list[0]

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

/** Session start time in minutes, for ordering the schedule. */
export const startMinutes = (time: string) => {
  const m = /(\d{1,2}):(\d{2})/.exec(time)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}

/* ------------------------------------------------------------------ */
/* Live inputs (questions, ideas, opinions)                            */
/* Author names are for Coordinator/Admin views only, never attendees. */
/* ------------------------------------------------------------------ */
export type InputKind = "question" | "idea" | "opinion"
export type LiveInput = {
  id: string
  kind: InputKind
  text: string
  author: string
  votes: number
  at: string
  theme?: ThemeId
  sessionId?: string
  problem?: string
  impact?: string
  mine?: boolean
}
export const ME = "Arjun Mehta"

export const seedInputs: LiveInput[] = [
  { id: "q1", kind: "question", text: "How can Andhra Pradesh attract more deep tech startups?", author: "Anjali Sharma", votes: 28, at: "10:14 AM" },
  { id: "q2", kind: "question", text: "What incentives are needed for clean energy adoption?", author: "Rahul Verma", votes: 19, at: "10:15 AM" },
  { id: "i1", kind: "idea", text: "Alumni-led innovation hubs in AP could drive impact.", author: "Suresh K", votes: 12, at: "10:16 AM", theme: "amaravati" },
  { id: "o1", kind: "opinion", text: "Government procurement could create early markets.", author: "Priya Nair", votes: 9, at: "10:17 AM" },
  { id: "m1", kind: "idea", text: "Smart Energy Grid", author: ME, votes: 6, at: "10:24 AM", theme: "energy", mine: true },
  { id: "m2", kind: "question", text: "How can startups participate?", author: ME, votes: 18, at: "11:32 AM", mine: true },
  { id: "m3", kind: "idea", text: "Green Hydrogen for AP", author: ME, votes: 11, at: "11:50 AM", theme: "energy", mine: true },
]

export const useInputs = () =>
  usePersistedState<LiveInput[]>("summit-inputs", seedInputs)
/** Coordinator decisions, keyed by input text: Visible / Shortlisted / Discussed / Hidden. */
export const useInputActions = () =>
  usePersistedState<Record<string, string>>("coordinator-input-actions", {})
export const useUpvotes = () =>
  usePersistedState<string[]>("attendee-upvotes", [])

export const clockNow = () =>
  new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
