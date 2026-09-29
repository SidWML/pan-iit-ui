"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ClipboardList,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { Brand } from "@/components/shared/brand"
import { Button, Card, Field, inputStyle } from "@/components/ui/primitives"

function AuthFrame({
  children,
  step,
}: {
  children: React.ReactNode
  step: number
}) {
  return (
    <div className="grid min-h-svh place-items-center bg-[radial-gradient(circle_at_top,#eaf2ff,#f7f9fc_45%)] p-4">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center text-[#082b58]">
          <Brand />
        </div>
        <Card className="p-6 md:p-8">
          {children}
          <div className="mt-7 flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full ${i <= step ? "w-7 bg-blue-600" : "w-2 bg-slate-200"}`}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
export function LoginScreen() {
  const router = useRouter()
  return (
    <AuthFrame step={1}>
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-extrabold">Welcome to the Summit</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to participate, share ideas and join live sessions.
        </p>
      </div>
      <div className="grid gap-3">
        <Button
          onClick={() => router.push("/profile/setup")}
          className="w-full bg-white !text-[#243650] ring-1 ring-border hover:!bg-slate-50"
        >
          <span className="text-lg font-bold text-blue-600">G</span>Continue
          with Google
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/profile/setup")}
          className="w-full"
        >
          <Mail size={17} />
          Continue with Email
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push("/profile/setup")}
          className="w-full"
        >
          <Phone size={17} />
          Continue with Mobile OTP
        </Button>
      </div>
      <div className="my-6 flex items-center gap-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        Explore demo by role
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => router.push("/app/home")}
          className="grid min-h-24 place-items-center rounded-lg border bg-white p-3 text-center transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <UserRound size={20} className="text-blue-700" />
          <span className="text-xs font-bold">Attendee</span>
        </button>
        <button
          onClick={() => router.push("/coordinator/sessions")}
          className="grid min-h-24 place-items-center rounded-lg border bg-white p-3 text-center transition-colors hover:border-emerald-300 hover:bg-emerald-50"
        >
          <ClipboardList size={20} className="text-emerald-700" />
          <span className="text-xs font-bold">Coordinator</span>
        </button>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="grid min-h-24 place-items-center rounded-lg border bg-white p-3 text-center transition-colors hover:border-amber-300 hover:bg-amber-50"
        >
          <ShieldCheck size={20} className="text-amber-700" />
          <span className="text-xs font-bold">Admin</span>
        </button>
      </div>
      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        By signing in, you agree to our Terms & Privacy Policy.
      </p>
    </AuthFrame>
  )
}
export function ProfileScreen() {
  const router = useRouter()
  return (
    <AuthFrame step={2}>
      <h1 className="text-2xl font-extrabold">Complete your profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Help us connect you with the right people and sessions.
      </p>
      <div className="mt-6 grid gap-4">
        <Field label="Name *">
          <input className={inputStyle} defaultValue="Arjun Mehta" />
        </Field>
        <Field label="Organisation *">
          <input className={inputStyle} defaultValue="ABC Technologies" />
        </Field>
        <Field label="Designation">
          <input className={inputStyle} defaultValue="Product Lead" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="IIT">
            <select className={inputStyle} defaultValue="Delhi">
              <option>Delhi</option>
              <option>Bombay</option>
              <option>Madras</option>
            </select>
          </Field>
          <Field label="Batch">
            <input className={inputStyle} defaultValue="2010" />
          </Field>
        </div>
        <Button onClick={() => router.push("/consent")} className="mt-2 w-full">
          Continue
        </Button>
      </div>
    </AuthFrame>
  )
}
export function ConsentScreen() {
  const router = useRouter()
  const [ok, setOk] = useState(true)
  return (
    <AuthFrame step={3}>
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-700">
        <ShieldCheck size={28} />
      </div>
      <h1 className="text-center text-2xl font-extrabold">Privacy & consent</h1>
      <p className="mt-3 text-center text-sm leading-6 text-muted-foreground">
        We use your data to enable participation in the Summit. Your contact
        details are never included in AI summaries.
      </p>
      <label className="mt-6 flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm">
        <input
          type="checkbox"
          checked={ok}
          onChange={(e) => setOk(e.target.checked)}
          className="mt-1"
        />
        I agree to the terms and privacy notice.
      </label>
      <Button
        disabled={!ok}
        onClick={() => router.push("/app/home")}
        className="mt-5 w-full"
      >
        Enter summit
      </Button>
    </AuthFrame>
  )
}
