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

const navigationItems = [
  { label: 'Central de Controle', icon: Gauge, active: true },
  { label: 'Saldo e Transações', icon: WalletCards },
  { label: 'Relatórios', icon: BarChart3 },
  { label: 'Página de Doação', icon: HandCoins },
  { label: 'Widgets', icon: LayoutGrid },
  { label: 'Integrações', icon: Plug },
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

function SideBar({ user, theme = 'dark', onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false)
  const [logoutToast, setLogoutToast] = useState(null)
  const userName = user?.name || 'Usuario'
  const userEmail = user?.email || ''
  const userAvatar = user?.avatarUrl
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        const responseText = await response.text()
        let message = 'Nao foi possivel encerrar a sessao.'

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
    } catch (error) {
      setLogoutToast({
        type: 'error',
        title: 'Erro ao sair',
        message: error.message || 'Nao foi possivel encerrar a sessao.',
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
          const href = item.label === 'Widgets' ? '/widgets' : '/dashboard'
          const isActive = currentPath === '/widgets' ? item.label === 'Widgets' : item.active

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
              <span className="user-avatar">
                {userAvatar ? <img src={userAvatar} alt="" /> : userInitials}
              </span>
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
              <span className="user-avatar">
                {userAvatar ? <img src={userAvatar} alt="" /> : userInitials}
              </span>
              <div>
                <strong>{userName}</strong>
                {userEmail ? <span>{userEmail}</span> : null}
              </div>
            </div>

            <DropdownMenuSeparator className="sidebar-user-menu-separator" />

            <DropdownMenuItem
              className="sidebar-user-menu-item"
              onSelect={() => navigate('/settings')}
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
