import { useEffect, useState } from 'react'
import {
  BarChart3,
  Gauge,
  HandCoins,
  LayoutGrid,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Settings,
  Sun,
  WalletCards,
  ChevronsUpDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AuthToast from '@/components/AuthToast'
import { navigate } from '@/lib/navigation'
import SideBarTooltip from './SideBarTooltip'
import './style.css'

const apiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080/api'

const navigationItems = [
  { label: 'Central de Controle', icon: Gauge, href: '/dashboard' },
  { label: 'Saldo e Transações', icon: WalletCards, href: '/dashboard' },
  { label: 'Relatórios', icon: BarChart3, href: '/dashboard' },
  { label: 'Página de Doação', icon: HandCoins, href: '/donation-page' },
  { label: 'Widgets', icon: LayoutGrid, href: '/widgets' },
  { label: 'Integrações', icon: Plug, href: '/dashboard' },
]
function getInitials(name) {
  if (!name) {
    return 'U'
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
function getAvatarUrl(user) {
  return user?.avatarUrl || user?.picture || user?.avatar || user?.imageUrl || ''
}

function UserAvatar({ src, initials }) {
  const [imageFailed, setImageFailed] = useState(false)


  return (
    <span className="user-avatar">
      {src && !imageFailed ? (
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  )
}
async function requestLogout() {
  return fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

async function refreshSession() {
  const response = await fetch(`${apiUrl}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  return response.ok
}

function SideBar({ user, theme = 'dark', onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false)
  const [logoutToast, setLogoutToast] = useState(null)
  const userName = user?.name || 'Usuario'
  const userEmail = user?.email || ''
  const userAvatar = getAvatarUrl(user)
  const userInitials = getInitials(userName)
  const isLight = theme === 'light'
  const ThemeIcon = isLight ? Moon : Sun
  const themeLabel = isLight ? 'Modo escuro' : 'Modo claro'
  const currentPath = window.location.pathname

  useEffect(() => {
    if (!logoutToast) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      setLogoutToast(null)
    }, 2000)

    return () => window.clearTimeout(timeout)
  }, [logoutToast])

  async function handleLogout() {
    try {
      let response = await requestLogout()

      if (response.status === 401) {
        const refreshed = await refreshSession()

        if (refreshed) {
          response = await requestLogout()
        }
      }

      if (!response.ok) {
        const responseText = await response.text()
        let message = 'NÃ£o foi possÃ­vel encerrar a sessÃ£o.'

        if (responseText) {
          try {
            message = JSON.parse(responseText)?.message || message
          } catch {
            message = responseText
          }
        }

        throw new Error(message)
      }

      setLogoutToast({
        type: 'success',
        title: 'Sessao encerrada',
        message: 'Voce saiu da sua conta.',
      })

      window.setTimeout(() => {
        navigate('/login')
      }, 700)
    } catch {
      setLogoutToast({
        type: 'error',
        title: 'Erro ao sair',
        message: 'NÃ£o foi possÃ­vel encerrar a sessÃ£o.',
      })
    }
  }

  return (
    <>
      <AuthToast
        type={logoutToast?.type}
        title={logoutToast?.title}
        message={logoutToast?.message}
      />

      <aside
        className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}
        aria-label="Navegacao principal"
      >
      <div className="sidebar-brand">
        <SideBarTooltip label="Expandir menu">
          <button
            className="sidebar-logo-button"
            type="button"
            onClick={() => collapsed && setCollapsed(false)}
            aria-label={collapsed ? 'Expandir menu' : 'Pagina inicial'}
          >
            <span className="sidebar-logo" aria-hidden="true">
              <img src="/logo-sem-fundo.png" alt="" />
            </span>
            <PanelLeftOpen className="sidebar-open-icon" aria-hidden="true" />
          </button>
        </SideBarTooltip>

        <strong>VikPix</strong>

        <button
          className="sidebar-collapse"
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Recolher menu"
        >
          <PanelLeftClose />
        </button>
      </div>

      <nav className="sidebar-nav">
        <p>VikPix</p>
        {navigationItems.map((item) => {
          const Icon = item.icon
          const href = item.href
          const isActive = currentPath === href || (currentPath === '/' && href === '/dashboard')

          return (
            <SideBarTooltip label={item.label} key={item.label}>
              <a
                className={`sidebar-link ${isActive ? 'is-active' : ''}`}
                href={href}
              >
                <Icon />
                <span>{item.label}</span>
              </a>
            </SideBarTooltip>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          className="theme-button"
          type="button"
          onClick={onToggleTheme}
          title={collapsed ? themeLabel : undefined}
        >
          <ThemeIcon />
          <span>{themeLabel}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="user-button" type="button" title={collapsed ? userName : undefined}>
              <UserAvatar key={`avatar-${userAvatar || userInitials}`} src={userAvatar} initials={userInitials} />
              <strong>{userName}</strong>
              <ChevronsUpDown />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className={`sidebar-user-menu ${isLight ? 'is-light' : ''}`}
            side="top"
            sideOffset={8}
          >
            <div className="sidebar-user-menu-header">
              <UserAvatar key={`avatar-${userAvatar || userInitials}`} src={userAvatar} initials={userInitials} />
              <div>
                <strong>{userName}</strong>
                {userEmail ? <span>{userEmail}</span> : null}
              </div>
            </div>

            <DropdownMenuSeparator className="sidebar-user-menu-separator" />

            <DropdownMenuItem
              className="sidebar-user-menu-item"
              onSelect={() => navigate('/settings/profile')}
            >
              <Settings className="settings-icon" />
              <span>Configurações</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="sidebar-user-menu-separator" />

            <DropdownMenuItem className="sidebar-user-menu-item" onSelect={handleLogout}>
              <LogOut className="logout-icon" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </aside>
    </>
  )
}

export default SideBar
