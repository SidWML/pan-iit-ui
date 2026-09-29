"use client"
import { useRef, useState } from "react"
import { Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/primitives"
import {
  fileToMedia,
  themes,
  useMedia,
  useThemeArt,
} from "@/components/shared/summit-data"

/** Event Settings → Media. Upload once, then reuse across sessions and themes. */
export function MediaLibrary() {
  const [media, setMedia] = useMedia()
  const [themeArt, setThemeArt] = useThemeArt()
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const add = async (files: FileList | null) => {
    for (const file of Array.from(files ?? [])) {
      try {
        const m = await fileToMedia(file)
        setMedia((list) => [...list, m])
        setError("")
      } catch (e) {
        setError((e as Error).message)
      }
    }
  }
  const remove = (id: string) => {
    setMedia((list) => list.filter((m) => m.id !== id))
    setThemeArt((art) =>
      Object.fromEntries(Object.entries(art).filter(([, v]) => v !== id))
    )
  }

  return (
    <div className="mt-5 grid gap-8">
      <section>
        <h3 className="text-[11px] font-extrabold tracking-[.16em] text-muted-foreground uppercase">
          Theme visuals
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Every theme has generated artwork. Pick an image to replace it for all
          sessions in that theme. A session can still override it.
        </p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {themes.map((t) => {
            const picked = media.find((m) => m.id === themeArt[t.id])
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border p-2.5"
              >
                <span
                  className="relative grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg text-white"
                  style={{ background: t.gradient }}
                >
                  {picked ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={picked.src}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <t.icon size={20} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{t.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {picked ? picked.name : "Gradient (auto)"}
                  </p>
                </div>
                <select
                  aria-label={`${t.label} artwork`}
                  value={themeArt[t.id] ?? ""}
                  onChange={(e) =>
                    setThemeArt((art) => {
                      const next = { ...art }
                      if (e.target.value) next[t.id] = e.target.value
                      else delete next[t.id]
                      return next
                    })
                  }
                  className="max-w-[9rem] rounded-lg border bg-white px-2 py-1.5 text-xs"
                >
                  <option value="">Gradient (auto)</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[11px] font-extrabold tracking-[.16em] text-muted-foreground uppercase">
            Event media library
          </h3>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            className="min-h-9"
          >
            <Upload size={15} />
            Upload media
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              void add(e.target.files)
              e.target.value = ""
            }}
          />
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        {media.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nothing uploaded, and nothing needed. Sessions look great with the
            generated artwork. Images are resized to 1600 px wide on upload.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m) => (
              <figure key={m.id} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.src}
                  alt={m.name}
                  className="aspect-video w-full rounded-xl border object-cover"
                />
                <figcaption className="mt-1 truncate text-xs text-muted-foreground">
                  {m.name}
                </figcaption>
                <button
                  onClick={() => remove(m.id)}
                  aria-label={`Delete ${m.name}`}
                  className="absolute top-1.5 right-1.5 rounded-lg bg-white/90 p-1.5 text-red-600 shadow hover:bg-white"
                >
                  <Trash2 size={14} />
                </button>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
