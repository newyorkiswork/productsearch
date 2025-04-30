export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Voice Product Search</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Click the floating button to start searching for products with your voice.
      </p>

      {/* Voice Search Button - client component will handle token fetching */}
      <ClientAgnesChatButton />
    </div>
  )
}

// Client component to handle token fetching
import { ClientAgnesChatButton } from "@/components/ClientAgnesChatButton"
