import {
  clearAccessToken,
  getAccessToken,
  isAccessTokenPersistent,
  redirectToLogin,
  setAccessToken,
} from '@/lib/auth'

const apiUrl = import.meta.env.VITE_API_URL

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

async function refreshAccessToken() {
  const response = await fetch(getApiUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
  })

  const data = await parseApiResponse(response)

  if (!response.ok || !data?.token) {
    throw new Error(data?.message || 'Sessao expirada.')
  }

  setAccessToken(data.token, {
    rememberMe: isAccessTokenPersistent(),
  })

  return data.token
}

export async function apiFetch(endpoint, options = {}) {
  const { skipAuthRefresh, ...fetchOptions } = options
  const token = getAccessToken()
  const headers = new Headers(fetchOptions.headers)

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(getApiUrl(endpoint), {
    ...fetchOptions,
    credentials: fetchOptions.credentials || 'include',
    headers,
  })

  if (response.status !== 401 || skipAuthRefresh) {
    return response
  }

  try {
    const refreshedToken = await refreshAccessToken()
    const retryHeaders = new Headers(fetchOptions.headers)
    retryHeaders.set('Authorization', `Bearer ${refreshedToken}`)

    return fetch(getApiUrl(endpoint), {
      ...fetchOptions,
      credentials: fetchOptions.credentials || 'include',
      headers: retryHeaders,
    })
  } catch (error) {
    clearAccessToken()
    redirectToLogin()
    throw error
  }
}

export async function login({ email, password, rememberMe }) {
  const response = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, rememberMe }),
  })

  const data = await parseApiResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || 'Erro ao fazer login.')
  }

  if (!data?.token) {
    throw new Error('Token nao retornado pela API.')
  }

  setAccessToken(data.token, { rememberMe })

  return data
}

export async function logout() {
  try {
    await fetch(getApiUrl('/auth/logout'), {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Even if the network request fails, the front-end session must be cleared.
  } finally {
    clearAccessToken()
  }
}
