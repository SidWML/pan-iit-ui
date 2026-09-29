"use client"
import type { ReactNode } from "react"
import {
  initials,
  themeById,
  useMedia,
  useThemeArt,
  type Session,
  type Speaker,
} from "@/components/shared/summit-data"

const patterns = {
  dots: "radial-gradient(rgba(255,255,255,.28) 1.5px, transparent 1.6px)",
  grid: "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)",
  rings:
    "repeating-radial-gradient(circle at 85% 15%, rgba(255,255,255,.16) 0 2px, transparent 2px 22px)",
  waves:
    "repeating-linear-gradient(-35deg, rgba(255,255,255,.12) 0 2px, transparent 2px 18px)",
}
const patternSize = { dots: "18px 18px", grid: "26px 26px", rings: "auto", waves: "auto" }

type Look = Pick<Session, "theme" | "cover" | "mediaId">

/** Resolves the artwork for a session: its own pick, then the theme's, else generated. */
export function useSessionArt(s: Look) {
  const [media] = useMedia()
  const [themeArt] = useThemeArt()
  const id = s.cover === "media" ? s.mediaId : themeArt[s.theme]
  return media.find((m) => m.id === id)?.src
}

/**
 * The session banner. Looks complete from the admin's text alone:
 * theme gradient + pattern + icon. An uploaded cover is layered underneath
 * a scrim so the title always stays readable.
 */
export function SessionBanner({
  session,
  size = "card",
  live,
  footer,
  className = "",
}: {
  session: Pick<Session, "title" | "time" | "venue" | "status"> & Look
  size?: "card" | "hero"
  live?: boolean
  footer?: ReactNode
  className?: string
}) {
  const theme = themeById(session.theme)
  const art = useSessionArt(session)
  const Icon = theme.icon
  const isLive = live ?? session.status === "Live"
  const hero = size === "hero"
  return (
    <div
      className={`relative isolate overflow-hidden text-white ${hero ? "rounded-3xl p-5" : "rounded-2xl p-4"} ${className}`}
      style={{ background: theme.gradient }}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}
      {art && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
      )}
      {!art && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-70"
            style={{
              backgroundImage: patterns[theme.pattern],
              backgroundSize: patternSize[theme.pattern],
            }}
          />
          <Icon
            aria-hidden
            strokeWidth={1.25}
            className={`absolute -z-10 text-white/15 ${hero ? "-right-6 -bottom-6 h-44 w-44" : "-right-4 -bottom-4 h-32 w-32"}`}
          />
        </>
      )}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold tracking-[.16em] uppercase backdrop-blur-sm">
          <Icon size={12} />
          {theme.label}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[.16em] uppercase">
            <span className="live-pulse h-2 w-2 rounded-full bg-red-400" />
            Live
          </span>
        ) : (
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
            {session.status}
          </span>
        )}
      </div>
      <h3
        className={`font-display leading-tight font-semibold ${hero ? "mt-6 text-[32px]" : "mt-4 text-xl"}`}
      >
        {session.title || "Untitled session"}
      </h3>
      <p className="mt-2 text-xs font-medium text-white/85">
        {[session.time, session.venue].filter(Boolean).join(" · ") ||
          "Time and venue"}
      </p>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  )
}

/** Photo when provided, initials when not. Same layout either way. */
export function SpeakerAvatar({
  speaker,
  tone = "#1d4ed8",
}: {
  speaker: Speaker
  tone?: string
}) {
  return (
    <div className="flex items-center gap-3">
      {speaker.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={speaker.photo}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white"
          style={{ background: tone }}
        >
          {initials(speaker.name)}
        </span>
      )}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-bold">{speaker.name}</p>
        {speaker.role && (
          <p className="truncate text-xs text-muted-foreground">
            {speaker.role}
          </p>
        )}
      </div>
    </div>
  )
}
