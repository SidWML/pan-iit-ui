"use client"
import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

/* Shared operator page chrome (Admin + Coordinator): tinted header band,
   white KPI tiles, one colour = one meaning. No coloured glows. */

export type KpiTone = "blue" | "green" | "amber" | "red" | "purple" | "rose"
const palette: Record<KpiTone, [string, string]> = {
  blue: ["#0b57f5", "#e8efff"],
  green: ["#12a37a", "#e3f6ee"],
  amber: ["#e08e00", "#fff1d2"],
  red: ["#e5373b", "#fdefef"],
  purple: ["#7c5cfa", "#efe9ff"],
  rose: ["#c2255c", "#fdeaf1"],
}

export function KpiTile({
  label,
  value,
  icon: Icon,
  tone = "blue",
  alert = false,
  hint,
  onClick,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: KpiTone
  /** Needs action: solid icon, coloured edge and number. */
  alert?: boolean
  hint?: string
  onClick?: () => void
}) {
  const [c, soft] = palette[tone]
  const body = (
    <>
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={alert ? { background: c, color: "#fff" } : { background: soft, color: c }}
      >
        <Icon size={17} />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="num block text-[18px] font-semibold" style={{ color: alert ? c : "#0f1e4d" }}>
          {value}
        </span>
        <span className="block truncate text-[12px] whitespace-nowrap text-[#5e6a85]">
          {label}
          {hint && <span className="text-[#8a93ab]"> · {hint}</span>}
        </span>
      </span>
    </>
  )
  const cls =
    "flex h-14 shrink-0 items-center gap-3 rounded-xl border bg-white pr-4 pl-2.5 text-left shadow-[0_1px_2px_rgba(15,30,77,.06)]"
  const style = { borderColor: alert ? `${c}80` : "#e1e6ef", borderWidth: alert ? 1.5 : 1 }
  return onClick ? (
    <button onClick={onClick} className={`${cls} transition-colors hover:bg-[#fbfcff]`} style={style}>
      {body}
    </button>
  ) : (
    <div className={cls} style={style}>
      {body}
    </div>
  )
}

export function OpsHeader({
  eyebrow,
  eyebrowIcon: EIcon,
  title,
  description,
  actions,
  kpis,
  accent = "#0b57f5",
  tint = "linear-gradient(100deg, #fff3dc 0%, #eef3ff 55%, #ffffff 100%)",
  art,
}: {
  eyebrow: string
  eyebrowIcon?: LucideIcon
  title: string
  description?: ReactNode
  actions?: ReactNode
  kpis?: ReactNode
  accent?: string
  tint?: string
  art?: ReactNode
}) {
  return (
    <header className="relative overflow-hidden border-b border-[#e6eaf2]" style={{ background: tint }}>
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
      {art}
      <div className="relative flex flex-wrap items-end justify-between gap-3 px-4 pt-6 pb-4 md:px-6">
        <div className="min-w-0">
          <span
            className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[11.5px] font-semibold tracking-wide uppercase"
            style={{ color: accent, boxShadow: `inset 0 0 0 1px ${accent}33` }}
          >
            {EIcon && <EIcon size={12} />} {eyebrow}
          </span>
          <h1 className="mt-2 text-[24px] leading-tight font-semibold tracking-[-0.02em] text-[#0f1e4d] md:text-[28px]">
            {title}
          </h1>
          {description && <p className="mt-1 max-w-2xl text-[13.5px] text-[#5e6a85]">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {kpis && <div className="relative flex gap-2 overflow-x-auto px-4 pb-4 md:px-6">{kpis}</div>}
    </header>
  )
}

/** Page body wrapper under an OpsHeader. */
export function OpsBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1400px] px-3 py-4 md:px-6 md:py-5">{children}</div>
}

/** Section title inside a page body. */
export function SectionTitle({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
      <h2 className="text-[15px] font-semibold text-[#0f1e4d]">{title}</h2>
      {aside && <span className="text-[12.5px] text-[#6b7690]">{aside}</span>}
    </div>
  )
}

/** Table wrapper: white card with hairline border and a quiet header row. */
export const tableCls = "w-full text-left text-[13px]"
export const thCls = "px-3 py-2.5 text-[11.5px] font-semibold tracking-wide text-[#6b7690] uppercase first:pl-4 last:pr-4"
export const tdCls = "px-3 py-3 align-middle first:pl-4 last:pr-4"

export function TableCard({ children, toolbar }: { children: ReactNode; toolbar?: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e1e6ef] bg-white shadow-[0_1px_2px_rgba(15,30,77,.05)]">
      {toolbar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#eef1f6] bg-[#fbfcfe] px-3 py-2.5">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </section>
  )
}
