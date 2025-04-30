// Phrases that indicate Agnes is about to share product recommendations
export const RECOMMENDATION_TRIGGER_PHRASES = [
  "let me share some recommendations",
  "here are some recommendations",
  "let me show you some options",
  "i found these options for you",
  "here's what i found for you",
  "let me share some of the best choices",
  "i'd recommend these products",
  "here are some products you might like",
  "i've found some great options",
  "take a look at these options",
  "here are some choices for you",
  "i've selected these items for you",
  "let me suggest these products",
]

// Check if a text contains any of the recommendation trigger phrases
export function containsRecommendationTrigger(text: string): boolean {
  const lowerText = text.toLowerCase()
  return RECOMMENDATION_TRIGGER_PHRASES.some((phrase) => lowerText.includes(phrase))
}

// List of product-related keywords
export const PRODUCT_KEYWORDS = [
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
  "furniture",
  "appliance",
  "cosmetics",
]

// Detect product mention in user messages
export function detectProductMention(text: string): boolean {
  const lowerText = text.toLowerCase()

  // Check for explicit search intent
  const hasSearchIntent =
    lowerText.includes("search") ||
    lowerText.includes("find") ||
    lowerText.includes("look for") ||
    lowerText.includes("show me") ||
    lowerText.includes("display") ||
    lowerText.includes("get me") ||
    lowerText.includes("buy") ||
    lowerText.includes("purchase") ||
    lowerText.includes("shop for")

  // Check for product keywords
  const hasProductKeyword = PRODUCT_KEYWORDS.some((keyword) => lowerText.includes(keyword))

  // Also detect questions about products
  const isProductQuestion =
    (lowerText.includes("what") ||
      lowerText.includes("which") ||
      lowerText.includes("how much") ||
      lowerText.includes("where")) &&
    hasProductKeyword

  return (
    hasSearchIntent ||
    isProductQuestion ||
    lowerText.includes("product") ||
    lowerText.includes("item") ||
    hasProductKeyword
  )
}

// Get product terms from a query
export function extractProductTerms(query: string): string[] {
  const lowerQuery = query.toLowerCase()
  return PRODUCT_KEYWORDS.filter((keyword) => lowerQuery.includes(keyword))
}
