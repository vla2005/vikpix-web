import { useEffect, useState } from 'react'
import RegisterPage from './pages/register'
import DashboardPage from './pages/dashboard'
import LoginPage from './pages/login'
import ForgotPasswordPage from './pages/forgot-password'
import ResetPasswordPage from './pages/reset-password'
import ProfileSettingsPage from './pages/settings/profile'
import PasswordSettingsPage from './pages/settings/password'
import TwoFactorSettingsPage from './pages/settings/two-factor'
import WidgetsPage from './pages/widgets'
import ConfirmPasswordPage from './pages/confirm-password'
import EmbedPage from './pages/embed'
import DonationPage from './pages/donation-page'
import PublicDonationPage from './pages/public-donation'

function App() {
  const [route, setRoute] = useState(() => ({
    path: window.location.pathname,
    key: 0,
  }))
  const path = route.path

  useEffect(() => {
    function handleRouteChange() {
      setRoute((currentRoute) => ({
        path: window.location.pathname,
        key: currentRoute.key + 1,
      }))
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

      const nextPath = `${url.pathname}${url.search}`
      const currentPath = `${window.location.pathname}${window.location.search}`

      if (url.origin !== window.location.origin || nextPath === currentPath) {
        return
      }

      event.preventDefault()
      window.history.pushState(null, '', nextPath)
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
    window.history.replaceState(null, '', '/settings/profile')
    return <ProfileSettingsPage />
  }

  if (path === '/settings/two-factor' && window.history.state?.confirmedPassword !== true) {
    sessionStorage.setItem('vikpix_confirm_password_next', '/settings/two-factor')
    window.history.replaceState({ guardedPath: '/settings/two-factor' }, '', '/user/confirm-password?next=/settings/two-factor')
    return <ConfirmPasswordPage />
  }

  if (path === '/settings/two-factor') {
    return <TwoFactorSettingsPage />
  }

  if (path === '/settings/profile') {
    return <ProfileSettingsPage />
  }

  if (path === '/settings/password') {
    return <PasswordSettingsPage />
  }

  if (path === '/user/confirm-password') {
    return <ConfirmPasswordPage />
  }

  if (path === '/widgets') {
    return <WidgetsPage />
  }

  if (path === '/donation-page') {
    return <DonationPage />
  }

  if (path.startsWith('/embed/')) {
    const token = decodeURIComponent(path.replace('/embed/', '').split('/')[0] || '')
    return <EmbedPage token={token} />
  }

  const singlePublicSegment = path.split('/').filter(Boolean)

  if (singlePublicSegment.length === 1) {
    return <PublicDonationPage userName={decodeURIComponent(singlePublicSegment[0])} />
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <h1>404</h1>
    </main>
  )
}

export default App
