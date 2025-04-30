"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Dynamically import the ChatModal component with SSR disabled
const ChatModal = dynamic(() => import("./ChatModal"), {
  ssr: false,
})

export default function AgnesChatButton({ accessToken }: { accessToken: string | null }) {
  const [isMounted, setIsMounted] = useState(false)

  // Wait until component is mounted to render the chat modal
  // This ensures we don't get hydration errors
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return <ChatModal accessToken={accessToken} />
}
