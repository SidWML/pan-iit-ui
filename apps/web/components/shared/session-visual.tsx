"use client"
import type { ReactNode } from "react"
import { Clock3, MapPin } from "lucide-react"
import {
  formatTime,
  initials,
  themeById,
  useMedia,
  useThemeArt,
  type Session,
  type Speaker,
} from "@/components/shared/summit-data"

type Look = Pick<Session, "theme" | "cover" | "mediaId">

/** Resolves the artwork for a session: its own pick, then the theme's, else the event artwork. */
export function useSessionArt(s: Look) {
  const [media] = useMedia()
  const [themeArt] = useThemeArt()
  const id = s.cover === "media" ? s.mediaId : themeArt[s.theme]
  return media.find((m) => m.id === id)?.src
}

/**
 * The session card attendees see. With no uploads it uses the shared event
 * artwork (sunrise + podium) and the theme colour. An uploaded cover sits
 * behind a scrim so the title always stays readable.
 */
export function SessionBanner({
  session,
  size = "card",
  live,
  footer,
  className = "",
}: {
  session: Pick<Session, "title" | "time" | "venue" | "status"> &
    Look & { type?: string }
  size?: "card" | "hero"
  live?: boolean
  footer?: ReactNode
  className?: string
}) {
  const theme = themeById(session.theme)
  const art = useSessionArt(session)
  const isLive = live ?? session.status === "Live"
  const hero = size === "hero"
  const time = formatTime(session.time).range
  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border border-[#e8edf6] ${art ? "text-white" : "sunrise text-[#0f1e4d]"} ${hero ? "p-5" : "p-4"} ${className}`}
    >
      {art ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0f1e4d]/85 via-[#0f1e4d]/45 to-[#0f1e4d]/10" />
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/illustrations/podium.webp"
          alt=""
          aria-hidden
          className={`absolute -right-3 -bottom-2 -z-10 ${hero ? "w-40" : "w-28"}`}
        />
      )}
      <span
        className="absolute inset-y-4 left-0 w-1 rounded-r-full"
        style={{ background: theme.accent }}
      />
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-[11px] font-semibold tracking-[.14em] uppercase"
          style={{ color: art ? "#fff" : theme.accent }}
        >
          {session.type ? `${session.type} · ` : ""}
          {theme.label}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e5373b] px-2.5 py-1 text-[11px] font-semibold text-white">
            <span className="live-pulse h-1.5 w-1.5 rounded-full bg-white" />
            Live Now
          </span>
        ) : (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${art ? "bg-white/20" : "bg-white/80 text-[#44506e]"}`}
          >
            {session.status}
          </span>
        )}
      </div>
      <h3
        className={`font-display max-w-[72%] leading-tight ${hero ? "mt-3 text-[24px]" : "mt-2 text-[19px]"}`}
      >
        {session.title || "Untitled session"}
      </h3>
      <p
        className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px] ${art ? "text-white/85" : "text-[#44506e]"}`}
      >
        <span className="flex items-center gap-1">
          <Clock3 size={13} /> {time || "Time"}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {session.venue || "Venue"}
        </span>
      </p>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  )
}

/** Photo when provided, initials when not. Same layout either way. */
export function SpeakerAvatar({
  speaker,
  tone = "#0b57f5",
}: {
  speaker: Speaker
  tone?: string
}) {
  return (
    <div className="flex items-center gap-3">
      {speaker.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={speaker.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
          style={{ background: tone }}
        >
          {initials(speaker.name)}
        </span>
      )}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">{speaker.name}</p>
        {speaker.role && (
          <p className="truncate text-xs text-muted-foreground">{speaker.role}</p>
        )}
      </div>
    </div>
  )
}
