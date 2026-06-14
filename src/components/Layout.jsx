import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Users, LayoutDashboard, Kanban, Trophy, FileText,
  LogOut, Menu, X, ChevronRight, Bell,
  Crown, Calculator, FolderKanban, Megaphone, TrendingUp,
  PanelLeftClose, PanelLeftOpen, Lock, MessageSquare,
  AlertCircle, FileCheck, Target, CheckCircle, UserCheck,
} from 'lucide-react'
import { ProjepSymbol, ProjepLogoFull } from './ProjepLogo'

// ── Notification data ─────────────────────────────────────────
const DEFAULT_NOTIFS = [
  { id: 1, type: 'message',  read: false, title: 'Daniela Rocha',      desc: 'Sua avaliação do mês saiu. Resultados ótimos!',         time: '14:32' },
  { id: 2, type: 'task',     read: false, title: 'Tarefa vencendo hoje',desc: 'Relatório mensal de vendas — prazo: hoje',              time: '11:00' },
  { id: 3, type: 'notice',   read: false, title: 'Novo comunicado',     desc: 'Planejamento semestral — reunião sexta-feira às 18h',   time: '09:15' },
  { id: 4, type: 'contract', read: true,  title: 'Contrato assinado',   desc: 'Delta Corp confirmou assinatura do contrato',          time: 'Ontem'  },
  { id: 5, type: 'system',   read: true,  title: 'Meta de junho',       desc: 'Estamos em 73% da meta mensal — foco no fechamento!',  time: '2 dias' },
]

