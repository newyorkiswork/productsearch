"use client"

// Enhanced Audio Processor with robust noise cancellation
export class AudioProcessor {
  private static instance: AudioProcessor
  private audioContext: AudioContext | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private analyserNode: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private noiseSuppressionEnabled = true
  private voiceIsolationEnabled = true
  private micSensitivity = 0.75 // Default sensitivity (0-1)
  private vadThreshold = 0.15 // Voice Activity Detection threshold
  private initialized = false
  private processingActive = false
  private microphonePermissionGranted = false

  private constructor() {
    // Initialize is called separately to avoid constructor side effects
  }

  public static getInstance(): AudioProcessor {
    if (!AudioProcessor.instance) {
      AudioProcessor.instance = new AudioProcessor()
    }
    return AudioProcessor.instance
  }

  public async initialize(): Promise<boolean> {
    if (this.initialized) return true

    try {
      // Create audio context without requesting microphone access
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Load settings from localStorage if available
      this.loadSettings()

      this.initialized = true
      return true
    } catch (error) {
      console.error("Error initializing audio processor:", error)
      return false
    }
  }

  private loadSettings(): void {
    try {
      const savedNoiseSuppressionEnabled = localStorage.getItem("noiseSuppressionEnabled")
      if (savedNoiseSuppressionEnabled !== null) {
        this.noiseSuppressionEnabled = savedNoiseSuppressionEnabled === "true"
      }

      const savedVoiceIsolationEnabled = localStorage.getItem("voiceIsolationEnabled")
      if (savedVoiceIsolationEnabled !== null) {
        this.voiceIsolationEnabled = savedVoiceIsolationEnabled === "true"
      }

      const savedMicSensitivity = localStorage.getItem("micSensitivity")
      if (savedMicSensitivity !== null) {
        this.micSensitivity = Number.parseFloat(savedMicSensitivity)
      }

      const savedVadThreshold = localStorage.getItem("vadThreshold")
      if (savedVadThreshold !== null) {
        this.vadThreshold = Number.parseFloat(savedVadThreshold)
      }
    } catch (error) {
      console.error("Error loading audio settings:", error)
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem("noiseSuppressionEnabled", String(this.noiseSuppressionEnabled))
      localStorage.setItem("voiceIsolationEnabled", String(this.voiceIsolationEnabled))
      localStorage.setItem("micSensitivity", String(this.micSensitivity))
      localStorage.setItem("vadThreshold", String(this.vadThreshold))
    } catch (error) {
      console.error("Error saving audio settings:", error)
    }
  }

  public async processStream(originalStream: MediaStream): Promise<MediaStream> {
    try {
      if (!this.initialized) {
        await this.initialize()
      }

      if (!this.audioContext) {
        console.error("Audio context not initialized")
        return originalStream
      }

      // Cleanup previous stream if exists
      this.cleanup()

      // Store the original stream
      this.stream = originalStream
      this.microphonePermissionGranted = true

      // If processing is not active, return the original stream
      if (!this.processingActive) {
        // Stop all tracks to ensure microphone is not active
        originalStream.getTracks().forEach((track) => {
          track.enabled = false
        })
        return originalStream
      }

      // Create a new stream with enhanced noise suppression
      const processedStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Apply noise suppression if enabled
          noiseSuppression: this.noiseSuppressionEnabled,
          // Apply echo cancellation
          echoCancellation: true,
          // Apply auto gain control
          autoGainControl: true,
          // Apply voice isolation if supported and enabled
          ...(this.voiceIsolationEnabled && "sampleRate" in MediaTrackConstraints.prototype
            ? {
                sampleRate: 48000, // Higher sample rate for better voice isolation
                channelCount: 1, // Mono for better voice processing
                latency: 0.01, // Low latency
              }
            : {}),
        },
        video: false,
      })

      // Create source node from the processed stream
      this.sourceNode = this.audioContext.createMediaStreamSource(processedStream)

      // Create gain node for sensitivity control
      this.gainNode = this.audioContext.createGain()
      this.gainNode.gain.value = this.micSensitivity

      // Create analyser node for visualizations and VAD
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 1024
      this.analyserNode.smoothingTimeConstant = 0.5

      // Connect the nodes
      this.sourceNode.connect(this.gainNode)
      this.gainNode.connect(this.analyserNode)

      // Create a destination node to output to a new stream
      const destinationNode = this.audioContext.createMediaStreamDestination()
      this.analyserNode.connect(destinationNode)

      // Set up voice activity detection
      this.setupVoiceActivityDetection(destinationNode.stream)

      return destinationNode.stream
    } catch (error) {
      console.error("Error processing audio stream:", error)
      return originalStream
    }
  }

  private setupVoiceActivityDetection(stream: MediaStream): void {
    if (!this.analyserNode) return

    const bufferLength = this.analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Set up a periodic check for voice activity
    const checkVoiceActivity = () => {
      if (!this.analyserNode || !this.processingActive) return

      this.analyserNode.getByteFrequencyData(dataArray)

      // Calculate average energy in the voice frequency range (300Hz-3000Hz)
      // This is a simplified approach - a more sophisticated VAD would use more complex algorithms
      let sum = 0
      const voiceRangeStart = Math.floor((300 * bufferLength) / (this.audioContext?.sampleRate || 48000))
      const voiceRangeEnd = Math.floor((3000 * bufferLength) / (this.audioContext?.sampleRate || 48000))

      for (let i = voiceRangeStart; i < voiceRangeEnd; i++) {
        sum += dataArray[i]
      }

      const average = sum / (voiceRangeEnd - voiceRangeStart)
      const normalizedAverage = average / 255 // Normalize to 0-1

      // If the average energy is above the threshold, consider it speech
      const isSpeech = normalizedAverage > this.vadThreshold

      // Here we could implement additional logic based on voice activity
      // For example, temporarily boosting gain during speech or
      // implementing a noise gate that only passes audio during speech

      // Schedule the next check
      requestAnimationFrame(checkVoiceActivity)
    }

    // Start checking for voice activity
    checkVoiceActivity()
  }

  public startProcessing(): void {
    this.processingActive = true

    // If we already have a stream, reprocess it
    if (this.stream) {
      this.processStream(this.stream).catch((err) => console.error("Error reprocessing stream:", err))
    }
  }

  public stopProcessing(): void {
    this.processingActive = false

    // Disable all tracks to ensure microphone is turned off
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.enabled = false
      })
    }

    this.cleanup()
  }

  public setNoiseSuppressionEnabled(enabled: boolean): void {
    this.noiseSuppressionEnabled = enabled
    this.saveSettings()

    // Reapply settings if we're currently processing
    if (this.processingActive && this.stream) {
      this.processStream(this.stream).catch((err) => console.error("Error reapplying noise suppression:", err))
    }
  }

  public setVoiceIsolationEnabled(enabled: boolean): void {
    this.voiceIsolationEnabled = enabled
    this.saveSettings()

    // Reapply settings if we're currently processing
    if (this.processingActive && this.stream) {
      this.processStream(this.stream).catch((err) => console.error("Error reapplying voice isolation:", err))
    }
  }

  public setMicSensitivity(sensitivity: number): void {
    // Clamp sensitivity between 0 and 1
    this.micSensitivity = Math.max(0, Math.min(1, sensitivity))

    // Update gain node if it exists
    if (this.gainNode) {
      this.gainNode.gain.value = this.micSensitivity
    }

    this.saveSettings()
  }

  public setVadThreshold(threshold: number): void {
    // Clamp threshold between 0 and 1
    this.vadThreshold = Math.max(0, Math.min(1, threshold))
    this.saveSettings()
  }

  public isNoiseSuppressionEnabled(): boolean {
    return this.noiseSuppressionEnabled
  }

  public isVoiceIsolationEnabled(): boolean {
    return this.voiceIsolationEnabled
  }

  public getMicSensitivity(): number {
    return this.micSensitivity
  }

  public getVadThreshold(): number {
    return this.vadThreshold
  }

  public isProcessingActive(): boolean {
    return this.processingActive
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode
  }

  public cleanup(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect()
      this.analyserNode = null
    }
  }

  public dispose(): void {
    this.cleanup()

    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.enabled = false
        track.stop()
      })
      this.stream = null
    }

    if (this.audioContext) {
      this.audioContext.close().catch((err) => console.error("Error closing audio context:", err))
      this.audioContext = null
    }

    this.initialized = false
    this.processingActive = false
    this.microphonePermissionGranted = false
  }

  public hasMicrophonePermission(): boolean {
    return this.microphonePermissionGranted
  }
}

