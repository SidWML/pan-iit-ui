"use client"
import QRCode from "qrcode"
import { useEffect, useState } from "react"
import { Check, Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/primitives"
import { formatTime, type Session } from "@/components/shared/summit-data"

export function useOrigin() {
  const [origin, setOrigin] = useState("")
  useEffect(() => {
    const t = window.setTimeout(() => setOrigin(window.location.origin), 0)
    return () => window.clearTimeout(t)
  }, [])
  return origin
}

export function useQr(text: string, width = 480) {
  const [src, setSrc] = useState("")
  useEffect(() => {
    if (!text) return
    let alive = true
    QRCode.toDataURL(text, {
      margin: 1,
      width,
      errorCorrectionLevel: "M",
      color: { dark: "#0f1e4d", light: "#ffffff" },
    }).then((u) => alive && setSrc(u))
    return () => {
      alive = false
    }
  }, [text, width])
  return src
}

const wrap = (ctx: CanvasRenderingContext2D, text: string, max: number) => {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > max && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

/** Print-ready PNG for the hall screen, standees and seat cards (SES-01). */
async function downloadPoster(session: Session, url: string) {
  const qr = await QRCode.toDataURL(url, {
    margin: 0,
    width: 760,
    errorCorrectionLevel: "M",
    color: { dark: "#0f1e4d", light: "#ffffff" },
  })
  const img = new Image()
  img.src = qr
  await img.decode()
  const c = document.createElement("canvas")
  c.width = 1080
  c.height = 1440
  const ctx = c.getContext("2d")!
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = "#0b57f5"
  ctx.fillRect(0, 0, c.width, 14)
  ctx.textAlign = "center"
  ctx.fillStyle = "#5e6a85"
  ctx.font = "600 30px Inter, system-ui, sans-serif"
  ctx.fillText("PAN IIT AMARAVATI SUMMIT 2026", 540, 100)
  ctx.fillStyle = "#0f1e4d"
  ctx.font = "700 62px Inter, system-ui, sans-serif"
  const lines = wrap(ctx, session.title, 920)
  lines.forEach((l, i) => ctx.fillText(l, 540, 190 + i * 74))
  const top = 190 + lines.length * 74
  ctx.fillStyle = "#44506e"
  ctx.font = "500 32px Inter, system-ui, sans-serif"
  ctx.fillText(`${session.type} · ${formatTime(session.time).range} · ${session.venue}`, 540, top + 6)
  ctx.drawImage(img, 160, top + 50, 760, 760)
  ctx.fillStyle = "#0f1e4d"
  ctx.font = "700 40px Inter, system-ui, sans-serif"
  ctx.fillText("Scan to ask a question or share an idea", 540, top + 890)
  ctx.fillStyle = "#0b57f5"
  ctx.font = "600 34px Inter, system-ui, sans-serif"
  ctx.fillText(url.replace(/^https?:\/\//, ""), 540, top + 945)
  const a = document.createElement("a")
  a.href = c.toDataURL("image/png")
  a.download = `QR-${session.id}-${session.title.replace(/[^a-z0-9]+/gi, "-")}.png`
  a.click()
}

export function SessionQrPanel({ session }: { session: Session }) {
  const origin = useOrigin()
  const url = origin ? `${origin}/s/${session.id}` : ""
  const src = useQr(url)
  const [copied, setCopied] = useState(false)
  return (
    <div className="grid gap-3 sm:grid-cols-[148px_minmax(0,1fr)] sm:items-center">
      <div className="grid aspect-square w-[148px] place-items-center rounded-lg border border-[#e6eaf2] bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src ? <img src={src} alt={`QR code for ${session.title}`} className="h-full w-full" /> : null}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] text-[#5e6a85]">
          Show on the hall screen and seat cards. Attendees land straight on this session.
        </p>
        <div className="mt-2 flex h-9 items-center gap-1 rounded-lg border border-[#e6eaf2] bg-[#f7f9fc] pr-1 pl-3 text-[13px]">
          <span className="min-w-0 flex-1 truncate font-medium text-[#0f1e4d]">
            {url.replace(/^https?:\/\//, "")}
          </span>
          <button
            onClick={() => {
              void navigator.clipboard?.writeText(url)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            }}
            className="grid h-7 w-7 place-items-center rounded-md text-[#5e6a85] hover:bg-white"
            aria-label="Copy link"
            title="Copy link"
          >
            {copied ? <Check size={15} className="text-[#0d7a57]" /> : <Copy size={15} />}
          </button>
        </div>
        <Button
          variant="secondary"
          className="mt-2 w-full"
          disabled={!url}
          onClick={() => void downloadPoster(session, url)}
        >
          <Download size={15} /> Download print-ready QR
        </Button>
      </div>
    </div>
  )
}
