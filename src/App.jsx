import { useEffect, useState } from 'react'
import RegisterPage from './pages/register'
import DashboardPage from './pages/dashboard'
import LoginPage from './pages/login'
import ForgotPasswordPage from './pages/forgot-password'
import ResetPasswordPage from './pages/reset-password'
import SettingsPage from './pages/settings'
import CallbackPage from './pages/callback'
import WidgetsPage from './pages/widgets'

function App() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    function handleRouteChange() {
      setPath(window.location.pathname)
    }

    function handleLinkClick(event) {
      const link = event.target.closest('a')

      if (
        !link ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target ||
        link.hasAttribute('download')
      ) {
        return
      }

      const url = new URL(link.href)

      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) {
        return
      }

      event.preventDefault()
      window.history.pushState(null, '', url.pathname)
      handleRouteChange()
    }

    window.addEventListener('popstate', handleRouteChange)
    document.addEventListener('click', handleLinkClick)

    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  if (path === '/login') {
    return <LoginPage />
  }

  if(path === '/forgot-password') {
    return <ForgotPasswordPage />
  }

  if(path === '/reset-password') {
    return <ResetPasswordPage />
  }

  if (path === '/register') {
    return <RegisterPage />
  }

  if (path === '/dashboard') {
    return <DashboardPage />
  }

  if (path === '/settings') {
    return <SettingsPage />
  }

  if (path === '/widgets') {
    return <WidgetsPage />
  }

  if (path === '/callback') {
    return <CallbackPage />
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <h1>404</h1>
    </main>
  )
}

export default App
