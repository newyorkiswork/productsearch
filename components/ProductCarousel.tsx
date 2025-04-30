"use client"

import { useState } from "react"
import type { ProductSearchResult } from "@/types/product-search"
import { ChevronLeft, ChevronRight, Star, ShoppingCart, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/utils"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface ProductCarouselProps {
  products: ProductSearchResult[]
  onAddToCart: (product: ProductSearchResult) => void
  onViewProduct: (product: ProductSearchResult) => void
}

export default function ProductCarousel({ products, onAddToCart, onViewProduct }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const productsPerPage = 1
  const totalPages = Math.ceil(products.length / productsPerPage)

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const currentProduct = products[currentIndex]

  if (!currentProduct) {
    return null
  }

  return (
    <div className="w-full py-1 sm:py-2 px-2 sm:px-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="relative h-32 sm:h-40 md:h-48 bg-gray-50 dark:bg-gray-900">
            <Image
              src={currentProduct.thumbnail || "/placeholder.svg?height=200&width=200&query=product"}
              alt={currentProduct.title}
              fill
              className="object-contain p-2"
            />
          </div>

          <div className="p-2 sm:p-3 md:p-4">
            <h4 className="font-medium text-sm sm:text-base mb-1" title={currentProduct.title}>
              {currentProduct.title.length > 60 ? `${currentProduct.title.substring(0, 60)}...` : currentProduct.title}
            </h4>

            <div className="flex justify-between items-center mb-1 sm:mb-2">
              <div className="font-bold text-primary text-base sm:text-lg">{currentProduct.price}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{currentProduct.source}</div>
            </div>

            {currentProduct.rating && (
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3 sm:h-4 sm:w-4",
                        i < Math.floor(currentProduct.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                  ))}
                </div>
                <span className="ml-1 text-xs sm:text-sm text-muted-foreground">
                  {currentProduct.reviews ? `(${currentProduct.reviews})` : ""}
                </span>
              </div>
            )}

            <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-3">
              <Button className="flex-1 text-xs sm:text-sm h-8 sm:h-9" onClick={() => onAddToCart(currentProduct)}>
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                onClick={() => onViewProduct(currentProduct)}
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                View Product
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center p-1 sm:p-2 bg-gray-50 dark:bg-gray-900">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPage}
              disabled={products.length <= 1}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <div className="text-xs sm:text-sm">
              {currentIndex + 1} of {products.length}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextPage}
              disabled={products.length <= 1}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
