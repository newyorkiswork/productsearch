"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Search, ShoppingBag } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { searchProducts } from "@/utils/product-search"
import type { ProductSearchResult, CartItem } from "@/types/product-search"
import VisualProductResults from "./VisualProductResults"
import ShoppingCart from "./ShoppingCart"

interface AgentResponseProps {
  isActive: boolean
  onSearch: (query: string) => void
}

export default function AgentResponse({ isActive, onSearch }: AgentResponseProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const results = await searchProducts(searchQuery)

      if (results.error) {
        setError(results.error)
      } else if (!results.shopping_results || results.shopping_results.length === 0) {
        setError("No products found matching your search.")
      } else {
        setSearchResults(results.shopping_results)
        onSearch(searchQuery) // Notify parent component
      }
    } catch (err) {
      setError("An error occurred while searching for products.")
    } finally {
      setIsSearching(false)
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

  // Handle view product
  const handleViewProduct = (product: ProductSearchResult) => {
    window.open(product.link, "_blank", "noopener,noreferrer")
  }

  if (!isActive) return null

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-sm mb-2">Product Search Assistant</h3>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="sm" disabled={isSearching} className="h-8">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 text-red-500 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {searchResults.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VisualProductResults
              products={searchResults}
              onAddToCart={handleAddToCart}
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
