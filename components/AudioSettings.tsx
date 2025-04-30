"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { useAudioProcessor } from "@/utils/audioProcessor"

export default function AudioSettings() {
  const {
    noiseSuppressionEnabled,
    voiceIsolationEnabled,
    micSensitivity,
    vadThreshold,
    setNoiseSuppressionEnabled,
    setVoiceIsolationEnabled,
    setMicSensitivity,
    setVadThreshold,
  } = useAudioProcessor()

  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" title="Audio Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Audio Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-2">
          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="noise-suppression" className="text-sm">
              Noise Suppression
            </Label>
            <Switch
              id="noise-suppression"
              checked={noiseSuppressionEnabled}
              onCheckedChange={setNoiseSuppressionEnabled}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <Label htmlFor="voice-isolation" className="text-sm">
              Voice Isolation
            </Label>
            <Switch id="voice-isolation" checked={voiceIsolationEnabled} onCheckedChange={setVoiceIsolationEnabled} />
          </div>

          <div className="mb-4">
            <Label htmlFor="mic-sensitivity" className="text-sm block mb-2">
              Microphone Sensitivity: {Math.round(micSensitivity * 100)}%
            </Label>
            <Slider
              id="mic-sensitivity"
              min={0}
              max={1}
              step={0.05}
              value={[micSensitivity]}
              onValueChange={(values) => setMicSensitivity(values[0])}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="mb-2">
            <Label htmlFor="vad-threshold" className="text-sm block mb-2">
              Voice Detection Threshold: {Math.round(vadThreshold * 100)}%
            </Label>
            <Slider
              id="vad-threshold"
              min={0.05}
              max={0.5}
              step={0.01}
              value={[vadThreshold]}
              onValueChange={(values) => setVadThreshold(values[0])}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>More Sensitive</span>
              <span>Less Sensitive</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lower values detect quieter speech but may pick up more background noise
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
