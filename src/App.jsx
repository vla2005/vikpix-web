import RegisterPage from './pages/register'
import DashboardPage from './pages/dashboard'
import LoginPage from './pages/login'
import SettingsPage from './pages/settings'

function App() {
  if (window.location.pathname === '/login') {
    return <LoginPage />
  }

  if (window.location.pathname === '/register') {
    return <RegisterPage />
  }

  if (window.location.pathname === '/dashboard') {
    return <DashboardPage />
  }

  if (window.location.pathname === '/settings') {
    return <SettingsPage />
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <h1>404</h1>
    </main>
  )
}

export default App
