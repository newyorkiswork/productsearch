"use client"

import { VoiceProvider } from "@humeai/voice-react"
import Messages from "./Messages"
import Controls from "./Controls"
import StartCall from "./StartCall"
import ShoppingAssistant from "./ShoppingAssistant"
import { type ComponentRef, useRef, useState } from "react"
import { useAudioProcessor } from "@/utils/audioProcessor"

export default function ClientChat({
  accessToken,
}: {
  accessToken: string | null
}) {
  const timeout = useRef<number | null>(null)
  const ref = useRef<ComponentRef<typeof Messages> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { processStream } = useAudioProcessor()

  // Hardcoded configuration ID as specified
  const configId = "203177d5-7e73-44f0-aea3-81c12b17d178"

  if (!accessToken) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-muted-foreground mb-4">
          Unable to connect to Agnes AI. Please check your API keys and try again.
        </p>
      </div>
    )
  }

  return (
    <div className={"relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"}>
      {error ? (
        <div className="absolute inset-0 grid place-content-center">
          <div className="bg-card p-6 rounded-lg border border-border max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => setError(null)}
            >
              Retry
            </button>
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
            setError(`Error connecting to Agnes AI: ${err.message || "Unknown error"}`)
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
          onAudioElement={(audioElement) => {
            // Try to set the audio output to the preferred device if available
            const preferredOutput = localStorage.getItem("preferredAudioOutput")
            if (preferredOutput && audioElement.setSinkId) {
              audioElement.setSinkId(preferredOutput).catch((err) => {
                console.error("Error setting initial audio output device:", err)
              })
            }
          }}
          onMicrophoneStream={async (stream) => {
            // Ensure tracks are disabled until explicitly enabled
            stream.getTracks().forEach((track) => {
              track.enabled = false
            })

            // Process the microphone stream with noise cancellation
            return await processStream(stream)
          }}
          // Prevent automatic microphone access
          microphoneOptions={{
            autoGainControl: false,
            echoCancellation: true,
            noiseSuppression: true,
          }}
        >
          <div className="h-full flex flex-col relative">
            {/* Messages component to handle the conversation - increased height */}
            <div className="flex-1 overflow-hidden">
              <Messages ref={ref} />
            </div>

            {/* Shopping Assistant for showing product results */}
            <div className="absolute bottom-16 left-0 right-0 z-0">
              <ShoppingAssistant />
            </div>

            {/* Call controls */}
            <Controls />
            <StartCall />
          </div>
        </VoiceProvider>
      )}
    </div>
  )
}
