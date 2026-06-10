import { getKeycloakToken, redirectToLogin } from '@/lib/keycloak'

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

export async function apiFetch(endpoint, options = {}) {
  const headers = new Headers(options.headers)
  const token = await getKeycloakToken()

  if (!token) {
    redirectToLogin()
    throw new Error('Usuario nao autenticado.')
  }

  headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers,
  })

  if (response.status === 401) {
    redirectToLogin()
  }

  return response
}

export async function publicApiFetch(endpoint, options = {}) {
  return fetch(getApiUrl(endpoint), options)
}
