"use client"

import type React from "react"
import type { CartItem } from "@/types/product-search"
import { Trash2, X } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"
import { motion } from "framer-motion"

interface ShoppingCartProps {
  items: CartItem[]
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>
  onClose: () => void
}

export default function ShoppingCart({ items, setItems, onClose }: ShoppingCartProps) {
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const newItems = [...items]
    newItems[index] = { ...newItems[index], quantity: newQuantity }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((total, item) => {
    const price = item.extracted_price || 0
    return total + price * item.quantity
  }, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Cart is empty
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 text-center"
      >
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <svg
            className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Your cart is empty</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Start shopping to add items to your cart.
        </p>
        <Button onClick={onClose} size="sm" className="text-xs sm:text-sm">
          Continue Shopping
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 sm:p-3 md:p-4">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-bold">Your Cart ({items.length} items)</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 sm:h-8">
          <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="text-xs sm:text-sm">Close</span>
        </Button>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-[200px] sm:max-h-[250px] md:max-h-[300px] overflow-auto">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 sm:gap-3 pb-2 sm:pb-3 border-b">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 dark:bg-gray-800 rounded">
              <Image
                src={item.thumbnail || "/placeholder.svg?height=64&width=64&query=product"}
                alt={item.title}
                fill
                className="object-contain p-1"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">{item.title}</h3>
              <div className="text-xs text-muted-foreground mb-0.5 sm:mb-1">{item.source}</div>
              <div className="font-bold text-xs sm:text-sm">{item.price}</div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center mb-1 sm:mb-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                >
                  <span className="sr-only">Decrease</span>
                  <span>-</span>
                </Button>

                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">{item.quantity}</span>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  <span className="sr-only">Increase</span>
                  <span>+</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-5 sm:h-6 px-1 sm:px-2 text-xs text-muted-foreground"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                <span className="text-[10px] sm:text-xs">Remove</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
        <div className="flex justify-between font-bold text-sm sm:text-base md:text-lg">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <Button className="w-full text-xs sm:text-sm h-8 sm:h-9">Proceed to Checkout</Button>
    </motion.div>
  )
}
