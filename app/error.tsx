"use client"

import { useEffect, useState } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [errorDetails, setErrorDetails] = useState<string>("")

  useEffect(() => {
    // Log the error to console for debugging
    console.error("Application error:", error)

    // Extract more meaningful error information
    setErrorDetails(error.message || "Unknown error occurred")
  }, [error])

  return (
    <div className={"absolute inset-0 grid place-content-center"}>
      <div className={"text-center max-w-md p-6 bg-card border border-border rounded-lg shadow-lg"}>
        <h1 className={"text-xl font-bold mb-2"}>An unexpected error occurred</h1>
        <p className={"text-muted-foreground mb-4"}>{errorDetails || "Please try again later"}</p>
        <div className="text-sm text-muted-foreground mb-4">
          <p>Common issues:</p>
          <ul className="list-disc list-inside mt-2 text-left">
            <li>Microphone access denied</li>
            <li>Network connection issues</li>
            <li>API key configuration problems</li>
          </ul>
        </div>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
