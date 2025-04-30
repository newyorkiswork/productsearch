"use client"

import { useState, useEffect, useRef } from "react"
import { useVoice } from "@humeai/voice-react"
import type { ProductSearchResult, CartItem, ShoppingSearchResponse } from "@/types/product-search"
import { searchProducts } from "@/utils/product-search"
import ShoppingCart from "./ShoppingCart"
import ProductRecommendationsDisplay from "./ProductRecommendationsDisplay"
import AllRecommendations from "./AllRecommendations"
import AudioPlayer from "./AudioPlayer"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag } from "lucide-react"

type ShoppingState = "initial" | "search_prompt" | "searching" | "results" | "cart" | "all_recommendations"

export default function ShoppingAssistant() {
  const { status, messages } = useVoice()
  const [shoppingState, setShoppingState] = useState<ShoppingState>("initial")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<ShoppingSearchResponse | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const messageProcessedRef = useRef(false)
  const [showProductUI, setShowProductUI] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [activeSearch, setActiveSearch] = useState(false)

  // Listen for voice messages and process them based on the current state
  useEffect(() => {
    if (status.value === "connected" && shoppingState === "initial") {
      // Wait a moment before showing the product UI
      const timer = setTimeout(() => {
        setShowProductUI(true)
        setShoppingState("search_prompt")
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [status.value, shoppingState])

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      setCurrentTime(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  // Extract search queries from messages
  useEffect(() => {
    if (messages.length > 0 && !activeSearch) {
      // Look for messages that might contain product search queries
      for (let i = messages.length - 1; i >= Math.max(0, messages.length - 3); i--) {
        const msg = messages[i]
        if (msg.type === "user_message") {
          const content = msg.message.content.toLowerCase()

          // Check if message contains search intent
          if (
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
          ) {
            // Extract the search query
            const query = msg.message.content

            // Extract the query using regex patterns
            const searchPatterns = [
              /search for (.*)/i,
              /find (.*)/i,
              /look for (.*)/i,
              /show me (.*)/i,
              /can you (find|search|show) (.*)/i,
            ]

            for (const pattern of searchPatterns) {
              const match = query.match(pattern)
              if (match && match[1]) {
                const extractedQuery = match[match.length - 1].trim()
                setSearchQuery(extractedQuery)
                setActiveSearch(true)
                processUserMessage(extractedQuery)
                break
              }
            }

            if (activeSearch) break
          }
        }
      }
    }
  }, [messages, activeSearch])

  // Process user message for product search
  const processUserMessage = async (message: string) => {
    if (isProcessing) return

    setIsProcessing(true)
    setError(null)
    setIsLoading(true)
    setShowAudioPlayer(true)
    setShoppingState("searching")

    try {
      const results = await searchProducts(message)
      setSearchResults(results)

      if (results.error) {
        console.error("Search error:", results.error)
        setError(results.error)
        setShoppingState("search_prompt")
        setActiveSearch(false)
      } else if (!results.shopping_results || results.shopping_results.length === 0) {
        console.log("No results found")
        setError("No products found. Please try a different search.")
        setShoppingState("search_prompt")
        setActiveSearch(false)
      } else {
        setShoppingState("results")
      }
    } catch (error) {
      console.error("Search error:", error)
      setError("Failed to search for products. Please try again.")
      setShoppingState("search_prompt")
      setActiveSearch(false)
    } finally {
      setIsLoading(false)
      setIsProcessing(false)
    }
  }

  // Handle adding product to cart
  const handleAddToCart = (product: ProductSearchResult) => {
    setCartItems((prevItems) => {
      // Check if product is already in cart
      const existingItemIndex = prevItems.findIndex((item) => item.link === product.link)

      if (existingItemIndex >= 0) {
        // Increment quantity if already in cart
        const newItems = [...prevItems]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1,
        }
        return newItems
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })
  }

  // Handle viewing all recommendations
  const handleViewAllRecommendations = () => {
    setShoppingState("all_recommendations")
  }

  // Reset search
  const resetSearch = () => {
    setActiveSearch(false)
    setShoppingState("search_prompt")
  }

  if (!showProductUI) {
    return null
  }

  // Render the appropriate UI based on the current shopping state
  const renderShoppingUI = () => {
    return (
      <div className="flex flex-col gap-2">
        {/* Audio player */}
        {showAudioPlayer && <AudioPlayer duration={132} timestamp={currentTime} />}

        {/* Shopping state UI */}
        {(() => {
          switch (shoppingState) {
            case "searching":
              return (
                <div className="flex items-center justify-center p-4 sm:p-6">
                  <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-primary border-t-transparent rounded-full" />
                  <span className="ml-3 text-sm sm:text-base">Searching for products...</span>
                </div>
              )

            case "results":
              return searchResults?.shopping_results ? (
                <div className="px-2">
                  <ProductRecommendationsDisplay
                    products={searchResults.shopping_results}
                    onAddToCart={handleAddToCart}
                    onViewAllRecommendations={handleViewAllRecommendations}
                  />
                  <div className="text-center mt-2">
                    <button onClick={resetSearch} className="text-primary-purple text-sm hover:underline">
                      Search for something else
                    </button>
                  </div>
                </div>
              ) : null

            case "cart":
              return (
                <ShoppingCart
                  items={cartItems}
                  setItems={setCartItems}
                  onClose={() => setShoppingState(activeSearch ? "results" : "search_prompt")}
                />
              )

            case "all_recommendations":
              return searchResults?.shopping_results ? (
                <AllRecommendations
                  products={searchResults.shopping_results}
                  onAddToCart={handleAddToCart}
                  onClose={() => setShoppingState("results")}
                />
              ) : null

            default:
              // Show error message if there is one
              return error ? (
                <div className="p-4 text-center">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              ) : null
          }
        })()}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="mb-12 sm:mb-16">
        <AnimatePresence mode="wait">{renderShoppingUI()}</AnimatePresence>
      </div>

      {/* Shopping cart indicator */}
      {cartItems.length > 0 && shoppingState !== "cart" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-16 sm:bottom-20 right-2 sm:right-4 bg-primary-purple text-white rounded-full p-2 sm:p-3 shadow-lg cursor-pointer z-50"
          onClick={() => setShoppingState("cart")}
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
