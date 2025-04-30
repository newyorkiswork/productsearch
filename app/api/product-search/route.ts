import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    // Build the SerpAPI URL with the provided API key
    const serpApiKey = process.env.SERPAPI_KEY
    if (!serpApiKey) {
      console.warn("SERPAPI_KEY environment variable is not set")
      // Return a fallback response instead of failing
      return NextResponse.json({
        error: "API key not configured",
        fallback: true,
        shopping_results: [],
      })
    }

    const serpApiUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`

    const response = await fetch(serpApiUrl)

    // Check for rate limiting or other error responses
    if (!response.ok) {
      const statusCode = response.status
      const statusText = response.statusText

      console.error(`SerpAPI responded with status: ${statusCode} ${statusText}`)

      // Return a structured error response
      return NextResponse.json(
        {
          error: `API error: ${statusCode} ${statusText}`,
          fallback: true,
          shopping_results: [],
        },
        { status: 200 },
      ) // Still return 200 to allow fallback to work
    }

    // Try to parse the response as JSON
    let data
    try {
      data = await response.json()
    } catch (parseError) {
      console.error("Failed to parse SerpAPI response as JSON:", parseError)
      return NextResponse.json(
        {
          error: "Invalid API response format",
          fallback: true,
          shopping_results: [],
        },
        { status: 200 },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching from SerpAPI:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch product data",
        fallback: true,
        shopping_results: [],
      },
      { status: 200 },
    )
  }
}
