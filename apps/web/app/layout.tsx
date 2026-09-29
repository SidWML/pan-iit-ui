import { Inter, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { cn } from "@workspace/ui/lib/utils"

export const metadata = {
  title: "PAN IIT Amaravati Summit 2026",
  description: "Ideas and audience engagement platform",
}

export const viewport = { themeColor: "#f6f8fd" }

// SF Pro is used where the OS ships it (iOS / macOS). It cannot be licensed
// for web embedding, so every other device falls back to Inter.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="min-h-svh bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
