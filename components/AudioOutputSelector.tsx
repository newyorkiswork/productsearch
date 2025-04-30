"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Headphones } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useAudioManager } from "@/utils/audioManager"

export default function AudioOutputSelector() {
  const { devices, preferredDeviceId, setPreferredDevice, isBluetoothConnected } = useAudioManager()
  const [isSupported, setIsSupported] = useState(true)

  // Check if the browser supports audio output selection
  useEffect(() => {
    // Check if the browser supports the Audio Output Devices API
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      setIsSupported(false)
    }
  }, [])

  // If the browser doesn't support output selection or we have no devices, don't render
  if (!isSupported || devices.length <= 1) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 relative ${isBluetoothConnected ? "text-blue-500" : ""}`}
          title="Select audio output"
        >
          <Headphones className="h-4 w-4" />
          {isBluetoothConnected && <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Audio Output</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {devices.map((device) => (
          <DropdownMenuItem
            key={device.deviceId}
            className={preferredDeviceId === device.deviceId ? "bg-accent" : ""}
            onClick={() => setPreferredDevice(device.deviceId)}
          >
            {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
            {device.label.toLowerCase().includes("bluetooth") && " 🔵"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
