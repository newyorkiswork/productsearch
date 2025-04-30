"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Star, X } from "lucide-react"
import { motion } from "framer-motion"
import type { ProductSearchResult } from "@/types/product-search"
import { cn } from "@/utils"

interface AllRecommendationsProps {
  products: ProductSearchResult[]
  onAddToCart: (product: ProductSearchResult) => void
  onClose: () => void
}

export default function AllRecommendations({ products, onAddToCart, onClose }: AllRecommendationsProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">All Product Recommendations</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-64px)]">
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="relative h-32 bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={product.thumbnail || "/placeholder.svg?height=128&width=128&query=product"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-2">
                  <h4 className="text-sm font-medium line-clamp-2 mb-1">{product.title}</h4>
                  <div className="flex items-baseline mb-1">
                    <span className="text-sm font-bold text-primary">{product.price}</span>
                  </div>

                  {product.rating && (
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                          )}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={cn(
                      "flex items-center justify-center w-full py-1 px-2 rounded-md text-xs transition-colors",
                      selectedProducts.has(product.link)
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-primary text-white",
                    )}
                  >
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    {selectedProducts.has(product.link) ? "Added" : "Add to cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
