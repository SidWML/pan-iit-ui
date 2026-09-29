"use client"

import { X } from "lucide-react"
import { type ReactNode, useEffect } from "react"

/** Dialog. `side` renders it as a right-hand drawer, used for editing records. */
export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  wide = false,
  side = false,
  footer,
}: {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  wide?: boolean
  side?: boolean
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", close)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", close)
      document.body.style.overflow = prev
    }
  }, [open, onClose])
  if (!open) return null
  const header = (
    <header className="flex items-start justify-between gap-4 border-b border-[#eef1f6] px-5 py-4">
      <div className="min-w-0">
        <h2 id="dialog-title" className="text-[16px] font-semibold text-[#0f1e4d]">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-[13px] text-[#5e6a85]">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="-mr-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#5e6a85] hover:bg-[#f1f4f9]"
      >
        <X size={17} />
      </button>
    </header>
  )
  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0f1e4d]/30 backdrop-blur-[2px] ${side ? "" : "grid place-items-center overflow-y-auto p-4"}`}
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(e) => e.stopPropagation()}
        className={
          side
            ? `drawer-in absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-[-20px_0_60px_rgba(15,30,77,.18)] ${wide ? "max-w-2xl" : "max-w-lg"}`
            : `pop-in flex max-h-[calc(100svh-2rem)] w-full flex-col rounded-xl bg-white shadow-[0_24px_70px_rgba(15,30,77,.25)] ${wide ? "max-w-4xl" : "max-w-lg"}`
        }
      >
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-[#eef1f6] bg-[#fafbfd] px-5 py-3">
            {footer}
          </footer>
        )}
      </section>
    </div>
  )
}

export function downloadText(
  filename: string,
  contents: string,
  type = "text/plain"
) {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
