export interface ProductSearchResult {
  position: number
  title: string
  link: string
  source: string
  price: string
  extracted_price?: number
  rating?: number
  reviews?: number
  thumbnail: string
  delivery?: string
  extensions?: string[]
  tag?: string
}

export interface ShoppingSearchResponse {
  search_metadata?: {
    id: string
    status: string
    json_endpoint: string
    created_at: string
    processed_at: string
    google_shopping_url: string
    raw_html_file: string
    total_time_taken: number
  }
  search_parameters?: {
    engine: string
    q: string
    google_domain: string
    device: string
  }
  shopping_results?: ProductSearchResult[]
  error?: string
}

export interface CartItem extends ProductSearchResult {
  quantity: number
}
