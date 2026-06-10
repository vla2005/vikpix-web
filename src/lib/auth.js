const ACCESS_TOKEN_KEY = 'vikpix_access_token'

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function isAccessTokenPersistent() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
}

export function setAccessToken(token, { rememberMe = false } = {}) {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)

  if (!token) {
    return
  }

  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}
