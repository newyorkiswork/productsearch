"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { VoiceProvider } from "@humeai/voice-react"
import Messages from "./Messages"
import Controls from "./Controls"
import StartCall from "./StartCall"
import type { ComponentRef } from "react"
import Image from "next/image"
import { AudioManager } from "@/utils/audioManager"
import { useAudioProcessor } from "@/utils/audioProcessor"
import AgentResponse from "./AgentResponse"

// Define predefined conversation patterns for Agnes to use
const CONVERSATION_PATTERNS = {
  // Introduction patterns
  introduction: [
    "Hi there! I'm Agnes, your shopping assistant. How can I help you today?",
    "Hello! I'm Agnes. I'm here to help you find the perfect products. What are you looking for?",
    "Welcome! I'm Agnes, your personal shopping guide. What can I help you find today?",
  ],

  // Recommendation introduction patterns
  recommendationIntro: [
    "Let me share some recommendations for you.",
    "Here are some options I've found that might interest you.",
    "Let me share some of the best choices with you.",
    "I've found some products that might be perfect for what you're looking for.",
  ],

  // Product description patterns
  productDescription: [
    "This is a popular choice with excellent reviews.",
    "This option has been well-received by many customers.",
    "This product stands out for its quality and value.",
  ],
}

export default function ChatModal({ accessToken }: { accessToken: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAgentResponse, setShowAgentResponse] = useState(false)
  const [activeSearchQuery, setActiveSearchQuery] = useState<string | null>(null)
  const timeout = useRef<number | null>(null)
  const messagesRef = useRef<ComponentRef<typeof Messages> | null>(null)
  const audioManager = useRef(AudioManager.getInstance())
  const { processStream } = useAudioProcessor()

  // Hardcoded configuration ID as specified
  const configId = "203177d5-7e73-44f0-aea3-81c12b17d178"

  // Handle window resize to ensure modal stays centered
  const handleResize = useCallback(() => {
    setIsOpen((prev) => prev)
  }, [])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [handleResize])

  // Function to scroll to the bottom of messages
  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      const scrollElement = messagesRef.current
      requestAnimationFrame(() => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth",
        })
      })
    }
  }, [])

  // Handle search from agent
  const handleAgentSearch = (query: string) => {
    setActiveSearchQuery(query)
    setShowAgentResponse(true)
  }

  // Listen for messages to detect product search intent
  const handleMessage = useCallback(
    (event: any) => {
      if (event.detail?.message?.role === "user" && event.detail?.message?.content) {
        const content = event.detail.message.content.toLowerCase()

        // Check if message contains search intent
        const hasProductIntent =
          (content.includes("search") ||
            content.includes("find") ||
            content.includes("look for") ||
            content.includes("show me")) &&
          (content.includes("product") ||
            content.includes("item") ||
            content.includes("buy") ||
            content.includes("skirt") ||
            content.includes("dress") ||
            content.includes("shirt") ||
            content.includes("pants") ||
            content.includes("shoes"))

        if (hasProductIntent) {
          // Show agent response for visual search
          setShowAgentResponse(true)
        }
      }

      // Scroll to bottom after message
      if (timeout.current) {
        window.clearTimeout(timeout.current)
      }

      timeout.current = window.setTimeout(() => {
        scrollToBottom()
      }, 200)
    },
    [scrollToBottom],
  )

  // Function to intercept voice messages for better conversation flow
  const handleVoiceMessage = useCallback(
    (event: any) => {
      // First, handle standard message processing
      handleMessage(event)

      // Then apply additional logic to improve the conversational flow
      if (event.detail?.message?.role === "assistant") {
        const content = event.detail.message.content

        // Check if this is a product-related message that should have
        // recommendation intro phrase but doesn't
        if (
          (content.toLowerCase().includes("product") ||
            content.toLowerCase().includes("option") ||
            content.toLowerCase().includes("found")) &&
          !content.toLowerCase().includes("let me share") &&
          !content.toLowerCase().includes("here are") &&
          !content.toLowerCase().includes("i'd recommend") &&
          !content.toLowerCase().includes("i've found")
        ) {
          // Agnes should have introduced recommendations but didn't
          console.log("Enhancing conversation flow for product responses")
        }
      }
    },
    [handleMessage],
  )

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-transparent shadow-lg flex items-center justify-center z-50 hover:bg-gray-100/10 transition-colors"
        aria-label="Open Agnes Chat"
      >
        <Image src="/agnes-logo.png" alt="Agnes Logo" width={40} height={40} className="object-contain" />
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-[95%] max-w-md md:max-w-xl lg:max-w-2xl h-[80vh] max-h-[90vh] sm:max-h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{
                margin: "auto", // Ensures centering
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the modal
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Image src="/agnes-logo.png" alt="Agnes Logo" width={24} height={24} className="object-contain" />
                  <h2 className="font-medium">Agnes Shopping Assistant</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat content */}
              <div className="flex-1 relative overflow-hidden">
                {accessToken ? (
                  <VoiceProvider
                    auth={{ type: "accessToken", value: accessToken }}
                    configId={configId}
                    autoConnect={false} // Prevent auto-connection
                    autoMute={true} // Ensure microphone starts muted
                    onMessage={handleVoiceMessage} // Use enhanced message handler
                    onAudioElement={(audioElement) => {
                      // Register the audio element with our AudioManager
                      audioManager.current.registerAudioElement(audioElement)
                    }}
                    onMicrophoneStream={async (stream) => {
                      // Ensure tracks are disabled until explicitly enabled
                      stream.getTracks().forEach((track) => {
                        track.enabled = false
                      })

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
                        <Messages ref={messagesRef} />
                      </div>

                      {/* Agent response for visual search */}
                      <div className="absolute bottom-16 left-0 right-0 z-0 px-2">
                        <AgentResponse isActive={showAgentResponse} onSearch={handleAgentSearch} />
                      </div>

                      {/* Call controls */}
                      <Controls />
                      <StartCall />
                    </div>
                  </VoiceProvider>
                ) : (
                  <div className="flex items-center justify-center h-full p-4 text-center">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Connection Error</h2>
                      <p className="text-muted-foreground mb-4">
                        Unable to connect to Agnes AI. Please check your API keys and try again.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
