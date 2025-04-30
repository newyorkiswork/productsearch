"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import the ChatModal component with SSR disabled
const ChatModal = dynamic(() => import("./ChatModal"), {
  ssr: false,
})

export function ClientAgnesChatButton() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch the access token on the client side
    async function fetchToken() {
      try {
        const response = await fetch("/api/hume-token")
        const data = await response.json()

        if (data.error) {
          console.error("Error fetching Hume token:", data.error)
          setAccessToken(null)
        } else {
          setAccessToken(data.accessToken)
        }
      } catch (error) {
        console.error("Failed to fetch Hume token:", error)
        setAccessToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [])

  // Don't render anything while loading to prevent hydration issues
  if (isLoading) return null

  return <ChatModal accessToken={accessToken} />
}
