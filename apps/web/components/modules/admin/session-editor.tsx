"use client"
import { useRef, useState } from "react"
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react"
import { Button, Field, inputStyle } from "@/components/ui/primitives"
import {
  SessionBanner,
  SpeakerAvatar,
  useSessionArt,
} from "@/components/shared/session-visual"
import {
  fileToMedia,
  themeById,
  themes,
  useMedia,
  type Session,
  type Speaker,
} from "@/components/shared/summit-data"

const venues = ["Main Hall", "First Floor RT Room 1", "First Floor RT Room 2"]
const statuses = ["Upcoming", "Live", "Paused", "Closed"]

export function SessionEditor({
  session,
  onSave,
  onDelete,
  onClose,
}: {
  session: Session
  onSave: (s: Session) => void
  onDelete: () => void
  onClose: () => void
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
      onSubmit={(e) => {
        e.preventDefault()
        onSave(draft)
      }}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="grid min-w-0 gap-4">
        <Field label="Title">
          <input
            required
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputStyle}
            placeholder="Energy in the Age of AI"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Time">
            <input
              required
              value={draft.time}
              onChange={(e) => set("time", e.target.value)}
              className={inputStyle}
              placeholder="09:05–09:55"
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
        </div>

        <fieldset className="grid gap-3 rounded-xl border p-4">
          <legend className="px-1 text-[11px] font-extrabold tracking-[.16em] text-muted-foreground uppercase">
            Session appearance
          </legend>
          <div>
            <p className="mb-2 text-sm font-semibold text-[#243650]">Theme</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {themes.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => set("theme", t.id)}
                  aria-pressed={draft.theme === t.id}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-bold transition-colors ${draft.theme === t.id ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "hover:bg-slate-50"}`}
                >
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-white"
                    style={{ background: t.gradient }}
                  >
                    <t.icon size={13} />
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-[#243650]">
              Visual style
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => set("cover", "auto")}
                aria-pressed={draft.cover === "auto"}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${draft.cover === "auto" ? "border-blue-600 bg-blue-600 text-white" : "hover:bg-slate-50"}`}
              >
                ● Auto
              </button>
              <button
                type="button"
                onClick={() => set("cover", "media")}
                aria-pressed={draft.cover === "media"}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${draft.cover === "media" ? "border-blue-600 bg-blue-600 text-white" : "hover:bg-slate-50"}`}
              >
                Use an image
              </button>
            </div>
            {draft.cover === "auto" ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                ✓ Uses the {theme.label} artwork · ✓ No image needed. This is
                the default for every session.
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                {media.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {media.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => set("mediaId", m.id)}
                        aria-label={`Use ${m.name}`}
                        aria-pressed={draft.mediaId === m.id}
                        className={`aspect-video overflow-hidden rounded-lg border-2 ${draft.mediaId === m.id ? "border-blue-600" : "border-transparent"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.src}
                          alt={m.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="grid place-items-center gap-1 rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground hover:bg-slate-50"
                >
                  <Upload size={18} />
                  <span className="font-bold text-foreground">Upload cover</span>
                  PNG / JPG / WebP · Recommended 1600 × 900 · Added to the
                  event library
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
                {draft.cover === "media" && !art && (
                  <p className="text-xs text-amber-700">
                    No image selected yet. The themed artwork is shown until you
                    pick one.
                  </p>
                )}
              </div>
            )}
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
        </fieldset>

        <fieldset className="grid gap-3 rounded-xl border p-4">
          <legend className="px-1 text-[11px] font-extrabold tracking-[.16em] text-muted-foreground uppercase">
            Speakers (photos optional)
          </legend>
          {draft.speakers.map((sp, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <label
                className="cursor-pointer"
                title="Add a photo (optional)"
                aria-label={`Photo for ${sp.name || "speaker"}`}
              >
                <SpeakerAvatarPreview speaker={sp} tone={theme.accent} />
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
                className={`${inputStyle} min-w-0 flex-1 basis-32`}
                placeholder="Name"
                aria-label="Speaker name"
              />
              <input
                value={sp.role}
                onChange={(e) => setSpeaker(i, { role: e.target.value })}
                className={`${inputStyle} min-w-0 flex-1 basis-32`}
                placeholder="Role, organisation"
                aria-label="Speaker role"
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    "speakers",
                    draft.speakers.filter((_, idx) => idx !== i)
                  )
                }
                aria-label="Remove speaker"
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="w-fit"
            onClick={() =>
              set("speakers", [...draft.speakers, { name: "", role: "" }])
            }
          >
            <Plus size={16} />
            Add speaker
          </Button>
        </fieldset>

        <div className="flex items-center justify-between gap-2">
          {session.id ? (
            <Button type="button" variant="danger" onClick={onDelete}>
              Delete
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit">Save session</Button>
        </div>
      </div>

      <aside className="min-w-0 lg:sticky lg:top-0 lg:self-start">
        <p className="mb-2 text-[11px] font-extrabold tracking-[.16em] text-muted-foreground uppercase">
          Attendee preview
        </p>
        <div className="rounded-3xl bg-slate-100 p-3">
          <SessionBanner
            session={draft}
            footer={
              <span className="inline-flex min-h-9 items-center rounded-lg bg-white px-3 text-xs font-extrabold text-slate-900">
                Join session →
              </span>
            }
          />
          {draft.speakers.some((s) => s.name) && (
            <div className="mt-3 grid gap-2 rounded-2xl bg-white p-3">
              {draft.speakers
                .filter((s) => s.name)
                .map((s, i) => (
                  <SpeakerAvatar key={i} speaker={s} tone={theme.accent} />
                ))}
            </div>
          )}
        </div>
      </aside>
    </form>
  )
}

function SpeakerAvatarPreview({
  speaker,
  tone,
}: {
  speaker: Speaker
  tone: string
}) {
  return speaker.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={speaker.photo}
      alt=""
      className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
    />
  ) : (
    <span
      className="grid h-10 w-10 place-items-center rounded-full text-xs font-extrabold text-white"
      style={{ background: tone }}
    >
      {speaker.name ? (
        speaker.name
          .split(" ")
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase())
          .join("")
      ) : (
        <ImagePlus size={15} />
      )}
    </span>
  )
}
