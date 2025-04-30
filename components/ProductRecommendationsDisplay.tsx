"use client"
import { motion } from "framer-motion"
import type { ProductSearchResult } from "@/types/product-search"
import ConversationalProductDisplay from "./ConversationalProductDisplay"

interface ProductRecommendationsDisplayProps {
  products: ProductSearchResult[]
  onAddToCart: (product: ProductSearchResult) => void
  onViewAllRecommendations: () => void
}

export default function ProductRecommendationsDisplay({
  products,
  onAddToCart,
  onViewAllRecommendations,
}: ProductRecommendationsDisplayProps) {
  // If no products, don't render anything
  if (!products || products.length === 0) {
    return null
  }

  // Ensure we have valid products with required fields
  const validProducts = products.filter(
    (product) => product.title && (product.price || product.extracted_price) && product.position !== undefined,
  )

  if (validProducts.length === 0) {
    return null
  }

  // Log product display for debugging
  console.log("Displaying products:", validProducts.length)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full mb-4"
    >
      <ConversationalProductDisplay
        products={validProducts}
        onAddToCart={onAddToCart}
        onViewAllRecommendations={onViewAllRecommendations}
      />
    </motion.div>
  )
}
