"use client"
export function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#10213d] px-4 py-3 text-sm font-medium text-white shadow-xl"
    >
      {message}
    </div>
  )
}
