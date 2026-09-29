const colors = ["#f7b500", "#0b57f5", "#7c66fc", "#12a37a", "#8fb3ff", "#ffd57a"]
// Deterministic so server and client markup match.
const pieces = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2
  const dist = 90 + ((i * 37) % 70)
  return {
    x: Math.round(Math.cos(angle) * dist),
    y: Math.round(Math.sin(angle) * dist - 40),
    r: (i * 53) % 360,
    d: (i % 5) * 0.04,
    c: colors[i % colors.length]!,
  }
})
export function Confetti() {
  return (
    <div className="confetti pointer-events-none absolute inset-0" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={
            {
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
              "--r": `${p.r}deg`,
              "--d": `${p.d}s`,
              "--c": p.c,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
