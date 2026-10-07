const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL
  if (envUrl && envUrl.trim() !== "") {
    const trimmed = envUrl.trim().replace(/\/+$/, "")
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`
  }
  return "http://localhost:8000/api"
}

export const API_BASE_URL = getApiBaseUrl()

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = new Headers(options.headers || {})
  
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  
  // Example of auth header insertion if we had an auth token
  // headers.set("Authorization", `Bearer ...`)

  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }
    throw new ApiError(response.status, errorData, errorData.error?.message || "An API error occurred")
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}