const NOTIF_ICONS = {
  message:  { Icon: MessageSquare, cls: 'text-blue-400  bg-blue-950/40  border-blue-900/30'    },
  task:     { Icon: AlertCircle,   cls: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/20' },
  notice:   { Icon: Megaphone,     cls: 'text-[#FF882D] bg-[#CE7028]/10  border-[#CE7028]/20'  },
  contract: { Icon: FileCheck,     cls: 'text-green-400 bg-green-950/40  border-green-900/30'  },
  system:   { Icon: Target,        cls: 'text-gray-400  bg-[#1A1A1A]     border-[#1E1E1E]'     },
}

function loadNotifs() {
  try { return JSON.parse(localStorage.getItem('ej_notifications')) || DEFAULT_NOTIFS }
  catch { return DEFAULT_NOTIFS }
}

// ── Sectors ───────────────────────────────────────────────────
const SECTORS = [
  {
    id: 'presidencia', label: 'Presidência', icon: Crown,
    path: null, comingSoon: true, allowedRoles: ['presidente'],
  },
  {
    id: 'admin', label: 'Adm. e Financeiro', icon: Calculator,
    path: null, comingSoon: true, allowedRoles: ['presidente'],
  },
  {
    id: 'comercial', label: 'Comercial', icon: TrendingUp,
    path: '/comercial', comingSoon: false, allowedRoles: ['comercial', 'presidente'],
    subItems: [
      { path: '/comercial',          label: 'Dashboard', icon: LayoutDashboard },
      { path: '/comercial/pipeline', label: 'Pipeline',  icon: Kanban          },
      { path: '/comercial/ranking',  label: 'Ranking',   icon: Trophy          },
      { path: '/comercial/contratos',label: 'Contratos', icon: FileText        },
    ],
  },
  {
    id: 'projetos', label: 'Projetos', icon: FolderKanban,
    path: null, comingSoon: true, allowedRoles: ['presidente'],
  },
  {
    id: 'marketing', label: 'Marketing', icon: Megaphone,
    path: null, comingSoon: true, allowedRoles: ['presidente'],
  },
  {
    id: 'gp', label: 'Gestão de Pessoas', icon: Users,
    path: '/gp', comingSoon: false, allowedRoles: ['gp', 'presidente'],
    subItems: [
      { path: '/gp',               label: 'Dashboard',        icon: LayoutDashboard },
      { path: '/gp/membros',       label: 'Membros',          icon: Users           },
      { path: '/gp/processo',      label: 'Processo Seletivo',icon: FileText        },
      { path: '/gp/aprovacoes',    label: 'Aprovações',       icon: UserCheck       },
    ],
  },
  {
    id: 'chat', label: 'Chat', icon: MessageSquare,
    path: '/chat', comingSoon: false,
    allowedRoles: ['comercial', 'gp', 'presidente'],
  },
]

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

// ── Avatar helper ─────────────────────────────────────────────
function UserAvatar({ photo, avatar, size = 8, className = '' }) {
  return photo ? (
    <img
      src={photo}
      alt="Avatar"
      className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0 ${className}`}
    />
  ) : (
    <div className={`w-${size} h-${size} bg-[#CE7028] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${className}`}>
      {avatar}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function Layout({ children }) {
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const [collapsed,     setCollapsed]     = useState(false)
  const [showNotifs,    setShowNotifs]    = useState(false)
  const [notifications, setNotifications] = useState(loadNotifs)

  const { user, userPhoto, logout } = useAuth()
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

  // Listen for new notifications dispatched by Chat, Register, etc.
  useEffect(() => {
    const handler = (e) => {
      const notif = e.detail
      if (!notif) return
      setNotifications(prev => {
        if (prev.some(n => n.id === notif.id)) return prev
        const updated = [notif, ...prev]
        localStorage.setItem('ej_notifications', JSON.stringify(updated))
        return updated
      })
    }
    window.addEventListener('ej:notification', handler)
    return () => window.removeEventListener('ej:notification', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem('ej_notifications', JSON.stringify(updated))
  }

  const markRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    setNotifications(updated)
    localStorage.setItem('ej_notifications', JSON.stringify(updated))
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const activeSector = SECTORS.find(s => s.path && location.pathname.startsWith(s.path))

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 h-full bg-[#044947] z-30 flex flex-col transition-all duration-300 ease-in-out transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${collapsed ? 'w-[68px]' : 'w-64'}`}>

        {/* Logo header */}
        <div className={`flex items-center border-b border-white/10 h-[64px] flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}>
          {collapsed ? (
            <ProjepSymbol size={28} color="#CE7028" />
          ) : (
            <>
              <div className="flex-1 min-w-0"><ProjepLogoFull size="sm" /></div>
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
              const hasAccess = sector.allowedRoles.includes(user?.role)
              const isActive = activeSector?.id === sector.id
              const isDisabled = sector.comingSoon || !hasAccess

              const sectorRow = (
                <div className={`
                  flex items-center transition-all duration-150 select-none
                  ${collapsed ? 'justify-center w-10 h-10 mx-auto rounded' : 'gap-3 px-3 py-2.5 rounded'}
                  ${isActive && !isDisabled
                    ? 'bg-[#CE7028] text-white'
                    : isDisabled
                      ? 'text-white/30 cursor-not-allowed'
                      : 'text-white/70 hover:bg-white/10 hover:text-white cursor-pointer'
                  }
                `}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 truncate">{sector.label}</span>
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
                        : <Link to={sector.path} onClick={() => setMobileOpen(false)}><div className="flex justify-center">{sectorRow}</div></Link>
                      }
                    </Tooltip>
                  ) : (
                    isDisabled
                      ? <div>{sectorRow}</div>
                      : <Link to={sector.path} onClick={() => setMobileOpen(false)}>{sectorRow}</Link>
                  )}

                  {!collapsed && isActive && !isDisabled && sector.subItems && (
                    <div className="ml-3 mt-0.5 mb-1 pl-3 border-l border-white/10 space-y-0.5">
                      {sector.subItems.map(item => {
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
              <Tooltip label={`${user?.name} — Ver perfil`}>
                <button onClick={() => navigate('/perfil')} className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-[#CE7028] transition-all">
                  <UserAvatar photo={userPhoto} avatar={user?.avatar} size={9} />
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
                <UserAvatar photo={userPhoto} avatar={user?.avatar} size={8} />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white text-sm font-semibold truncate leading-tight">{user?.name}</p>
                  <p className="text-white/40 text-xs capitalize truncate">
                    {user?.role === 'gp' ? 'Gestão de Pessoas' : user?.role === 'presidente' ? 'Presidente' : user?.role}
                  </p>
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
                          onClick={() => markRead(n.id)}
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
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
