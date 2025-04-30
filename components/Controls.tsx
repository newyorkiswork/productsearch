"use client"
import { useVoice } from "@humeai/voice-react"
import { Button } from "./ui/button"
import { Mic, MicOff, Phone } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Toggle } from "./ui/toggle"
import MicFFT from "./MicFFT"
import { cn } from "@/utils"
import AudioOutputSelector from "./AudioOutputSelector"
import AudioSettings from "./AudioSettings"
import { useAudioProcessor } from "@/utils/audioProcessor"

export default function Controls() {
  const { disconnect, status, isMuted, unmute, mute, micFft, microphoneStream } = useVoice()
  const { stopProcessing } = useAudioProcessor()

  const handleEndCall = () => {
    // Disable microphone tracks
    if (microphoneStream) {
      microphoneStream.getTracks().forEach((track) => {
        track.enabled = false
      })
    }

    // Stop audio processing when call ends
    stopProcessing()

    // Disconnect from the voice service
    disconnect()
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      // Enable microphone tracks when unmuting
      if (microphoneStream) {
        microphoneStream.getTracks().forEach((track) => {
          track.enabled = true
        })
      }
      unmute()
    } else {
      // Disable microphone tracks when muting
      if (microphoneStream) {
        microphoneStream.getTracks().forEach((track) => {
          track.enabled = false
        })
      }
      mute()
    }
  }

  return (
    <div
      className={cn(
        "border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3 flex items-center justify-center sticky bottom-0 left-0 right-0",
        "bg-gray-50 dark:bg-gray-800 z-10",
      )}
    >
      <AnimatePresence>
        {status.value === "connected" ? (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className={"flex items-center gap-1 sm:gap-2 w-full justify-between px-1 sm:px-2"}
          >
            <Toggle
              pressed={!isMuted}
              onPressedChange={handleMuteToggle}
              className={`shrink-0 h-8 w-8 sm:h-9 sm:w-9 ${
                isMuted ? "bg-gray-200 dark:bg-gray-700" : "bg-green-100 dark:bg-green-900"
              }`}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? (
                <MicOff className={"h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400"} />
              ) : (
                <Mic className={"h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400"} />
              )}
            </Toggle>

            <div className="flex items-center gap-1 sm:gap-2 flex-1">
              <div
                className={`relative grid h-6 sm:h-8 w-full max-w-[80px] sm:max-w-[120px] md:max-w-[160px] ${
                  isMuted ? "opacity-30" : "opacity-100"
                }`}
              >
                <MicFFT fft={isMuted ? new Array(24).fill(0) : micFft} className={"fill-current"} />
              </div>
              <AudioSettings />
              <AudioOutputSelector />
            </div>

            <Button
              className={"flex items-center gap-1 shrink-0 text-xs sm:text-sm h-8 sm:h-9"}
              onClick={handleEndCall}
              variant={"destructive"}
              size="sm"
            >
              <span>
                <Phone className={"h-3 w-3 sm:h-4 sm:w-4 opacity-50"} strokeWidth={2} stroke={"currentColor"} />
              </span>
              <span>End Call</span>
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
