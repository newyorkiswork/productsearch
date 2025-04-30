import { getHumeAccessToken } from "@/utils/getHumeAccessToken"
import { unstable_noStore } from "next/cache"
import ChatClient from "./client"

// Mark this page as dynamic to prevent static optimization
export const dynamic = "force-dynamic"

// Use the edge runtime for better handling of API requests
export const runtime = "edge"

export default async function ChatPage() {
  // Prevent this page from being statically optimized
  unstable_noStore()

  try {
    const accessToken = await getHumeAccessToken()

    return <ChatClient accessToken={accessToken} />
  } catch (error) {
    console.error("Error getting Hume access token:", error)

    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-muted-foreground mb-4">
          Unable to connect to Hume AI. Please check your API keys and try again.
        </p>
      </div>
    )
  }
}
