import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  ACCESS_MODULES,
  getDefaultPath,
  hasModuleAccess,
  hasPathAccess,
  hasSubareaAccess,
} from '../config/accessControl'
import {
  Users, LayoutDashboard, Kanban, Trophy, FileText,
  LogOut, Menu, X, ChevronRight, Bell, Lock,
  Crown, Calculator, FolderKanban, Megaphone, TrendingUp,
  PanelLeftClose, PanelLeftOpen, MessageSquare, Shield,
  AlertCircle, FileCheck, Target, CheckCircle, UserCheck, CalendarDays,
  Sun, Moon,
} from 'lucide-react'
import ProjepLogo, { ProjepSymbol } from './ProjepLogo'
import UserAvatar from './UserAvatar'

const ICONS = {
  crown: Crown,
  calculator: Calculator,
  'folder-kanban': FolderKanban,
  megaphone: Megaphone,
  'trending-up': TrendingUp,
  users: Users,
  'message-square': MessageSquare,
  shield: Shield,
  dashboard: LayoutDashboard,
  kanban: Kanban,
  calendar: CalendarDays,
  trophy: Trophy,
  'file-text': FileText,
  'user-check': UserCheck,
}

const NOTIF_ICONS = {
  mensagem:  { Icon: MessageSquare, cls: 'text-blue-400  bg-blue-950/40  border-blue-900/30'    },
  message:   { Icon: MessageSquare, cls: 'text-blue-400  bg-blue-950/40  border-blue-900/30'    },
  aprovacao: { Icon: UserCheck,     cls: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/20'},
  task:      { Icon: AlertCircle,   cls: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/20'},
  aviso:     { Icon: Megaphone,     cls: 'text-[#FF882D] bg-[#CE7028]/10  border-[#CE7028]/20' },
  notice:    { Icon: Megaphone,     cls: 'text-[#FF882D] bg-[#CE7028]/10  border-[#CE7028]/20' },
  contract:  { Icon: FileCheck,     cls: 'text-green-400 bg-green-950/40  border-green-900/30' },
  sistema:   { Icon: Target,        cls: 'text-gray-400  bg-[#1A1A1A]     border-[#1E1E1E]'    },
  system:    { Icon: Target,        cls: 'text-gray-400  bg-[#1A1A1A]     border-[#1E1E1E]'    },
}

const SECTORS = ACCESS_MODULES.map(module => ({
  id: module.key,
  label: module.label,
  icon: ICONS[module.icon],
  path: module.path,
  comingSoon: !module.available,
  subItems: module.subareas.map(subarea => ({
    ...subarea,
    icon: ICONS[subarea.icon],
  })),
}))

const idsEqual = (a, b) => String(a ?? '') === String(b ?? '')

// ── Tooltip ───────────────────────────────────────────────────
function Tooltip({ label, children }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-[#111111] border border-[#2A2A2A] text-white text-xs font-medium px-2.5 py-1.5 rounded whitespace-nowrap shadow-xl">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2A2A2A]" />
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function Layout({ children }) {
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [collapsed,     setCollapsed]     = useState(false)
  const [showNotifs,    setShowNotifs]    = useState(false)

  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const {
    notifications: storedNotifications,
    messages: storedMessages,
    markNotificationRead,
    markAllNotificationsRead,
  } = useData()
  const location  = useLocation()
  const navigate  = useNavigate()
  const bellRef   = useRef(null)
  const notifRef  = useRef(null)

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        notifRef.current && !notifRef.current.contains(e.target) &&
        bellRef.current  && !bellRef.current.contains(e.target)
      ) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const notifications = storedNotifications
    .filter(notification => {
      const isRecipient = notification.usuarioId == null || idsEqual(notification.usuarioId, user?.id)
      const matchesAudience = notification.audiencia !== 'diretoria' || ['presidente', 'diretor'].includes(user?.role)
      const matchesModule = !notification.modulo || hasModuleAccess(user, notification.modulo)
      const systemEnabled = user?.preferenciasNotificacao?.system !== false
      const isDirectMessage = notification.tipo === 'mensagem'
      return isRecipient && matchesAudience && matchesModule && (systemEnabled || isDirectMessage)
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(notification => ({
      id: notification.id,
      type: notification.tipo,
      read: notification.usuarioId == null
        ? (notification.lidosPor || []).some(id => idsEqual(id, user?.id))
        : notification.lida,
      title: notification.titulo,
      desc: notification.descricao,
      time: new Date(notification.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      link: notification.link,
    }))

  const markAllRead = () => markAllNotificationsRead(user?.id)
  const markRead = notification => {
    markNotificationRead(notification.id, user?.id)
    if (notification.link) {
      const pathname = notification.link.split('?')[0]
      navigate(hasPathAccess(user, pathname) ? notification.link : getDefaultPath(user))
    }
    setShowNotifs(false)
  }
  const unreadCount = notifications.filter(n => !n.read).length
  const chatUnreadCount = (storedMessages || []).filter(message => {
    if (!user?.id || idsEqual(message.remetenteId, user.id)) return false

    if (idsEqual(message.destinatarioId, user.id)) {
      return !message.lida
    }

    if (message.destinatarioId === 'avisos') {
      return !(message.lidosPor || []).some(id => idsEqual(id, user.id))
    }

    return false
  }).length
  const activeSector = SECTORS.find(s => s.path && location.pathname.startsWith(s.path))

  return (
    <div className="app-shell min-h-screen bg-[#0A0A0A] flex">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`app-sidebar fixed top-0 left-0 h-full bg-[#044947] z-30 flex flex-col transition-all duration-300 ease-in-out transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${collapsed ? 'w-[68px]' : 'w-64'}`}>

        {/* Logo header */}
        <div className={`flex items-center border-b border-white/10 h-[64px] flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
          {collapsed ? (
            <ProjepSymbol width={30} height={48} />
          ) : (
            <>
              <div className="flex-1 min-w-0"><ProjepLogo width={140} height={88} textColor="#FFFFFF" className="max-h-[54px] w-auto" /></div>
              <button onClick={() => setCollapsed(true)} className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0" title="Minimizar">
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <button onClick={() => setCollapsed(false)} className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          {!collapsed && <p className="text-[10px] text-white/30 uppercase tracking-widest px-4 mb-3 font-semibold">Setores</p>}
          <div className={`space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
            {SECTORS.map(sector => {
              const Icon = sector.icon
              const hasAccess = hasModuleAccess(user, sector.id)
              const isActive = activeSector?.id === sector.id
              const isDisabled = sector.comingSoon || !hasAccess
              const visibleSubItems = sector.subItems?.filter(item => hasSubareaAccess(user, item.key)) || []
              const destination = visibleSubItems[0]?.path || sector.path

              const sectorRow = (
                <div className={`
                  relative flex items-center transition-all duration-150 select-none
                  ${collapsed ? 'justify-center w-10 h-10 mx-auto rounded' : 'gap-3 px-3 py-2.5 rounded'}
                  ${isActive && !isDisabled
                    ? 'bg-[#CE7028] text-white'
                    : isDisabled
                      ? 'text-white/30 cursor-not-allowed'
                      : 'text-white/70 hover:bg-white/10 hover:text-white cursor-pointer'
                  }
                `}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {collapsed && sector.id === 'chat' && chatUnreadCount > 0 && !isDisabled && (
                    <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-emerald-400 text-[#044947] text-[9px] font-extrabold flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.55)]">
                      {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                    </span>
                  )}
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 truncate">{sector.label}</span>
                      {sector.id === 'chat' && chatUnreadCount > 0 && !isDisabled && (
                        <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-emerald-400 text-[#044947] text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.45)]">
                          {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                        </span>
                      )}
                      {sector.comingSoon && (
                        <span className="text-[10px] font-semibold bg-white/10 text-white/40 px-1.5 py-0.5 rounded flex-shrink-0 leading-none">Em breve</span>
                      )}
                      {!hasAccess && !sector.comingSoon && <Lock className="w-3 h-3 text-white/20 flex-shrink-0" />}
                      {isActive && !isDisabled && <ChevronRight className="w-3 h-3 flex-shrink-0 text-white/70" />}
                    </>
                  )}
                </div>
              )

              return (
                <div key={sector.id}>
                  {collapsed ? (
                    <Tooltip label={`${sector.label}${sector.comingSoon ? ' — Em breve' : ''}`}>
                      {isDisabled
                        ? <div className="flex justify-center">{sectorRow}</div>
                        : <Link to={destination} onClick={() => setMobileOpen(false)}><div className="flex justify-center">{sectorRow}</div></Link>
                      }
                    </Tooltip>
                  ) : (
                    isDisabled
                      ? <div>{sectorRow}</div>
                      : <Link to={destination} onClick={() => setMobileOpen(false)}>{sectorRow}</Link>
                  )}

                  {!collapsed && isActive && !isDisabled && visibleSubItems.length > 0 && (
                    <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-white/10 space-y-0.5">
                      {visibleSubItems.map(item => {
                        const SubIcon = item.icon
                        const subActive = location.pathname === item.path
                        return (
                          <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-all ${subActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                          >
                            <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={`border-t border-white/10 flex-shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Tooltip label={`${user?.nome} — Ver perfil`}>
                <button onClick={() => navigate('/perfil')} className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-[#CE7028] transition-all">
                  <UserAvatar user={user} size={36} textClassName="text-xs" />
                </button>
              </Tooltip>
              <Tooltip label="Sair">
                <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <>
              <button onClick={() => navigate('/perfil')} className="w-full flex items-center gap-3 mb-2 px-2 py-2 rounded hover:bg-white/10 transition-all group">
                <UserAvatar user={user} size={32} textClassName="text-xs" />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-sm font-semibold truncate leading-tight">{user?.nome}</p>
                  <p className="text-white/40 text-xs truncate">{user?.cargo}</p>
                </div>
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-white/50 hover:bg-white/10 hover:text-white transition-all">
                <LogOut className="w-4 h-4" />Sair
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}>

        {/* Header */}
        <header className="sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1E1E1E] z-10 px-6 flex items-center justify-between h-[64px]">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded text-gray-500 hover:text-white hover:bg-[#1E1E1E] transition-all">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {activeSector && (
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <span className="text-gray-500">{activeSector.label}</span>
                {activeSector.subItems && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
                    <span className="text-gray-300 font-medium">
                      {activeSector.subItems.find(s => s.path === location.pathname)?.label || ''}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded border border-[#1E1E1E] bg-[#111111] text-gray-400 hover:text-white hover:border-[#CE7028]/60 hover:bg-[#161616] transition-all"
              title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#CE7028]" /> : <Moon className="w-4 h-4 text-[#044947]" />}
              <span className="hidden sm:inline text-xs font-semibold">
                {theme === 'dark' ? 'Claro' : 'Escuro'}
              </span>
            </button>

            {/* Bell */}
            <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setShowNotifs(v => !v)}
              className="p-2 rounded text-gray-500 hover:text-white hover:bg-[#1E1E1E] transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification panel */}
            {showNotifs && (
              <div ref={notifRef} className="absolute right-0 top-full mt-2 w-80 bg-[#111111] border border-[#1E1E1E] rounded-md shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E]">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-[#FF882D] hover:text-[#CE7028] font-semibold uppercase tracking-wider transition-colors">
                      Marcar todas lidas
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-8">Nenhuma notificação</p>
                  ) : (
                    notifications.map(n => {
                      const config = NOTIF_ICONS[n.type] || NOTIF_ICONS.system
                      const NIcon = config.Icon
                      return (
                        <div
                          key={n.id}
                          onClick={() => markRead(n)}
                          className={`flex items-start gap-3 px-4 py-3.5 border-b border-[#1E1E1E]/50 hover:bg-white/3 transition-colors cursor-pointer ${!n.read ? 'bg-[#CE7028]/3' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${config.cls}`}>
                            <NIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-semibold truncate ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.title}</p>
                              <span className="text-[10px] text-gray-600 flex-shrink-0">{n.time}</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 bg-[#CE7028] rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                      )
                    })
                  )}
                </div>

                {unreadCount === 0 && notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-[#1E1E1E]">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Todas as notificações foram lidas
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
