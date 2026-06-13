import { useEffect, useState } from 'react'
import SideBar from '@/components/SideBar'
import { apiFetch, parseApiResponse } from '@/lib/api'
import { redirectToLogin } from '@/lib/keycloak'
import './style.css'

function MainLayout({ children }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dark'
    }

    return window.localStorage.getItem('vikpix-dashboard-theme') || 'dark'
  })

  useEffect(() => {
    window.localStorage.setItem('vikpix-dashboard-theme', theme)
  }, [theme])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUser() {
      try {
        const response = await apiFetch('/auth/me', {
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
          signal: controller.signal,
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            redirectToLogin()
            return
          }

          throw new Error('Nao foi possivel buscar o usuario.')
        }

        const data = await parseApiResponse(response)

        setUser(data?.user || data)
        setReady(true)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setUser(null)
          setReady(true)
        }
      }
    }

    fetchUser()

    return () => controller.abort()
  }, [])

  if (!ready) {
    return null
  }

  return (
    <div className={`main-layout ${theme === 'light' ? 'is-light' : 'is-dark'}`}>
      <SideBar
        theme={theme}
        user={user}
        onToggleTheme={() => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')}
      />
      <main className="main-layout-content">
        {typeof children === 'function' ? children({ user }) : children}
      </main>
    </div>
  )
}

export default MainLayout
