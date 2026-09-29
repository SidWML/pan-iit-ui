import { Landmark } from "lucide-react"
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10">
        <Landmark size={20} />
      </span>
      {!compact && (
        <div className="leading-tight">
          <strong className="block text-sm">PAN IIT</strong>
          <span className="text-[10px] opacity-70">Amaravati Summit 2026</span>
        </div>
      )}
    </div>
  )
}
