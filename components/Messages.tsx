"use client"
import { cn } from "@/utils"
import { useVoice } from "@humeai/voice-react"
import { AnimatePresence, motion } from "framer-motion"
import { type ComponentRef, forwardRef, useEffect, useState, useCallback, useRef } from "react"
import type { ProductSearchResult, CartItem } from "@/types/product-search"
import { searchProducts } from "@/utils/product-search"
import ProductRecommendationsDisplay from "./ProductRecommendationsDisplay"
import { Loader2 } from "lucide-react"

const PRODUCT_KEYWORDS = [
  "apple",
  "juice",
  "skirt",
  "dress",
  "shirt",
  "pants",
  "shoes",
  "bag",
  "watch",
  "phone",
  "laptop",
  "tv",
  "headphones",
  "camera",
  "book",
  "game",
  "toy",
]

// Trigger phrases that Agnes might use to introduce recommendations
const RECOMMENDATION_TRIGGER_PHRASES = [
  "let me share some recommendations",
  "here are some recommendations",
  "let me show you some options",
  "i found these options for you",
  "here's what i found for you",
  "let me share some of the best choices",
  "i'd recommend these products",
  "here are some products you might like",
  "i've found some great options",
]

const Messages = forwardRef<ComponentRef<typeof motion.div>, Record<never, never>>(function Messages(_, ref) {
  const { messages } = useVoice()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [productResults, setProductResults] = useState<{
    query: string
    products: ProductSearchResult[]
    messageIndex: number
    shouldDisplay: boolean
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [recommendationIntroduced, setRecommendationIntroduced] = useState(false)
  const pendingProductsRef = useRef<{
    query: string
    products: ProductSearchResult[]
    messageIndex: number
  } | null>(null)

  // Check if an assistant message contains a recommendation trigger phrase
  const containsRecommendationTrigger = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase()
    return RECOMMENDATION_TRIGGER_PHRASES.some((phrase) => lowerText.includes(phrase))
  }, [])

  // Detect product mention in user messages
  const detectProductMention = useCallback((text: string): boolean => {
    const lowerText = text.toLowerCase()

    // Check for explicit search intent
    const hasSearchIntent =
      lowerText.includes("search") ||
      lowerText.includes("find") ||
      lowerText.includes("look for") ||
      lowerText.includes("show me") ||
      lowerText.includes("display") ||
      lowerText.includes("get me") ||
      lowerText.includes("buy")

    // Check for product keywords
    const hasProductKeyword = PRODUCT_KEYWORDS.some((keyword) => lowerText.includes(keyword))

    // Also detect questions about products
    const isProductQuestion =
      (lowerText.includes("what") || lowerText.includes("which") || lowerText.includes("how much")) && hasProductKeyword

    return (
      hasSearchIntent ||
      isProductQuestion ||
      lowerText.includes("product") ||
      lowerText.includes("item") ||
      hasProductKeyword
    )
  }, [])

  // Process messages to look for recommendation trigger phrases
  useEffect(() => {
    if (messages.length > 0) {
      // Check for recommendation trigger phrases in assistant messages
      for (let i = messages.length - 1; i >= Math.max(0, messages.length - 3); i--) {
        const msg = messages[i]
        if (msg.type === "assistant_message") {
          const content = msg.message.content

          // If the message contains a recommendation trigger phrase
          if (containsRecommendationTrigger(content)) {
            setRecommendationIntroduced(true)

            // If we have pending products, display them now
            if (pendingProductsRef.current) {
              setProductResults({
                ...pendingProductsRef.current,
                shouldDisplay: true,
              })
              pendingProductsRef.current = null
            }

            break
          }
        }
      }
    }
  }, [messages, containsRecommendationTrigger])

  // Extract search queries from messages and perform search
  useEffect(() => {
    const processMessages = async () => {
      if (messages.length > 0 && !isSearching) {
        // Look for messages that might contain product search queries
        for (let i = messages.length - 1; i >= 0; i--) {
          const msg = messages[i]
          if (msg.type === "user_message") {
            const content = msg.message.content

            // Check if message contains product mention
            if (detectProductMention(content)) {
              // Don't search again if we already have results for this message
              if (productResults && productResults.messageIndex === i) {
                break
              }

              console.log("Detected product search intent:", content)
              setIsSearching(true)
              setSearchError(null)

              try {
                // Extract a search query - either the whole message or part of it
                let searchQuery = content

                // Try to extract specific product terms
                const productTerms = PRODUCT_KEYWORDS.filter((keyword) => content.toLowerCase().includes(keyword))

                if (productTerms.length > 0) {
                  // Use the product terms as the search query for better results
                  searchQuery = productTerms.join(" ")
                }

                console.log("Searching for products with query:", searchQuery)

                // Add a small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 500))

                const results = await searchProducts(searchQuery)

                if (results.shopping_results && results.shopping_results.length > 0) {
                  console.log("Found product results:", results.shopping_results.length)

                  const productData = {
                    query: searchQuery,
                    products: results.shopping_results,
                    messageIndex: i,
                  }

                  // If recommendation has been introduced, display products now
                  // Otherwise, store them as pending
                  if (recommendationIntroduced) {
                    setProductResults({
                      ...productData,
                      shouldDisplay: true,
                    })
                    pendingProductsRef.current = null
                  } else {
                    pendingProductsRef.current = productData
                    console.log("Storing products as pending until recommendation is introduced")
                  }
                } else {
                  console.warn("No product results found for query:", searchQuery)
                  setSearchError("No products found for your search.")
                }
              } catch (error) {
                console.error("Error searching products:", error)
                setSearchError("Error finding products. Please try again.")
              } finally {
                setIsSearching(false)
              }

              break
            }
          }
        }
      }
    }

    processMessages()
  }, [messages, isSearching, productResults, detectProductMention, recommendationIntroduced])

  // Reset recommendation state when starting a new conversation
  useEffect(() => {
    if (messages.length === 0) {
      setRecommendationIntroduced(false)
      pendingProductsRef.current = null
    }
  }, [messages])

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

  // Handle view all recommendations
  const handleViewAllRecommendations = () => {
    // This would open a modal or navigate to a page with all recommendations
    console.log("View all recommendations")
  }

  // Ensure scrolling to bottom when new messages arrive
  useEffect(() => {
    if (ref && "current" in ref && ref.current) {
      const scrollElement = ref.current
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, ref, productResults])

  // Debug: Force product search (for testing only)
  const forceProductSearch = async (query: string) => {
    setIsSearching(true)
    setSearchError(null)

    try {
      const results = await searchProducts(query)
      if (results.shopping_results && results.shopping_results.length > 0) {
        // In debug mode, always display immediately
        setProductResults({
          query,
          products: results.shopping_results,
          messageIndex: messages.length - 1,
          shouldDisplay: true,
        })
      } else {
        setSearchError("No products found for your search.")
      }
    } catch (error) {
      console.error("Error searching products:", error)
      setSearchError("Error finding products. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  // Force recommendations to appear (for debugging)
  const forceRecommendationDisplay = () => {
    setRecommendationIntroduced(true)
    if (pendingProductsRef.current) {
      setProductResults({
        ...pendingProductsRef.current,
        shouldDisplay: true,
      })
      pendingProductsRef.current = null
    }
  }

  return (
    <motion.div
      layoutScroll
      className={
        "grow rounded-md overflow-auto p-2 sm:p-3 md:p-4 max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-220px)]"
      }
      ref={ref}
      style={{ overflowY: "auto", overscrollBehavior: "contain" }}
    >
      <motion.div className={"max-w-2xl mx-auto w-full flex flex-col gap-2 sm:gap-3 md:gap-4 pb-24"}>
        <AnimatePresence mode={"popLayout"} initial={false}>
          {messages.map((msg, index) => {
            if (msg.type === "user_message" || msg.type === "assistant_message") {
              // Check if this is the message that should display product recommendations
              // Only display if:
              // 1. We have product results
              // 2. The recommendation has been properly introduced
              // 3. This is the right message to display them after
              const isAssistantMessage = msg.type === "assistant_message"
              const isLastMessage = index === messages.length - 1
              const shouldShowProducts =
                productResults &&
                productResults.shouldDisplay &&
                isAssistantMessage &&
                index ===
                  messages.findIndex(
                    (m, i) =>
                      i > productResults.messageIndex &&
                      m.type === "assistant_message" &&
                      containsRecommendationTrigger(m.message.content),
                  )

              return (
                <motion.div
                  key={`${msg.type}-${index}`}
                  className={cn(
                    "w-[95%] sm:w-[90%] md:w-[80%]",
                    "bg-card",
                    "border border-border rounded p-2 sm:p-3",
                    msg.type === "user_message" ? "ml-auto" : "",
                  )}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 0,
                  }}
                >
                  <div className={cn("text-xs capitalize font-medium leading-none opacity-50 mb-1 sm:mb-2")}>
                    {msg.message.role}
                  </div>
                  <div className="text-sm sm:text-base">{msg.message.content}</div>

                  {/* Show product recommendations after the proper assistant's response */}
                  {shouldShowProducts && productResults.products.length > 0 && (
                    <div className="mt-3">
                      <ProductRecommendationsDisplay
                        products={productResults.products}
                        onAddToCart={handleAddToCart}
                        onViewAllRecommendations={handleViewAllRecommendations}
                      />
                    </div>
                  )}

                  {/* Debugging tools - Only visible during development */}
                  {process.env.NODE_ENV === "development" && isAssistantMessage && isLastMessage && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 mb-1">Debug: Force product search</div>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => forceProductSearch("apple juice")}
                          className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-2 py-1 rounded"
                        >
                          Search Apple Juice
                        </button>
                        <button
                          onClick={() => forceProductSearch("skirt")}
                          className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-2 py-1 rounded"
                        >
                          Search Skirt
                        </button>
                        <button
                          onClick={forceRecommendationDisplay}
                          className="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 px-2 py-1 rounded"
                        >
                          Force Show Recommendations
                        </button>
                        <div className="text-xs mt-1 w-full">
                          Recommendation Introduced: {recommendationIntroduced ? "Yes" : "No"}
                        </div>
                        <div className="text-xs w-full">
                          Pending Products: {pendingProductsRef.current ? "Yes" : "No"}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            }

            return null
          })}
        </AnimatePresence>

        {/* Loading indicator for product search */}
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center p-4 bg-card border border-border rounded"
          >
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary-purple" />
            <span className="text-sm">Searching for products...</span>
          </motion.div>
        )}

        {/* Error message for product search */}
        {searchError && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
          >
            {searchError}
          </motion.div>
        )}

        {/* Pending recommendations indicator (if we have products but waiting for introduction) */}
        {pendingProductsRef.current && !recommendationIntroduced && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded opacity-75"
          >
            Agnes is preparing product recommendations...
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
})

export default Messages
