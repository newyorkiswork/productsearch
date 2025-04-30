"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"

interface AudioPlayerProps {
  duration: number
  timestamp: string
}

export default function AudioPlayer({ duration, timestamp }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  // Simulate playback progress
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= duration) {
            setIsPlaying(false)
            clearInterval(intervalRef.current!)
            return 0
          }
          return newProgress
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, duration])

  return (
    <div className="bg-primary-purple text-white rounded-lg p-3 mb-3 w-full max-w-md">
      <div className="flex items-center gap-3">
        <button onClick={togglePlayback} className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <div className="flex-1">
          <div className="relative h-8">
            {/* Audio waveform visualization */}
            <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" className="absolute inset-0">
              {Array.from({ length: 40 }).map((_, i) => {
                // Create a randomized waveform pattern
                const height = 4 + Math.random() * 20
                const width = 1.5
                const gap = 1
                const x = i * (width + gap)
                const y = (32 - height) / 2

                return <rect key={i} x={x} y={y} width={width} height={height} fill="white" opacity={0.7} rx={1} />
              })}
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-sm font-medium">{formatTime(progress)}</div>
          <div className="text-xs opacity-70">{timestamp}</div>
        </div>
      </div>
    </div>
  )
}
