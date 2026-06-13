import { navigate } from '@/lib/navigation'
import Keycloak from 'keycloak-js'

const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM
const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
const callbackRedirectUri = `${appUrl}/callback`

const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: keycloakRealm,
  clientId: keycloakClientId,
})

const authorizationUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/auth`
const tokenUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`
const logoutUrl = `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`
const sessionKey = 'vikpix_keycloak_session'
const keycloakLoginScope = 'openid profile email offline_access'

let accessToken = null
let refreshToken = null
let expiresAt = 0
let rememberSession = false
let initPromise = null

function initKeycloak() {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })
  }

  return initPromise
}

function getStoredSession() {
  const localSession = localStorage.getItem(sessionKey)
  const sessionSession = sessionStorage.getItem(sessionKey)
  const rawSession = localSession || sessionSession

  if (!rawSession) {
    return null
  }

  try {
    return {
      ...JSON.parse(rawSession),
      rememberSession: Boolean(localSession),
    }
  } catch {
    localStorage.removeItem(sessionKey)
    sessionStorage.removeItem(sessionKey)
    return null
  }
}

function persistSession() {
  sessionStorage.removeItem(sessionKey)
  localStorage.removeItem(sessionKey)

  if (!refreshToken) {
    return
  }

  const storage = rememberSession ? localStorage : sessionStorage

  storage.setItem(sessionKey, JSON.stringify({
    refreshToken,
  }))
}

function restoreSession() {
  if (refreshToken) {
    return
  }

  const storedSession = getStoredSession()

  if (!storedSession?.refreshToken) {
    return
  }

  refreshToken = storedSession.refreshToken
  rememberSession = storedSession.rememberSession
}

function setTokenData(data, options = {}) {
  rememberSession = options.rememberMe ?? rememberSession
  accessToken = data.access_token
  refreshToken = data.refresh_token || refreshToken
  expiresAt = Date.now() + (data.expires_in || 0) * 1000
  persistSession()
}

function clearTokenData() {
  accessToken = null
  refreshToken = null
  expiresAt = 0
  rememberSession = false
  localStorage.removeItem(sessionKey)
  sessionStorage.removeItem(sessionKey)
}

async function requestToken(body, options = {}) {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || 'Erro ao autenticar no Keycloak.')
  }

  setTokenData(data, options)

  return data
}

export function isAuthenticated() {
  return Boolean(accessToken)
}

export async function loginWithCredentials({ username, password, rememberMe = false }) {
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: keycloakClientId,
    username,
    password,
    scope: keycloakLoginScope,
  })

  return requestToken(body, { rememberMe })
}

export async function loginWithIdentityProvider(identityProvider) {
  await initKeycloak()

  return keycloak.login({
    idpHint: identityProvider,
    redirectUri: `${window.location.origin}/dashboard`,
    scope: keycloakLoginScope,
  })
}

export function loginWithProvider(providerAlias) {
  const providerLoginUrl =
    `${authorizationUrl}` +
    `?client_id=${encodeURIComponent(keycloakClientId)}` +
    `&redirect_uri=${encodeURIComponent(callbackRedirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(keycloakLoginScope)}` +
    `&kc_idp_hint=${encodeURIComponent(providerAlias)}`

  window.location.href = providerLoginUrl
}

export async function handleAuthorizationCallback(callbackLocation = window.location.href) {
  const url = new URL(callbackLocation)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    throw new Error(url.searchParams.get('error_description') || error)
  }

  if (!code) {
    throw new Error('Codigo de autenticacao nao retornado pelo Keycloak.')
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: keycloakClientId,
    code,
    redirect_uri: callbackRedirectUri,
  })

  return requestToken(body)
}

export async function refreshKeycloakToken(minValidity = 30) {
  restoreSession()

  if (!refreshToken) {
    return null
  }

  const expiresIn = expiresAt - Date.now()

  if (expiresIn > minValidity * 1000) {
    return accessToken
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: keycloakClientId,
    refresh_token: refreshToken,
  })

  try {
    await requestToken(body)
    return accessToken
  } catch (error) {
    clearTokenData()
    throw error
  }
}

export async function logout() {
  try {
    const authenticatedByRedirect = await initKeycloak()

    if (authenticatedByRedirect) {
      await keycloak.logout({
        redirectUri: `${window.location.origin}/login`,
      })
      return
    }

    if (refreshToken) {
      await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: keycloakClientId,
          refresh_token: refreshToken,
        }),
      })
    }
  } finally {
    clearTokenData()
    navigate('/login')
  }
}

export function redirectToLogin() {
  clearTokenData()

  if (window.location.pathname !== '/login') {
    navigate('/login')
  }
}
