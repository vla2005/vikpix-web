export function navigate(path, state = null) {
  const currentPath = `${window.location.pathname}${window.location.search}`

  if (currentPath === path) {
    return
  }

  window.history.pushState(state, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
