"use client"

import { type ButtonHTMLAttributes, type ReactNode } from "react"

/* Operator design system (Admin + Coordinator): hairlines, not shadows;
   13–14px text; one accent colour. The attendee app has its own kit. */

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}) {
  const styles = {
    primary:
      "bg-[#0b57f5] text-white shadow-[0_1px_2px_rgba(11,87,245,.35),inset_0_1px_0_rgba(255,255,255,.12)] hover:bg-[#0a4ddb]",
    secondary:
      "border border-[#dfe4ee] bg-white text-[#1d2a4d] shadow-[0_1px_1px_rgba(15,30,77,.04)] hover:border-[#cdd5e3] hover:bg-[#f7f9fc]",
    ghost: "text-[#44506e] hover:bg-[#f1f4f9] hover:text-[#0f1e4d]",
    danger:
      "border border-[#f3cfd0] bg-white text-[#d4292f] hover:border-[#eab3b5] hover:bg-[#fdf3f3]",
  }
  const sizes = {
    sm: "h-8 gap-1.5 rounded-md px-2.5 text-[13px]",
    md: "h-9 gap-2 rounded-lg px-3.5 text-[13.5px]",
    lg: "h-11 gap-2 rounded-lg px-5 text-[15px]",
  }
  return (
    <button
      className={`inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-[color,background-color,border-color,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-45 ${sizes[size]} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-xl border border-[#e6eaf2] bg-white shadow-[0_1px_2px_rgba(15,30,77,.04)] ${className}`}
    >
      {children}
    </section>
  )
}

export type Tone = "blue" | "green" | "amber" | "red" | "gray" | "violet"
const toneStyles: Record<Tone, string> = {
  blue: "bg-[#eef3ff] text-[#1e4fd8] ring-[#d6e2ff]",
  green: "bg-[#ebf8f2] text-[#0d7a57] ring-[#cdeede]",
  amber: "bg-[#fff6e5] text-[#9a6100] ring-[#fbe3b4]",
  red: "bg-[#fdefef] text-[#c62828] ring-[#f7d2d2]",
  gray: "bg-[#f3f5f9] text-[#4a5572] ring-[#e3e7ef]",
  violet: "bg-[#f3efff] text-[#5b3fd6] ring-[#e2d9ff]",
}
export function Badge({
  children,
  tone = "blue",
  dot = true,
}: {
  children: ReactNode
  tone?: Tone
  dot?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] leading-5 font-medium whitespace-nowrap ring-1 ring-inset ${toneStyles[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="grid content-start gap-1.5 text-[13px] font-medium text-[#1d2a4d]">
      <span>{label}</span>
      {children}
      {hint && <span className="text-[12px] font-normal text-[#6b7690]">{hint}</span>}
    </label>
  )
}
export const inputStyle =
  "h-9 w-full rounded-lg border border-[#dfe4ee] bg-white px-3 text-[13.5px] text-[#0f1e4d] placeholder:text-[#9aa3ba] transition-[border-color,box-shadow] focus:border-[#0b57f5] focus:ring-3 focus:ring-[#0b57f5]/12 focus:outline-none"

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[12px] font-medium text-[#6b7690]">{eyebrow}</p>
        )}
        <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] text-[#0f1e4d] md:text-[24px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13.5px] text-[#5e6a85]">{description}</p>
        )}
      </div>
      {action}
    </header>
  )
}

export function Stat({
  label,
  value,
  icon,
  tone = "blue",
  hint,
}: {
  label: string
  value: string
  icon: ReactNode
  tone?: "blue" | "violet" | "amber" | "green"
  hint?: ReactNode
}) {
  const styles = {
    blue: "bg-[#eef3ff] text-[#1e4fd8]",
    violet: "bg-[#f3efff] text-[#5b3fd6]",
    amber: "bg-[#fff6e5] text-[#b27000]",
    green: "bg-[#ebf8f2] text-[#0d7a57]",
  }
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-[13px] text-[#5e6a85]">
        <span className={`grid h-7 w-7 place-items-center rounded-md ${styles[tone]}`}>
          {icon}
        </span>
        {label}
      </div>
      <div className="num mt-2.5 text-[26px] leading-none font-semibold tracking-tight text-[#0f1e4d]">
        {value}
      </div>
      {hint && <div className="mt-1.5 text-[12px] text-[#6b7690]">{hint}</div>}
    </Card>
  )
}

/** Compact segmented control used for filters and status. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  full = false,
}: {
  options: { id: T; label: ReactNode; count?: number }[]
  value: T
  onChange: (v: T) => void
  size?: "sm" | "md"
  /** Stretch to the container width with equal segments (form fields). */
  full?: boolean
}) {
  return (
    <div
      role="tablist"
      className={`${full ? "flex w-full" : "inline-flex max-w-full"} overflow-x-auto rounded-lg bg-[#eef1f6] p-0.5`}
    >
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-all ${full ? "flex-1" : ""} ${size === "sm" ? "h-7 px-2.5 text-[12.5px]" : "h-8 px-3 text-[13px]"} ${value === o.id ? "bg-white text-[#0f1e4d] shadow-[0_1px_3px_rgba(15,30,77,.12)]" : "text-[#5e6a85] hover:text-[#0f1e4d]"}`}
        >
          {o.label}
          {o.count !== undefined && (
            <span
              className={`num rounded px-1 text-[11.5px] ${value === o.id ? "bg-[#eef3ff] text-[#1e4fd8]" : "text-[#8a93ab]"}`}
            >
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-grid h-5 min-w-5 place-items-center rounded border border-[#dfe4ee] bg-white px-1 font-sans text-[11px] font-medium text-[#5e6a85] shadow-[0_1px_0_#dfe4ee]">
      {children}
    </kbd>
  )
}
