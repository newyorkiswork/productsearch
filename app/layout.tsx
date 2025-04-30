import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Nav } from "@/components/Nav"
import { cn } from "@/utils"

// Initialize Poppins font with the weights we need
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Hume AI - EVI - Next.js Starter",
  description: "A Next.js starter using Hume AI's Empathic Voice Interface",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn(poppins.variable, "flex flex-col min-h-screen font-sans")}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
