"use client"
import dynamic from "next/dynamic"

// Dynamically import the Chat component with SSR disabled
const ClientChat = dynamic(() => import("@/components/ClientChat"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4">Loading voice interface...</p>
      </div>
    </div>
  ),
})

export default function ChatClient({ accessToken }: { accessToken: string | null }) {
  return <ClientChat accessToken={accessToken} />
}
