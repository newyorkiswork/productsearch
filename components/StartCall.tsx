"use client"

import { useVoice } from "@humeai/voice-react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "./ui/button"
import { Mic } from "lucide-react"
import { useState } from "react"
import { useAudioProcessor } from "@/utils/audioProcessor"

export default function StartCall() {
  const { status, connect, microphoneStream } = useVoice()
  const [isConnecting, setIsConnecting] = useState(false)
  const { startProcessing } = useAudioProcessor()

  // Hardcoded configuration ID as specified
  const configId = "203177d5-7e73-44f0-aea3-81c12b17d178"

  const handleStartCall = async () => {
    setIsConnecting(true)
    try {
      // Start audio processing before connecting
      startProcessing()

      // Connect to the voice service
      await connect({ configId })

      // Enable microphone tracks after connection is established
      if (microphoneStream) {
        microphoneStream.getTracks().forEach((track) => {
          track.enabled = true
        })
      }
    } catch (error) {
      console.error("Connection error:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className={"absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10"}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <AnimatePresence>
            <motion.div
              variants={{
                initial: { scale: 0.5 },
                enter: { scale: 1 },
                exit: { scale: 0.5 },
              }}
              className="text-center p-4 sm:p-6 bg-card rounded-lg shadow-sm max-w-[90%]"
            >
              <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Talk to Agnes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to start a call. This will activate your microphone.
              </p>
              <Button
                className={"flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9"}
                onClick={handleStartCall}
                disabled={isConnecting}
              >
                <span>
                  {isConnecting ? (
                    <span className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Mic className={"h-3 w-3 sm:h-4 sm:w-4 opacity-50"} strokeWidth={2} stroke={"currentColor"} />
                  )}
                </span>
                <span>{isConnecting ? "Connecting..." : "Start Call"}</span>
              </Button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
