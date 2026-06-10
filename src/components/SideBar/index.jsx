import { useState } from 'react'
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
import { logout } from '@/lib/api'
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

function SideBar({ user }) {
  const [collapsed, setCollapsed] = useState(false)
  const userName = user?.userName || user?.username || user?.name || 'Usuario'
  const userEmail = user?.email || ''
  const userAvatar = user?.avatar || user?.avatarUrl || user?.avatar_url || ''
  const userInitials = getInitials(userName)

  async function handleLogout() {
    await logout()
    window.location.assign('/login')
  }

  return (
    <aside
      className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Navegacao principal"
    >
      <div className="sidebar-brand">
        <button
          className="sidebar-logo-button"
          type="button"
          onClick={() => collapsed && setCollapsed(false)}
          aria-label={collapsed ? 'Expandir menu' : 'Pagina inicial'}
        >
          <span className="sidebar-logo" aria-hidden="true">
            <span></span>
            <span></span>
          </span>
          <PanelLeftOpen className="sidebar-open-icon" aria-hidden="true" />
        </button>

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

          return (
            <a
              className={`sidebar-link ${item.active ? 'is-active' : ''}`}
              href="/dashboard"
              key={item.label}
              title={collapsed ? item.label : undefined}
            >
              <Icon />
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-button" type="button" title={collapsed ? 'Modo claro' : undefined}>
          <Moon />
          <span>Modo claro</span>
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
            className="sidebar-user-menu"
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
              onSelect={() => window.location.assign('/settings')}
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
  )
}

export default SideBar
