"use client"
import { useRef, useState, type ReactNode } from "react"
import { Check, ImagePlus, Plus, Trash2, Upload } from "lucide-react"
import { Button, Field, Segmented, inputStyle } from "@/components/ui/primitives"
import { SessionBanner, useSessionArt } from "@/components/shared/session-visual"
import {
  COORDINATOR,
  fileToMedia,
  initials,
  themeById,
  themes,
  useMedia,
  type Session,
  type Speaker,
} from "@/components/shared/summit-data"

/** The drawer footer's Save button submits this form. */
export const SESSION_FORM_ID = "session-editor"

const venues = [
  "Main Hall",
  "First Floor RT Room 1",
  "First Floor RT Room 2",
  "First Floor RT Room 3",
]
const statuses = ["Upcoming", "Live", "Paused", "Closed"]
const coordinators = [
  COORDINATOR.name,
  ...Array.from({ length: 11 }, (_, n) => `Coordinator – S${n + 1}`),
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-4 border-t border-[#eef1f6] pt-5 first:border-0 first:pt-0">
      <div>
        <h3 className="text-[14px] font-semibold text-[#0f1e4d]">{title}</h3>
        {description && <p className="mt-0.5 text-[12.5px] text-[#6b7690]">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[#e6eaf2] px-3.5 py-3">
      <span>
        <span className="block text-[13.5px] font-medium text-[#0f1e4d]">{label}</span>
        {hint && <span className="block text-[12px] text-[#6b7690]">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-[#0b57f5]/25 ${checked ? "bg-[#0b57f5]" : "bg-[#d5dbe6]"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </span>
    </label>
  )
}

export function SessionEditor({
  session,
  onSave,
}: {
  session: Session
  onSave: (s: Session) => void
}) {
  const [draft, setDraft] = useState<Session>(session)
  const [media, setMedia] = useMedia()
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const set = <K extends keyof Session>(k: K, v: Session[K]) =>
    setDraft((d) => ({ ...d, [k]: v }))
  const art = useSessionArt(draft)
  const theme = themeById(draft.theme)

  const upload = async (file?: File) => {
    if (!file) return
    try {
      const m = await fileToMedia(file)
      setMedia((list) => [...list, m])
      setDraft((d) => ({ ...d, cover: "media", mediaId: m.id }))
      setError("")
    } catch (e) {
      setError((e as Error).message)
    }
  }
  const setSpeaker = (i: number, patch: Partial<Speaker>) =>
    set(
      "speakers",
      draft.speakers.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    )
  const speakerPhoto = async (i: number, file?: File) => {
    if (!file) return
    try {
      setSpeaker(i, { photo: (await fileToMedia(file, 256)).src })
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <form
      id={SESSION_FORM_ID}
      onSubmit={(e) => {
        e.preventDefault()
        onSave(draft)
      }}
      className="grid gap-6"
    >
      {/* Live preview */}
      <div className="rounded-xl bg-[#f3f5fa] p-3">
        <p className="mb-2 px-1 text-[12px] font-medium text-[#6b7690]">
          Attendee preview · updates as you type
        </p>
        <SessionBanner
          session={draft}
          footer={
            <span className="inline-flex h-8 items-center rounded-lg bg-[#0b57f5] px-3 text-[12.5px] font-semibold text-white">
              Join session →
            </span>
          }
        />
      </div>

      <Section title="Details">
        <Field label="Title">
          <input
            required
            autoFocus={!session.id}
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputStyle}
            placeholder="e.g. Energy in the Age of AI"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <input
              value={draft.type}
              onChange={(e) => set("type", e.target.value)}
              className={inputStyle}
              placeholder="e.g. Panel 1"
            />
          </Field>
          <Field label="Status">
            <select
              value={draft.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputStyle}
            >
              {statuses.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Time" hint="Start–end, 24-hour">
            <input
              required
              value={draft.time}
              onChange={(e) => set("time", e.target.value)}
              className={inputStyle}
              placeholder="e.g. 09:05–09:55"
              pattern="\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}"
              title="Use the format 09:05–09:55"
            />
          </Field>
          <Field label="Venue">
            <select
              value={draft.venue}
              onChange={(e) => set("venue", e.target.value)}
              className={inputStyle}
            >
              {venues.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Participation" description="Who runs it and who can take part.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Coordinator" hint="Needed for the session outcome (OUT-01)">
            <select
              value={draft.coordinator ?? ""}
              onChange={(e) => set("coordinator", e.target.value)}
              className={`${inputStyle} ${draft.coordinator ? "" : "text-[#c62828]"}`}
            >
              <option value="">Unassigned</option>
              {coordinators.map((c) => (
                <option key={c} className="text-[#0f1e4d]">
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Access">
            <Segmented
              full
              value={draft.access}
              onChange={(v) => set("access", v)}
              options={[
                { id: "Open", label: "Open to all" },
                { id: "Invited", label: "Invited only" },
              ]}
            />
          </Field>
        </div>
        <Switch
          checked={draft.feedback}
          onChange={(v) => set("feedback", v)}
          label="Session feedback"
          hint="Attendees can rate the session once it closes"
        />
      </Section>

      <Section
        title="Appearance"
        description="Every session looks finished from its theme. An image is optional."
      >
        <div className="flex flex-wrap gap-2">
          {themes.map((t) => {
            const on = draft.theme === t.id
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => set("theme", t.id)}
                aria-pressed={on}
                className={`inline-flex h-9 items-center gap-2 rounded-full pr-3.5 pl-1.5 text-[13px] font-medium transition-all ${on ? "text-[#0f1e4d] ring-2" : "text-[#44506e] ring-1 ring-[#e3e7ef] hover:bg-[#f7f9fc]"}`}
                style={on ? { background: t.soft, boxShadow: `inset 0 0 0 2px ${t.accent}` } : undefined}
              >
                <span
                  className="grid h-6 w-6 place-items-center rounded-full text-white"
                  style={{ background: t.accent }}
                >
                  {on ? <Check size={13} strokeWidth={3} /> : <t.icon size={13} />}
                </span>
                {t.label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            value={draft.cover}
            onChange={(v) => set("cover", v)}
            options={[
              { id: "auto", label: "Theme artwork" },
              { id: "media", label: "Use an image" },
            ]}
          />
          <span className="text-[12.5px] text-[#6b7690]">
            {draft.cover === "auto"
              ? `Uses the ${theme.label} look. No upload needed.`
              : art
                ? "Image selected."
                : "Pick or upload an image. The theme look shows until then."}
          </span>
        </div>
        {draft.cover === "media" && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {media.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => set("mediaId", m.id)}
                aria-label={`Use ${m.name}`}
                aria-pressed={draft.mediaId === m.id}
                className={`aspect-video overflow-hidden rounded-lg ring-2 ${draft.mediaId === m.id ? "ring-[#0b57f5]" : "ring-transparent hover:ring-[#d5dbe6]"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.src} alt={m.name} className="h-full w-full object-cover" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="grid aspect-video place-items-center content-center gap-1 rounded-lg border border-dashed border-[#cdd5e3] text-[12px] text-[#6b7690] hover:bg-[#f7f9fc]"
            >
              <Upload size={16} />
              Upload
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(e) => {
                void upload(e.target.files?.[0])
                e.target.value = ""
              }}
            />
          </div>
        )}
        {draft.cover === "media" && (
          <p className="-mt-2 text-[12px] text-[#8a93ab]">
            PNG, JPG or WebP · 1600 × 900 recommended · saved to the event media library
          </p>
        )}
        {error && <p className="text-[12.5px] text-[#c62828]">{error}</p>}
      </Section>

      <Section title="Speakers" description="Photos are optional. Initials are used otherwise.">
        {draft.speakers.length > 0 && (
          <div className="grid gap-2">
            {draft.speakers.map((sp, i) => (
              <div key={i} className="grid grid-cols-[40px_minmax(0,1fr)_32px] items-center gap-2 sm:grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)_32px]">
                <label
                  className="cursor-pointer"
                  title="Add a photo (optional)"
                  aria-label={`Photo for ${sp.name || "speaker"}`}
                >
                  {sp.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sp.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span
                      className="grid h-10 w-10 place-items-center rounded-full text-[12px] font-semibold"
                      style={{ background: theme.soft, color: theme.accent }}
                    >
                      {sp.name ? initials(sp.name) : <ImagePlus size={15} />}
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => {
                      void speakerPhoto(i, e.target.files?.[0])
                      e.target.value = ""
                    }}
                  />
                </label>
                <input
                  value={sp.name}
                  onChange={(e) => setSpeaker(i, { name: e.target.value })}
                  className={inputStyle}
                  placeholder="Name"
                  aria-label="Speaker name"
                />
                <input
                  value={sp.role}
                  onChange={(e) => setSpeaker(i, { role: e.target.value })}
                  className={`${inputStyle} col-start-2 row-start-2 sm:col-start-auto sm:row-start-auto`}
                  placeholder="Role, organisation"
                  aria-label="Speaker role"
                />
                <button
                  type="button"
                  onClick={() => set("speakers", draft.speakers.filter((_, idx) => idx !== i))}
                  aria-label="Remove speaker"
                  className="col-start-3 row-start-1 grid h-8 w-8 place-items-center rounded-md text-[#8a93ab] hover:bg-[#fdefef] hover:text-[#c62828] sm:col-start-auto sm:row-start-auto"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit"
          onClick={() => set("speakers", [...draft.speakers, { name: "", role: "" }])}
        >
          <Plus size={15} /> Add speaker
        </Button>
      </Section>
    </form>
  )
}
