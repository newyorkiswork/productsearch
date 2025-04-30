"use client"

import { VoiceProvider } from "@humeai/voice-react"
import Messages from "./Messages"
import Controls from "./Controls"
import StartCall from "./StartCall"
import { type ComponentRef, useRef, useState, useEffect } from "react"

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string
}) {
  const timeout = useRef<number | null>(null)
  const ref = useRef<ComponentRef<typeof Messages> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [configId, setConfigId] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Check for config ID in localStorage
    const savedConfigId = localStorage.getItem("humeConfigId")
    if (savedConfigId) {
      setConfigId(savedConfigId)
    } else {
      // Fall back to environment variable
      setConfigId(process.env.NEXT_PUBLIC_HUME_CONFIG_ID || undefined)
    }
  }, [])

  return (
    <div className={"relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"}>
      {error ? (
        <div className="absolute inset-0 grid place-content-center">
          <div className="bg-card p-6 rounded-lg border border-border max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => setError(null)}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <VoiceProvider
          auth={{ type: "accessToken", value: accessToken }}
          configId={configId}
          autoConnect={false} // Prevent auto-connection
          autoMute={true} // Ensure microphone starts muted
          onError={(err) => {
            console.error("Hume Voice error:", err)
            setError(`Error connecting to Hume: ${err.message || "Unknown error"}`)
          }}
          onMessage={() => {
            if (timeout.current) {
              window.clearTimeout(timeout.current)
            }

            timeout.current = window.setTimeout(() => {
              if (ref.current) {
                const scrollHeight = ref.current.scrollHeight

                ref.current.scrollTo({
                  top: scrollHeight,
                  behavior: "smooth",
                })
              }
            }, 200)
          }}
        >
          <Messages ref={ref} />
          <Controls />
          <StartCall />
        </VoiceProvider>
      )}
    </div>
  )
}

// Add Button component for the error state
const Button = ({ className, ...props }) => (
  <button
    className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 ${className}`}
    {...props}
  />
)
