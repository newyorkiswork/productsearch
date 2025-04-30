"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Star } from "lucide-react"
import type { ProductSearchResult } from "@/types/product-search"
import { cn } from "@/utils"

interface ProductCardProps {
  product: ProductSearchResult
  onAddToCart: (product: ProductSearchResult) => void
  currentIndex: number
  totalProducts: number
  onChangeProduct: (index: number) => void
}

export default function ProductCard({
  product,
  onAddToCart,
  currentIndex,
  totalProducts,
  onChangeProduct,
}: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    onAddToCart(product)
    setIsAdded(true)

    // Reset the "added" state after a delay
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  // Format the price display
  const formatPrice = () => {
    if (!product.price) return "$0.00"

    // If it's already a formatted price string with a dollar sign, return it
    if (product.price.includes("$")) return product.price

    // Otherwise, format the extracted price
    return `$${product.extracted_price?.toFixed(2) || "0.00"}`
  }

  // Format the original price for display
  const formatOriginalPrice = () => {
    if (product.original_price && product.original_price.includes("$")) {
      return product.original_price
    }

    if (product.extracted_price) {
      // Show a slightly higher original price
      return `$${(product.extracted_price * 1.2).toFixed(2)}`
    }

    return null
  }

  return (
    <div className="bg-white rounded-lg p-4 w-full max-w-md">
      <div className="flex items-center mb-2">
        <div className="w-5 h-5 mr-2 text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 16.0001V8.00006C21 6.89549 20.1046 6.00006 19 6.00006H5C3.89543 6.00006 3 6.89549 3 8.00006V16.0001C3 17.1046 3.89543 18.0001 5 18.0001H19C20.1046 18.0001 21 17.1046 21 16.0001Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 14H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-700">Product Recommendations</h3>
      </div>

      <div className="flex items-start space-x-3 mb-2">
        <div className="relative h-20 w-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={product.thumbnail || "/placeholder.svg?height=80&width=80&query=product"}
            alt={product.title}
            fill
            className="object-contain"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = "/placeholder.svg?height=80&width=80&query=product"
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium line-clamp-2 mb-1">{product.title}</h4>
          <div className="flex items-baseline mb-1">
            <span className="text-sm font-bold text-primary-purple">{formatPrice()}</span>
            {formatOriginalPrice() && (
              <span className="text-xs text-gray-500 line-through ml-1">{formatOriginalPrice()}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-1 text-xs text-gray-500">
            <span>Free Shipping</span>
            <span>•</span>
            <span>Coupon Available</span>
          </div>

          <div className="flex items-center">
            {product.rating && (
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                    )}
                  />
                ))}
                {product.reviews && (
                  <span className="text-xs text-gray-500 ml-1">{product.reviews.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className={cn(
          "flex items-center justify-center w-full py-1.5 px-3 rounded-md text-sm mt-2 transition-colors",
          isAdded
            ? "bg-primary-purple/20 text-primary-purple border border-primary-purple/30"
            : "bg-primary-purple text-white",
        )}
      >
        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
        {isAdded ? "Added to cart" : "Add to cart"}
      </button>

      {/* Pagination dots */}
      {totalProducts > 1 && (
        <div className="flex justify-center space-x-1 mt-3">
          {[...Array(Math.min(totalProducts, 5))].map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "w-4 bg-primary-purple" : "w-1.5 bg-gray-300"
              }`}
              onClick={() => onChangeProduct(index)}
              aria-label={`Go to product ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* See all recommendations link */}
      <div className="text-center mt-3">
        <button className="text-primary-purple text-sm hover:underline">See All Recommendations</button>
      </div>
    </div>
  )
}
