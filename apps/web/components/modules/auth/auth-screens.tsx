"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Clock3,
  Info,
  Mail,
  MailCheck,
  MailWarning,
  Phone,
  UserRound,
} from "lucide-react"
import {
  BackButton,
  Illus,
  Logo,
  PrimaryButton,
  SessionMeta,
  SessionStatusPill,
} from "@/components/modules/attendee/kit"
import { PrivacyItems } from "@/components/modules/attendee/attendee-screens"
import {
  ME,
  ME_EMAIL,
  canJoin,
  themeById,
  useEventConfig,
  useProfile,
  useSessions,
} from "@/components/shared/summit-data"

const NEXT_KEY = "summit-next"
const safeGet = (k: string) => {
  try {
    return window.localStorage.getItem(k)
  } catch {
    return null
  }
}
const safeSet = (k: string, v: string | null) => {
  try {
    if (v === null) window.localStorage.removeItem(k)
    else window.localStorage.setItem(k, v)
  } catch {
    /* ignore */
  }
}

/** After sign-in: first-timers go through consent + profile, then to where they were headed (ACC-06). */
function useFinishLogin() {
  const router = useRouter()
  const [profile] = useProfile()
  return () => {
    if (profile?.consented && profile.name && profile.organisation) {
      const next = safeGet(NEXT_KEY) || "/app/home"
      safeSet(NEXT_KEY, null)
      router.push(next)
    } else router.push("/consent")
  }
}

function AuthFrame({
  children,
  back,
  skyline = true,
}: {
  children: ReactNode
  back?: boolean
  skyline?: boolean
}) {
  return (
    <div className="min-h-svh bg-[#e9edf5]">
      <div className="sunrise relative mx-auto flex min-h-svh max-w-md flex-col overflow-hidden px-6 pt-4 pb-40">
        {back && <BackButton />}
        <div className="mt-2">
          <Logo />
        </div>
        <div className="relative z-10 mt-8 flex-1">{children}</div>
        {skyline && (
          <Illus
            name="skyline-soft"
            priority
            className="absolute inset-x-0 bottom-0 w-full opacity-80"
          />
        )}
      </div>
    </div>
  )
}

const field =
  "min-h-13 w-full rounded-xl border border-[#dfe5f0] bg-white pr-4 pl-12 text-[16px] text-[#0f1e4d] placeholder:text-[#9aa3ba] focus:border-[#0b57f5] focus:outline-none"

function OptionButton({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-[#dfe5f0] bg-white px-4 text-left text-[16px] font-medium text-[#0f1e4d] transition-colors hover:border-[#b9ccf7] hover:bg-[#f7f9ff]"
    >
      {icon}
      <span className="flex-1">{children}</span>
      <ChevronRight size={20} className="text-[#0b57f5]" />
    </button>
  )
}

const GoogleG = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
    <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.2-4.7 3.2-8Z" />
    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8Z" />
    <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
  </svg>
)

