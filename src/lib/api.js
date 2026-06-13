import { redirectToLogin } from '@/lib/keycloak'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function getApiUrl(endpoint) {
  if (endpoint.startsWith('http')) {
    return endpoint
  }

  return `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

export async function parseApiResponse(response) {
  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  return JSON.parse(responseText)
}

async function refreshSession() {
  const response = await fetch(getApiUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
  })

  return response.ok
}

async function request(endpoint, options = {}) {
  const headers = new Headers(options.headers)

  return fetch(getApiUrl(endpoint), {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  })
}

export async function apiFetch(endpoint, options = {}) {
  let response = await request(endpoint, options)

  if (response.status === 401) {
    const refreshed = await refreshSession()

    if (refreshed) {
      response = await request(endpoint, options)
    } else {
      redirectToLogin()
    }
  }

  return response
}

export async function publicApiFetch(endpoint, options = {}) {
  return fetch(getApiUrl(endpoint), options)
}
