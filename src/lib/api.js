const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api'
let refreshPromise = null

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
  if (!refreshPromise) {
    refreshPromise = fetch(getApiUrl('/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.history.replaceState(null, '', '/login')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
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
  const requestOptions = {
    ...options,
    headers: new Headers(options.headers),
  }

  let response = await request(endpoint, requestOptions)

  if (response.status === 401) {
    const refreshed = await refreshSession()

    if (refreshed) {
      response = await request(endpoint, {
        ...requestOptions,
        headers: new Headers(requestOptions.headers),
      })
    } else {
      redirectToLogin()
    }
  }

  return response
}

export async function publicApiFetch(endpoint, options = {}) {
  return fetch(getApiUrl(endpoint), options)
}
export async function createDonation(payload) {
  const response = await publicApiFetch('/donation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await parseApiResponse(response)

  if (!response.ok) {
    throw new Error('create-donation-failed')
  }

  return data
}

export async function getDonationStatus(donationId) {
  const response = await publicApiFetch(`/donation/${encodeURIComponent(donationId)}/status`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (response.status === 404) {
    return null
  }

  const data = await parseApiResponse(response)

  if (!response.ok) {
    throw new Error('donation-status-failed')
  }

  return data
}
