"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { ProductSearchResult } from "@/types/product-search"
import { cn } from "@/utils"

interface ConversationalProductDisplayProps {
  products: ProductSearchResult[]
  onAddToCart: (product: ProductSearchResult) => void
  onViewAllRecommendations: () => void
}

export default function ConversationalProductDisplay({
  products,
  onAddToCart,
  onViewAllRecommendations,
}: ConversationalProductDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set())

  // If no products, don't render anything
  if (!products || products.length === 0) {
    return null
  }

  const handleChangeProduct = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePrevProduct = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1))
  }

  const handleNextProduct = () => {
    setCurrentIndex((prev) => (prev < products.length - 1 ? prev + 1 : 0))
  }

  const handleAddToCart = (product: ProductSearchResult) => {
    onAddToCart(product)
    setAddedProducts((prev) => {
      const newSet = new Set(prev)
      newSet.add(product.link)
      return newSet
    })
  }

  // Format the price display
  const formatPrice = (product: ProductSearchResult) => {
    if (!product.price) return "$0.00"
    if (product.price.includes("$")) return product.price
    return `$${product.extracted_price?.toFixed(2) || "0.00"}`
  }

  // Format the original price for display
  const formatOriginalPrice = (product: ProductSearchResult) => {
    if (product.original_price && product.original_price.includes("$")) {
      return product.original_price
    }
    if (product.extracted_price) {
      return `$${(product.extracted_price * 1.2).toFixed(2)}`
    }
    return null
  }

  const currentProduct = products[currentIndex]
  const isAdded = addedProducts.has(currentProduct.link)

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Recommendation header */}
      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-t-lg px-3 py-2 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center text-primary-purple">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.5 14.5L5 11L8.5 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.5 14.5L19 11L15.5 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium">Product Recommendations</span>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {currentIndex + 1} of {products.length}
        </div>
      </div>

      {/* Product card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-t-0 rounded-b-lg overflow-hidden"
        >
          <div className="flex p-3">
            {/* Product image */}
            <div className="relative h-20 w-20 bg-gray-100 dark:bg-gray-900 rounded overflow-hidden mr-3">
              <Image
                src={currentProduct.thumbnail || "/placeholder.svg?height=80&width=80&query=product"}
                alt={currentProduct.title}
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/assorted-products-display.png"
                }}
              />
            </div>

            {/* Product details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium line-clamp-2 mb-1">{currentProduct.title}</h4>
              <div className="flex items-baseline mb-1">
                <span className="text-sm font-bold text-primary-purple">{formatPrice(currentProduct)}</span>
                {formatOriginalPrice(currentProduct) && (
                  <span className="text-xs text-gray-500 line-through ml-1">{formatOriginalPrice(currentProduct)}</span>
                )}
              </div>

              {/* Product ratings */}
              {currentProduct.rating && (
                <div className="flex items-center mb-1">
                  <div className="flex">
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
                  </div>
                  {currentProduct.reviews && (
                    <span className="text-xs text-gray-500 ml-1">{currentProduct.reviews.toLocaleString()}</span>
                  )}
                </div>
              )}

              {/* Source and extras */}
              <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                <span>{currentProduct.source}</span>
                {currentProduct.delivery && <span>• {currentProduct.delivery}</span>}
                {!currentProduct.delivery && <span>• Free Shipping</span>}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handlePrevProduct}
              disabled={products.length <= 1}
              className="flex-1 py-2 text-center text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-3 w-3 inline mr-1" />
              Previous
            </button>
            <div className="w-px bg-gray-100 dark:bg-gray-700"></div>
            <button
              onClick={() => handleAddToCart(currentProduct)}
              className={cn(
                "flex-[2] py-2 text-center text-xs",
                isAdded
                  ? "text-primary-purple bg-primary-purple/10 hover:bg-primary-purple/20"
                  : "text-white bg-primary-purple hover:bg-primary-purple/90",
              )}
            >
              <ShoppingCart className="h-3 w-3 inline mr-1" />
              {isAdded ? "Added to Cart" : "Add to Cart"}
            </button>
            <div className="w-px bg-gray-100 dark:bg-gray-700"></div>
            <button
              onClick={handleNextProduct}
              disabled={products.length <= 1}
              className="flex-1 py-2 text-center text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
              <ChevronRight className="h-3 w-3 inline ml-1" />
            </button>
          </div>

          {/* Pagination dots */}
          {products.length > 1 && (
            <div className="flex justify-center items-center py-2 bg-gray-50 dark:bg-gray-800">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChangeProduct(idx)}
                  className={`mx-0.5 ${
                    idx === currentIndex
                      ? "w-4 h-1.5 bg-primary-purple rounded-full"
                      : "w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"
                  }`}
                  aria-label={`View product ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* View all and more options */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-2">
            <button
              onClick={onViewAllRecommendations}
              className="w-full text-center text-primary-purple text-xs hover:underline"
            >
              See All Recommendations
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
