"use client"

// Audio Manager for handling audio output devices
export class AudioManager {
  private static instance: AudioManager
  private preferredDeviceId: string | null = null
  private audioElements: Set<HTMLAudioElement> = new Set()
  private deviceChangeListeners: Set<() => void> = new Set()
  private availableDevices: MediaDeviceInfo[] = []
  private isBluetoothConnected = false

  private constructor() {
    // Load preferred device from localStorage
    this.preferredDeviceId = localStorage.getItem("preferredAudioOutput")

    // Initialize device detection
    this.initDeviceDetection()

    // Listen for device changes
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", this.handleDeviceChange.bind(this))
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  // Initialize device detection
  private async initDeviceDetection(): Promise<void> {
    try {
      // Request permission to access devices (may be needed for some browsers)
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Get available devices
      await this.updateAvailableDevices()
    } catch (error) {
      console.error("Error initializing audio device detection:", error)
    }
  }

  // Update the list of available audio output devices
  private async updateAvailableDevices(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      this.availableDevices = devices.filter((device) => device.kind === "audiooutput")

      // Check if Bluetooth device is connected
      const bluetoothDevice = this.availableDevices.find(
        (device) =>
          device.label.toLowerCase().includes("bluetooth") ||
          device.label.toLowerCase().includes("airpods") ||
          device.label.toLowerCase().includes("wireless"),
      )

      this.isBluetoothConnected = !!bluetoothDevice

      // If Bluetooth is connected and we don't have a preferred device or the preferred device isn't available,
      // set the Bluetooth device as preferred
      if (this.isBluetoothConnected && bluetoothDevice) {
        const currentDeviceStillAvailable = this.availableDevices.some(
          (device) => device.deviceId === this.preferredDeviceId,
        )

        if (!this.preferredDeviceId || !currentDeviceStillAvailable) {
          this.preferredDeviceId = bluetoothDevice.deviceId
          localStorage.setItem("preferredAudioOutput", bluetoothDevice.deviceId)
          console.log("Automatically selected Bluetooth device:", bluetoothDevice.label)
        }
      }

      // Notify listeners of device change
      this.notifyDeviceChangeListeners()

      // Apply the current preferred device to all registered audio elements
      this.applyPreferredDeviceToAll()
    } catch (error) {
      console.error("Error updating available audio devices:", error)
    }
  }

  // Handle device change events
  private async handleDeviceChange(): Promise<void> {
    await this.updateAvailableDevices()
  }

  // Register an audio element to be managed
  public registerAudioElement(audioElement: HTMLAudioElement): void {
    this.audioElements.add(audioElement)

    // Apply preferred device if available
    if (this.preferredDeviceId) {
      this.setAudioOutputDevice(audioElement, this.preferredDeviceId).catch((err) =>
        console.error("Error setting audio output device:", err),
      )
    }
  }

  // Unregister an audio element
  public unregisterAudioElement(audioElement: HTMLAudioElement): void {
    this.audioElements.delete(audioElement)
  }

  // Set the audio output device for a specific audio element
  private async setAudioOutputDevice(audioElement: HTMLAudioElement, deviceId: string): Promise<void> {
    if (!audioElement.setSinkId) {
      console.warn("setSinkId is not supported in this browser")
      return
    }

    try {
      await audioElement.setSinkId(deviceId)
    } catch (error) {
      console.error("Error setting audio output device:", error)
      throw error
    }
  }

  // Apply the preferred device to all registered audio elements
  private async applyPreferredDeviceToAll(): Promise<void> {
    if (!this.preferredDeviceId) return

    const promises = Array.from(this.audioElements).map((audioElement) =>
      this.setAudioOutputDevice(audioElement, this.preferredDeviceId!).catch((err) =>
        console.error("Error applying preferred device:", err),
      ),
    )

    await Promise.all(promises)
  }

  // Set the preferred audio output device
  public async setPreferredDevice(deviceId: string): Promise<void> {
    this.preferredDeviceId = deviceId
    localStorage.setItem("preferredAudioOutput", deviceId)
    await this.applyPreferredDeviceToAll()
    this.notifyDeviceChangeListeners()
  }

  // Get the current preferred device ID
  public getPreferredDeviceId(): string | null {
    return this.preferredDeviceId
  }

  // Get all available audio output devices
  public getAvailableDevices(): MediaDeviceInfo[] {
    return [...this.availableDevices]
  }

  // Check if a Bluetooth device is connected
  public isBluetoothDeviceConnected(): boolean {
    return this.isBluetoothConnected
  }

  // Add a listener for device changes
  public addDeviceChangeListener(listener: () => void): void {
    this.deviceChangeListeners.add(listener)
  }

  // Remove a device change listener
  public removeDeviceChangeListener(listener: () => void): void {
    this.deviceChangeListeners.delete(listener)
  }

  // Notify all device change listeners
  private notifyDeviceChangeListeners(): void {
    this.deviceChangeListeners.forEach((listener) => listener())
  }
}

// Helper hook for components to use the AudioManager
import { useEffect, useState } from "react"

export function useAudioManager() {
  const [audioManager] = useState(() => AudioManager.getInstance())
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [preferredDeviceId, setPreferredDeviceId] = useState<string | null>(null)
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false)

  useEffect(() => {
    // Update state with current values
    setDevices(audioManager.getAvailableDevices())
    setPreferredDeviceId(audioManager.getPreferredDeviceId())
    setIsBluetoothConnected(audioManager.isBluetoothDeviceConnected())

    // Listen for device changes
    const handleDeviceChange = () => {
      setDevices(audioManager.getAvailableDevices())
      setPreferredDeviceId(audioManager.getPreferredDeviceId())
      setIsBluetoothConnected(audioManager.isBluetoothDeviceConnected())
    }

    audioManager.addDeviceChangeListener(handleDeviceChange)

    return () => {
      audioManager.removeDeviceChangeListener(handleDeviceChange)
    }
  }, [audioManager])

  return {
    devices,
    preferredDeviceId,
    isBluetoothConnected,
    setPreferredDevice: audioManager.setPreferredDevice.bind(audioManager),
    registerAudioElement: audioManager.registerAudioElement.bind(audioManager),
    unregisterAudioElement: audioManager.unregisterAudioElement.bind(audioManager),
  }
}
