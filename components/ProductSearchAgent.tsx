"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { searchProducts } from "@/utils/product-search"
import type { ProductSearchResult, CartItem } from "@/types/product-search"
import VisualProductResults from "./VisualProductResults"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ShoppingBag } from "lucide-react"
import ShoppingCart from "./ShoppingCart"

interface ProductSearchAgentProps {
  searchQuery: string | null
  onAddToCart: (product: ProductSearchResult) => void
  cartItems: CartItem[]
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>
}

export default function ProductSearchAgent({
  searchQuery,
  onAddToCart,
  cartItems,
  setCartItems,
}: ProductSearchAgentProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "complete" | "error">("idle")

  // Perform search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery) return

      setIsSearching(true)
      setSearchStatus("searching")
      setError(null)

      try {
        const results = await searchProducts(searchQuery)

        if (results.error) {
          setError(results.error)
          setSearchStatus("error")
        } else if (!results.shopping_results || results.shopping_results.length === 0) {
          setError("No products found matching your search.")
          setSearchStatus("error")
        } else {
          setSearchResults(results.shopping_results)
          setSearchStatus("complete")
        }
      } catch (err) {
        setError("An error occurred while searching for products.")
        setSearchStatus("error")
      } finally {
        setIsSearching(false)
      }
    }

    if (searchQuery) {
      performSearch()
    }
  }, [searchQuery])

  // Handle view product
  const handleViewProduct = (product: ProductSearchResult) => {
    window.open(product.link, "_blank", "noopener,noreferrer")
  }

  if (!searchQuery) return null

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {searchStatus === "searching" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-6 text-center"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm">Searching for products matching "{searchQuery}"...</p>
          </motion.div>
        )}

        {searchStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 text-center"
          >
            <p className="text-red-500 text-sm">{error}</p>
          </motion.div>
        )}

        {searchStatus === "complete" && searchResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <VisualProductResults
              products={searchResults}
              onAddToCart={onAddToCart}
              onViewProduct={handleViewProduct}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shopping cart indicator */}
      {cartItems.length > 0 && !showCart && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-16 sm:bottom-20 right-2 sm:right-4 bg-primary text-primary-foreground rounded-full p-2 sm:p-3 shadow-lg cursor-pointer z-50"
          onClick={() => setShowCart(true)}
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Shopping cart */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ShoppingCart items={cartItems} setItems={setCartItems} onClose={() => setShowCart(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