/** Google / email / OTP options, shared by Login and the QR landing. */
function LoginOptions() {
  const router = useRouter()
  const [config] = useEventConfig()
  const finish = useFinishLogin()
  const { google, email, otp } = config.login
  const items = [
    google && (
      <OptionButton key="g" icon={<GoogleG />} onClick={finish}>
        Continue with Google
      </OptionButton>
    ),
    email && (
      <OptionButton
        key="e"
        icon={<Mail size={24} className="text-[#0b57f5]" />}
        onClick={() => router.push("/login/email")}
      >
        Get a login link via Email
      </OptionButton>
    ),
    otp && (
      <OptionButton
        key="o"
        icon={<Phone size={22} className="text-[#0b57f5]" />}
        onClick={() => router.push("/login/otp")}
      >
        Continue with Mobile OTP
      </OptionButton>
    ),
  ].filter(Boolean)
  return (
    <div className="grid gap-3">
      {items.map((item, i) => (
        <div key={i}>
          {i > 0 && (
            <div className="mb-3 flex items-center gap-3 text-[13px] text-[#8a93ab]">
              <span className="h-px flex-1 bg-[#e4e9f3]" />
              OR
              <span className="h-px flex-1 bg-[#e4e9f3]" />
            </div>
          )}
          {item}
        </div>
      ))}
      <p className="mt-2 text-center text-[13px] text-[#5e6a85]">
        By continuing, you agree to our{" "}
        <Link href="/privacy" className="font-medium text-[#0b57f5]">
          Privacy Notice
        </Link>
        .
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- */
export function LoginScreen() {
  return (
    <div className="min-h-svh bg-[#e9edf5]">
      <div className="sunrise relative mx-auto flex min-h-svh max-w-md flex-col overflow-hidden">
        <div className="px-6 pt-6">
          <Logo />
          <h1 className="font-display mt-10 text-[34px] leading-[1.08] text-[#0f1e4d]">
            A Brighter
            <br />
            Andhra Together
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-[#5e6a85]">
            Share ideas. Join the conversation.
            <br />
            Shape real impact.
          </p>
        </div>
        <Illus name="skyline-hero" priority className="mt-4 w-full" />
        <div className="relative z-10 -mt-8 flex-1 rounded-t-[28px] bg-white px-6 pt-7 pb-6 shadow-[0_-12px_40px_rgba(15,30,77,.08)]">
          <LoginOptions />
          <div className="mt-6 border-t border-[#eef1f6] pt-4 text-center text-[12px] text-[#8a93ab]">
            Demo · open as{" "}
            <Link href="/coordinator/sessions" className="font-semibold text-[#44506e]">
              Coordinator
            </Link>{" "}
            ·{" "}
            <Link href="/admin/dashboard" className="font-semibold text-[#44506e]">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- */
export function EmailLoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const valid = /^\S+@\S+\.\S+$/.test(email)
  return (
    <AuthFrame back>
      <h1 className="font-display text-center text-[28px] text-[#0f1e4d]">Login via Email</h1>
      <p className="mt-2 text-center text-[16px] leading-relaxed text-[#5e6a85]">
        We&apos;ll send you a secure login link to your email address.
      </p>
      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) router.push(`/login/check?email=${encodeURIComponent(email)}`)
        }}
      >
        <label className="mb-2 block text-[15px] font-semibold text-[#0f1e4d]" htmlFor="email">
          Email address
        </label>
        <div className="relative">
          <Mail size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#5e6a85]" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={field}
          />
        </div>
        <PrimaryButton type="submit" disabled={!valid} className="mt-4">
          Send Login Link <ArrowRight size={18} />
        </PrimaryButton>
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-white/70 p-3 text-[13px] text-[#5e6a85]">
          <Info size={16} /> The link will expire in 15 minutes.
        </p>
      </form>
    </AuthFrame>
  )
}

/* ---------------------------------------------------------------- */
export function CheckEmailScreen({ email }: { email: string }) {
  const finish = useFinishLogin()
  const [cooldown, setCooldown] = useState(0)
  useEffect(() => {
    if (!cooldown) return
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])
  return (
    <AuthFrame back>
      <div className="text-center">
        <span className="pop-in mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-[#dce7ff] text-[#0b57f5]">
          <MailCheck size={46} strokeWidth={1.6} />
        </span>
        <h1 className="font-display mt-6 text-[28px] text-[#0f1e4d]">Check Your Email</h1>
        <p className="mt-2 text-[16px] text-[#5e6a85]">We&apos;ve sent a login link to</p>
        <p className="mt-1 text-[16px] font-semibold break-all text-[#0f1e4d]">{email}</p>
        <p className="mx-auto mt-6 flex max-w-72 items-center justify-center gap-2 rounded-xl bg-white/80 p-3 text-[14px] text-[#44506e]">
          <Clock3 size={17} /> This link will expire in 15 minutes.
        </p>
        <p className="mt-6 text-[15px] text-[#5e6a85]">
          Didn&apos;t receive the email?{" "}
          <button
            disabled={cooldown > 0}
            onClick={() => setCooldown(30)}
            className="font-semibold text-[#0b57f5] disabled:text-[#8a93ab]"
          >
            {cooldown ? `Resend in ${cooldown}s` : "Resend"}
          </button>
        </p>
        <button
          onClick={finish}
          className="mt-8 text-[13px] text-[#8a93ab] underline underline-offset-4"
        >
          Demo: open the login link
        </button>
      </div>
    </AuthFrame>
  )
}

/* ---------------------------------------------------------------- */
export function LinkExpiredScreen() {
  const router = useRouter()
  return (
    <AuthFrame>
      <div className="text-center">
        <span className="mx-auto grid h-24 w-24 place-items-center rounded-[28px] bg-[#fff3d6] text-[#b27700]">
          <MailWarning size={46} strokeWidth={1.6} />
        </span>
        <h1 className="font-display mt-6 text-[28px] text-[#0f1e4d]">This link has expired</h1>
        <p className="mt-2 text-[16px] leading-relaxed text-[#5e6a85]">
          Login links work once and for 15 minutes. Request a new one to continue.
        </p>
        <PrimaryButton className="mt-8" onClick={() => router.push("/login/email")}>
          Send a New Link
        </PrimaryButton>
      </div>
    </AuthFrame>
  )
}

/* ---------------------------------------------------------------- */
export function OtpScreen() {
  const router = useRouter()
  const [config] = useEventConfig()
  const finish = useFinishLogin()
  const [mobile, setMobile] = useState("")
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState("")
  if (!config.login.otp)
    return (
      <AuthFrame back>
        <h1 className="font-display text-center text-[26px] text-[#0f1e4d]">
          Mobile login isn&apos;t available
        </h1>
        <p className="mt-2 text-center text-[16px] text-[#5e6a85]">
          Please continue with Google or an email link.
        </p>
        <PrimaryButton className="mt-8" onClick={() => router.push("/login")}>
          Back to Login
        </PrimaryButton>
      </AuthFrame>
    )
  return (
    <AuthFrame back>
      <h1 className="font-display text-center text-[28px] text-[#0f1e4d]">
        {sent ? "Enter the OTP" : "Login with Mobile"}
      </h1>
      <p className="mt-2 text-center text-[16px] text-[#5e6a85]">
        {sent ? `Sent to +91 ${mobile}` : "We'll send a 6-digit code by SMS."}
      </p>
      <form
        className="mt-8"
        onSubmit={(e) => {
          e.preventDefault()
          if (!sent && mobile.length === 10) setSent(true)
          else if (sent && otp.length === 6) finish()
        }}
      >
        {sent ? (
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="••••••"
            className="num min-h-14 w-full rounded-xl border border-[#dfe5f0] bg-white text-center text-[24px] tracking-[.5em] text-[#0f1e4d] focus:border-[#0b57f5] focus:outline-none"
          />
        ) : (
          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[16px] text-[#5e6a85]">
              +91
            </span>
            <input
              inputMode="numeric"
              autoComplete="tel-national"
              autoFocus
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Mobile number"
              className={`${field} pl-14`}
            />
          </div>
        )}
        <PrimaryButton
          type="submit"
          className="mt-4"
          disabled={sent ? otp.length !== 6 : mobile.length !== 10}
        >
          {sent ? "Verify & Continue" : "Send OTP"}
        </PrimaryButton>
      </form>
    </AuthFrame>
  )
}

/* ---------------------------------------------------------------- */
function Progress({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#dfe5f0]">
        <div
          className="h-full rounded-full bg-[#0b57f5] transition-[width] duration-500"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
      <span className="num text-[14px] text-[#44506e]">{step}/2</span>
    </div>
  )
}

/** ACC-05: consent comes first, is never pre-ticked, and must be accepted. */
export function ConsentScreen() {
  const router = useRouter()
  const [profile, setProfile] = useProfile()
  const [ok, setOk] = useState(false)
  return (
    <AuthFrame back>
      <Progress step={1} />
      <h1 className="font-display text-[28px] text-[#0f1e4d]">Data Usage Consent</h1>
      <div className="mt-3 space-y-3 text-[16px] leading-relaxed text-[#44506e]">
        <p>
          Your information will be used for the PAN IIT Amaravati Summit 2026 to enable your
          participation, moderation and reporting of summit outcomes.
        </p>
        <p>
          Other attendees never see your name. The data owner is as confirmed by PAN IIT. For
          more details, see our{" "}
          <Link href="/privacy" className="font-medium text-[#0b57f5]">
            Privacy Notice
          </Link>
          .
        </p>
      </div>
      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-[#dfe5f0] bg-white p-4 text-[15px] text-[#0f1e4d]">
        <input
          type="checkbox"
          checked={ok}
          onChange={(e) => setOk(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#0b57f5]"
        />
        <span>
          I have read and agree to the above and the{" "}
          <Link href="/privacy" className="text-[#0b57f5]">
            Privacy Notice
          </Link>
          .
        </span>
      </label>
      <PrimaryButton
        className="mt-5"
        disabled={!ok}
        onClick={() => {
          setProfile({
            name: profile?.name ?? "",
            organisation: profile?.organisation ?? "",
            email: profile?.email ?? ME_EMAIL,
            consented: true,
          })
          router.push("/profile/setup")
        }}
      >
        Continue <ArrowRight size={18} />
      </PrimaryButton>
    </AuthFrame>
  )
}

/** ACC-04: only Name and Organisation on first login. */
export function ProfileScreen({ edit = false }: { edit?: boolean }) {
  const [profile, , ready] = useProfile()
  if (!ready) return <AuthFrame back>{null}</AuthFrame>
  return <ProfileForm edit={edit} initialName={profile?.name ?? (edit ? ME : "")} initialOrg={profile?.organisation ?? ""} />
}

function ProfileForm({
  edit,
  initialName,
  initialOrg,
}: {
  edit: boolean
  initialName: string
  initialOrg: string
}) {
  const router = useRouter()
  const [profile, setProfile] = useProfile()
  const [name, setName] = useState(initialName)
  const [org, setOrg] = useState(initialOrg)
  const valid = name.trim() && org.trim()
  return (
    <AuthFrame back>
      {!edit && <Progress step={2} />}
      <h1 className="font-display text-[28px] text-[#0f1e4d]">
        {edit ? "Edit Profile" : "Complete Your Profile"}
      </h1>
      <p className="mt-1 text-[16px] text-[#5e6a85]">
        {edit ? "This is how coordinators see you." : "Just a few details to get started."}
      </p>
      <form
        className="mt-6 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          setProfile({
            email: profile?.email ?? ME_EMAIL,
            consented: true,
            name: name.trim(),
            organisation: org.trim(),
          })
          const next = edit ? "/app/home" : safeGet(NEXT_KEY) || "/app/home"
          safeSet(NEXT_KEY, null)
          router.push(next)
        }}
      >
        <label className="block">
          <span className="mb-2 block text-[15px] font-semibold text-[#0f1e4d]">Full Name</span>
          <div className="relative">
            <UserRound size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#5e6a85]" />
            <input
              autoFocus={!edit}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 80))}
              placeholder="Arjun Kumar"
              className={field}
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-[15px] font-semibold text-[#0f1e4d]">
            Organisation / Institution
          </span>
          <div className="relative">
            <Building2 size={20} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#5e6a85]" />
            <input
              autoComplete="organization"
              value={org}
              onChange={(e) => setOrg(e.target.value.slice(0, 120))}
              placeholder="IIT Madras"
              className={field}
            />
          </div>
        </label>
        <PrimaryButton type="submit" disabled={!valid} className="mt-1">
          {edit ? "Save" : "Continue"} {!edit && <ArrowRight size={18} />}
        </PrimaryButton>
      </form>
    </AuthFrame>
  )
}

