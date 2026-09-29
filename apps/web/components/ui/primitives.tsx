"use client"

import { type ButtonHTMLAttributes, type ReactNode } from "react"

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
}) {
  const styles = {
    primary:
      "bg-primary text-white shadow-[0_8px_20px_rgba(7,52,108,.18)] hover:bg-[#0a4389] hover:shadow-[0_10px_24px_rgba(7,52,108,.24)]",
    secondary: "border bg-white text-primary hover:bg-secondary",
    ghost: "text-muted-foreground hover:bg-muted",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
  }
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-[color,background-color,box-shadow,transform] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
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
  return <section className={`soft-card ${className}`}>{children}</section>
}
export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode
  tone?: "blue" | "green" | "amber" | "red" | "gray"
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-slate-100 text-slate-600",
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-[#243650]">
      <span>{label}</span>
      {children}
    </label>
  )
}
export const inputStyle =
  "min-h-11 w-full rounded-lg border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500"

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-[11px] font-bold tracking-[.16em] text-blue-600 uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
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
}: {
  label: string
  value: string
  icon: ReactNode
  tone?: "blue" | "violet" | "amber" | "green"
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  }
  return (
    <Card className="flex items-center gap-3 p-4">
      <span
        className={`grid h-10 w-10 place-items-center rounded-lg ${styles[tone]}`}
      >
        {icon}
      </span>
      <div>
        <div className="num text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </Card>
  )
}
