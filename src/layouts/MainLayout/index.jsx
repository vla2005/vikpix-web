import { useEffect, useState } from 'react'
import SideBar from '@/components/SideBar'
import { apiFetch, parseApiResponse } from '@/lib/api'
import './style.css'

function MainLayout({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUser() {
      try {
        const response = await apiFetch('/auth/me', {
          headers: {
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Nao foi possivel buscar o usuario.')
        }

        const data = await parseApiResponse(response)

        setUser(data?.user || data)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setUser(null)
        }
      }
    }

    fetchUser()

    return () => controller.abort()
  }, [])

  return (
    <div className="main-layout">
      <SideBar user={user} />
      <main className="main-layout-content">{children}</main>
    </div>
  )
}

export default MainLayout
