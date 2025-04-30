import "server-only"

import { fetchAccessToken } from "hume"

export const getHumeAccessToken = async () => {
  try {
    // Check if environment variables are available
    const apiKey = process.env.HUME_API_KEY
    const secretKey = process.env.HUME_SECRET_KEY

    if (!apiKey || !secretKey) {
      console.warn("Hume API keys not found in environment variables")
      return null
    }

    const accessToken = await fetchAccessToken({
      apiKey: String(apiKey),
      secretKey: String(secretKey),
    })

    if (accessToken === "undefined" || !accessToken) {
      console.warn("Failed to fetch Hume access token")
      return null
    }

    return accessToken
  } catch (error) {
    console.error("Error fetching Hume access token:", error)
    return null
  }
}
