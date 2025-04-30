"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { ProductSearchResult } from "@/types/product-search"
import { cn } from "@/utils"

interface ProductRecommendationsProps {
  products: ProductSearchResult[]
  onAddToCart: (product: ProductSearchResult) => void
  onViewAllRecommendations: () => void
}

export default function ProductRecommendations({
  products,
  onAddToCart,
  onViewAllRecommendations,
}: ProductRecommendationsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  // Handle pagination dots click
  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  // Handle add to cart
  const handleAddToCart = (product: ProductSearchResult) => {
    onAddToCart(product)

    // Track selected products (up to 5)
    setSelectedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(product.link)) {
        newSet.delete(product.link)
      } else {
        if (newSet.size >= 5) {
          // Remove the oldest item if we already have 5 selected
          const firstItem = newSet.values().next().value
          newSet.delete(firstItem)
        }
        newSet.add(product.link)
      }
      return newSet
    })
  }

  // If no products, don't render anything
  if (!products || products.length === 0) {
    return null
  }

  const currentProduct = products[currentIndex]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
      <div className="flex items-center mb-2">
        <div className="w-5 h-5 mr-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-primary"
          >
            <path
              d="M21 15.9999V7.9999C21 6.89533 20.1046 5.9999 19 5.9999H5C3.89543 5.9999 3 6.89533 3 7.9999V15.9999C3 17.1045 3.89543 17.9999 5 17.9999H19C20.1046 17.9999 21 17.1045 21 15.9999Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M3 9.9999H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 13.9999H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Recommendations</h3>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex items-start space-x-3 mb-2"
        >
          <div className="relative h-20 w-20 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={currentProduct.thumbnail || "/placeholder.svg?height=80&width=80&query=product"}
              alt={currentProduct.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium line-clamp-2 mb-1">{currentProduct.title}</h4>
            <div className="flex items-baseline mb-1">
              <span className="text-sm font-bold text-primary">{currentProduct.price}</span>
              {currentProduct.extracted_price && currentProduct.price.includes("$") && (
                <span className="text-xs text-gray-500 line-through ml-1">
                  ${(currentProduct.extracted_price * 1.25).toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {currentProduct.rating && (
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < Math.floor(currentProduct.rating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300",
                        )}
                      />
                    ))}
                    {currentProduct.reviews && (
                      <span className="text-xs text-gray-500 ml-1">{currentProduct.reviews.toLocaleString()}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-1 text-xs text-gray-500">
              {currentProduct.extensions?.slice(0, 2).map((ext, i) => (
                <span key={i} className="inline-block">
                  {ext}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => handleAddToCart(currentProduct)}
        className={cn(
          "flex items-center justify-center w-full py-1.5 px-3 rounded-md text-sm mt-2 transition-colors",
          selectedProducts.has(currentProduct.link)
            ? "bg-primary/20 text-primary border border-primary/30"
            : "bg-primary text-white",
        )}
      >
        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
        {selectedProducts.has(currentProduct.link) ? "Added to cart" : "Add to cart"}
      </button>

      {/* Pagination dots */}
      {products.length > 1 && (
        <div className="flex justify-center space-x-1 mt-3">
          {products.slice(0, 5).map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-gray-300 dark:bg-gray-600"
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* See all recommendations link */}
      <button
        onClick={onViewAllRecommendations}
        className="w-full text-center text-primary text-sm mt-2 hover:underline"
      >
        See All Recommendations
      </button>
    </div>
  )
}