/* ---------------------------------------------------------------- */
/** ACC-06: scanned a session QR. Show where they're going, then log in. */
export function QrLandingScreen({ id }: { id: string }) {
  const router = useRouter()
  const [sessions, , ready] = useSessions()
  const [profile] = useProfile()
  const session = sessions.find((s) => s.id.toLowerCase() === id.toLowerCase())
  const target = `/app/sessions/${session?.id ?? id}`
  useEffect(() => {
    safeSet(NEXT_KEY, target)
  }, [target])
  const t = themeById(session?.theme)
  const signedIn = profile?.consented && profile.name
  return (
    <AuthFrame skyline={false}>
      {session ? (
        <>
          <p className="text-[14px] font-semibold text-[#0b57f5]">You&apos;re joining</p>
          <div className="card-soft relative mt-3 overflow-hidden p-5">
            <Illus name="podium" className="absolute -right-4 -bottom-3 w-32 opacity-90" />
            <p className="text-[12px] font-semibold tracking-[.14em] uppercase" style={{ color: t.accent }}>
              {session.type}
              {session.theme !== "other" && ` · ${t.label}`}
            </p>
            <h1 className="font-display relative mt-1 max-w-[70%] text-[24px] leading-tight text-[#0f1e4d]">
              {session.title}
            </h1>
            <SessionMeta session={session} />
            <div className="mt-4">
              <SessionStatusPill session={session} locked={!canJoin(session)} />
            </div>
          </div>
          <div className="mt-6">
            {signedIn ? (
              <PrimaryButton onClick={() => router.push(target)}>
                Continue as {profile.name.split(" ")[0]} <ArrowRight size={18} />
              </PrimaryButton>
            ) : (
              <>
                <p className="mb-4 text-[16px] text-[#44506e]">
                  Log in to ask questions, share ideas and give opinions.
                </p>
                <LoginOptions />
              </>
            )}
          </div>
        </>
      ) : ready ? (
        <p className="text-[16px] text-[#5e6a85]">
          This QR code isn&apos;t linked to a session.{" "}
          <Link href="/login" className="text-[#0b57f5]">
            Go to login
          </Link>
        </p>
      ) : null}
    </AuthFrame>
  )
}

export function PublicPrivacyScreen() {
  return (
    <AuthFrame back skyline={false}>
      <h1 className="font-display mb-4 text-[28px] text-[#0f1e4d]">Privacy Notice</h1>
      <PrivacyItems />
    </AuthFrame>
  )
}