// Hook for components to use the AudioProcessor
import { useEffect, useState } from "react"

export function useAudioProcessor() {
  const [audioProcessor] = useState(() => AudioProcessor.getInstance())
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(audioProcessor.isNoiseSuppressionEnabled())
  const [voiceIsolationEnabled, setVoiceIsolationEnabled] = useState(audioProcessor.isVoiceIsolationEnabled())
  const [micSensitivity, setMicSensitivity] = useState(audioProcessor.getMicSensitivity())
  const [vadThreshold, setVadThreshold] = useState(audioProcessor.getVadThreshold())
  const [processingActive, setProcessingActive] = useState(audioProcessor.isProcessingActive())

  useEffect(() => {
    // Initialize the audio processor without requesting microphone access
    audioProcessor.initialize().catch((error) => {
      console.error("Error initializing audio processor:", error)
    })

    return () => {
      // Clean up audio processor resources
      audioProcessor.dispose()
    }
  }, [audioProcessor])

  const updateNoiseSuppressionEnabled = (enabled: boolean) => {
    audioProcessor.setNoiseSuppressionEnabled(enabled)
    setNoiseSuppressionEnabled(enabled)
  }

  const updateVoiceIsolationEnabled = (enabled: boolean) => {
    audioProcessor.setVoiceIsolationEnabled(enabled)
    setVoiceIsolationEnabled(enabled)
  }

  const updateMicSensitivity = (sensitivity: number) => {
    audioProcessor.setMicSensitivity(sensitivity)
    setMicSensitivity(sensitivity)
  }

  const updateVadThreshold = (threshold: number) => {
    audioProcessor.setVadThreshold(threshold)
    setVadThreshold(threshold)
  }

  const startProcessing = () => {
    audioProcessor.startProcessing()
    setProcessingActive(true)
  }

  const stopProcessing = () => {
    audioProcessor.stopProcessing()
    setProcessingActive(false)
  }

  return {
    processStream: audioProcessor.processStream.bind(audioProcessor),
    noiseSuppressionEnabled,
    voiceIsolationEnabled,
    micSensitivity,
    vadThreshold,
    processingActive,
    setNoiseSuppressionEnabled: updateNoiseSuppressionEnabled,
    setVoiceIsolationEnabled: updateVoiceIsolationEnabled,
    setMicSensitivity: updateMicSensitivity,
    setVadThreshold: updateVadThreshold,
    startProcessing,
    stopProcessing,
    getAnalyserNode: audioProcessor.getAnalyserNode.bind(audioProcessor),
    hasMicrophonePermission: audioProcessor.hasMicrophonePermission.bind(audioProcessor),
  }
}
