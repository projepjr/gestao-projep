import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ChevronLeft,
  User,
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  KeyRound,
} from 'lucide-react'
import ProjepLogo from '../components/ProjepLogo'
import { SETOR_OPTIONS } from '../data/setores'
import { getDefaultPath } from '../config/accessControl'

const INPUT = 'w-full bg-black/30 border border-white/[0.08] rounded px-10 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#CE7028]/80 focus:bg-black/40 transition-all'
const INPUT_ICON = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none'
const BTN_PRIMARY = 'w-full bg-[#CE7028] hover:bg-[#DD7A31] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(206,112,40,0.18)] hover:shadow-[0_14px_36px_rgba(206,112,40,0.28)] hover:-translate-y-0.5'
const BTN_GHOST = 'text-[#FF882D] hover:text-[#CE7028] text-sm font-medium transition-colors'
const LABEL = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'
function hasRecoveryLink() {
  if (typeof window === 'undefined') return false
  const search = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return (
    search.get('reset') === '1' ||
    search.get('type') === 'recovery' ||
    hash.get('type') === 'recovery' ||
    hash.has('access_token') ||
    search.has('code')
  )
}

function LeftPanel() {
  return (
    <div className="login-enter flex min-h-[420px] lg:min-h-[620px] flex-col items-center justify-center relative">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#044947]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-44 h-44 bg-[#CE7028]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex w-full items-center justify-center text-center">
        <div className="projep-logo-stage">
          <span className="projep-logo-halo" aria-hidden="true" />
          <span className="projep-logo-orbit projep-logo-orbit-a" aria-hidden="true" />
          <span className="projep-logo-orbit projep-logo-orbit-b" aria-hidden="true" />
          <ProjepLogo width={440} height={278} textColor="#FFFFFF" animated className="relative z-10 w-[300px] sm:w-[390px] lg:w-[440px] h-auto" />
        </div>
      </div>
    </div>
  )
}

function Alert({ type, msg }) {
  if (!msg) return null
  const isError = type === 'error'
  return (
    <div className={`flex items-center gap-2 rounded px-3 py-2.5 text-sm ${isError ? 'bg-red-950/50 border border-red-900/50 text-red-400' : 'bg-green-950/40 border border-green-900/40 text-green-400'}`}>
      {isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  )
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
      <ChevronLeft className="w-4 h-4" /> Voltar ao login
    </button>
  )
}

export default function Login() {
  const { login, register, requestPasswordReset, confirmPasswordReset } = useAuth()
  const navigate = useNavigate()

  const [view, setView] = useState(() => hasRecoveryLink() ? 'reset' : 'login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [reg, setReg] = useState({ name: '', email: '', password: '', confirm: '', department: '', jobTitle: '' })
  const setR = key => event => setReg(prev => ({ ...prev, [key]: event.target.value }))

  const [pendingUser, setPendingUser] = useState(null)
  const [resetEmail, setResetEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [newPassConf, setNewPassConf] = useState('')

  const go = nextView => {
    setView(nextView)
    setError('')
    setSuccess('')
  }

  const handleLogin = async event => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(loginEmail, loginPassword)
    setLoading(false)

    if (result.success) {
      navigate(getDefaultPath(result.user))
    } else if (result.status === 'pendente') {
      setPendingUser(result.user)
      go('pending')
    } else {
      setError(result.error)
    }
  }

  const demoLogin = email => {
    setLoginEmail(email)
    setLoginPassword('123456')
  }

  const handleRegister = async event => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!reg.name.trim()) return setError('Informe seu nome completo')
    if (reg.password !== reg.confirm) return setError('As senhas não coincidem')
    if (reg.password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres')
    if (!reg.department) return setError('Selecione um setor')

    setLoading(true)
    const result = await register(reg)
    setLoading(false)

    if (result.success) {
      setPendingUser(result.user)
      go('pending')
    } else {
      setError(result.error)
    }
  }

  const handleForgot = async event => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    const result = await requestPasswordReset(resetEmail)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }
    setSuccess('Se este email estiver cadastrado e ativo, voce recebera um link de recuperacao em breve.')
  }

  const handleReset = async event => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (newPass !== newPassConf) return setError('As senhas não coincidem')
    if (newPass.length < 6) return setError('A senha deve ter pelo menos 6 caracteres')

    setLoading(true)
    const result = await confirmPasswordReset(newPass)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setNewPass('')
    setNewPassConf('')
    go('login')
    setSuccess('Senha alterada com sucesso! Entre com sua nova senha.')
    window.history.replaceState({}, document.title, '/login')
  }

  const renderLogin = () => (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold tracking-tight">Acesso ao sistema</h1>
        <p className="text-gray-500 text-sm mt-1">Entre com suas credenciais</p>
      </div>

      <Alert type="success" msg={success} />

      <form onSubmit={handleLogin} className="space-y-4 mt-4">
        <div>
          <label className={LABEL}>Email</label>
          <div className="relative">
            <Mail className={INPUT_ICON} />
            <input type="email" value={loginEmail} onChange={event => setLoginEmail(event.target.value)} placeholder="seu@email.com" required className={INPUT} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Senha</label>
          <div className="relative">
            <Lock className={INPUT_ICON} />
            <input type={showPass ? 'text' : 'password'} value={loginPassword} onChange={event => setLoginPassword(event.target.value)} placeholder="••••••••" required className={`${INPUT} pr-12`} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={() => go('forgot')} className={`${BTN_GHOST} text-xs`}>
            Esqueci minha senha
          </button>
        </div>

        <Alert type="error" msg={error} />

        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? <Spinner /> : 'Entrar'}
        </button>
      </form>

      <div className="mt-5 text-center">
        <span className="text-gray-600 text-sm">Não tem conta? </span>
        <button onClick={() => go('register')} className={BTN_GHOST}>Criar conta</button>
      </div>

      <div className="mt-8 pt-6 border-t border-[#1E1E1E]">
        <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider font-semibold">Acesso rápido - Demo</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Comercial', email: 'ana.silva@projep.com.br' },
            { label: 'GP', email: 'bruno.costa@projep.com.br' },
            { label: 'Presidente', email: 'felipedaniel.wk@gmail.com' },
          ].map(item => (
            <button key={item.label} onClick={() => demoLogin(item.email)} className="text-xs bg-[#111111] hover:bg-[#1A1A1A] border border-[#1E1E1E] hover:border-[#CE7028]/40 text-gray-500 hover:text-[#FF882D] rounded py-2 px-2 transition-all">
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderRegister = () => (
    <div className="w-full max-w-sm">
      <BackBtn onClick={() => go('login')} />
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-gray-500 text-sm mt-1">Preencha os dados para solicitar acesso</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className={LABEL}>Nome completo</label>
          <div className="relative">
            <User className={INPUT_ICON} />
            <input type="text" value={reg.name} onChange={setR('name')} placeholder="Seu nome completo" required className={INPUT} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Email</label>
          <div className="relative">
            <Mail className={INPUT_ICON} />
            <input type="email" value={reg.email} onChange={setR('email')} placeholder="seu@email.com" required className={INPUT} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Senha</label>
            <div className="relative">
              <Lock className={INPUT_ICON} />
              <input type="password" value={reg.password} onChange={setR('password')} placeholder="••••••" required className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Confirmar</label>
            <div className="relative">
              <Lock className={INPUT_ICON} />
              <input type="password" value={reg.confirm} onChange={setR('confirm')} placeholder="••••••" required className={INPUT} />
            </div>
          </div>
        </div>

        <div>
          <label className={LABEL}>Setor</label>
          <div className="relative">
            <Building className={INPUT_ICON} />
            <select value={reg.department} onChange={setR('department')} required className={`${INPUT} appearance-none`}>
              <option value="">Selecione o setor</option>
              {SETOR_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL}>Cargo</label>
          <div className="relative">
            <Briefcase className={INPUT_ICON} />
            <input type="text" value={reg.jobTitle} onChange={setR('jobTitle')} placeholder="Ex: Analista Comercial" className={INPUT} />
          </div>
        </div>

        <Alert type="error" msg={error} />

        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? <Spinner /> : 'Solicitar acesso'}
        </button>
      </form>

      <p className="text-center text-gray-600 text-sm mt-5">
        Já tem conta? <button onClick={() => go('login')} className={BTN_GHOST}>Entrar</button>
      </p>
    </div>
  )

  const renderForgot = () => (
    <div className="w-full max-w-sm">
      <BackBtn onClick={() => go('login')} />
      <div className="mb-8">
        <KeyRound className="w-10 h-10 text-[#CE7028] mb-4" />
        <h1 className="text-white text-2xl font-bold tracking-tight">Recuperar senha</h1>
        <p className="text-gray-500 text-sm mt-1">Informe seu email para receber o link de recuperacao</p>
      </div>

      <Alert type="success" msg={success} />

      <form onSubmit={handleForgot} className="space-y-4 mt-4">
        <div>
          <label className={LABEL}>Email cadastrado</label>
          <div className="relative">
            <Mail className={INPUT_ICON} />
            <input type="email" value={resetEmail} onChange={event => setResetEmail(event.target.value)} placeholder="seu@email.com" required className={INPUT} />
          </div>
        </div>
        <Alert type="error" msg={error} />
        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? <Spinner /> : 'Enviar link de recuperacao'}
        </button>
      </form>
    </div>
  )

  const renderReset = () => (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <CheckCircle className="w-10 h-10 text-green-400 mb-4" />
        <h1 className="text-white text-2xl font-bold tracking-tight">Nova senha</h1>
        <p className="text-gray-500 text-sm mt-1">Crie uma senha forte para sua conta</p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className={LABEL}>Nova senha</label>
          <div className="relative">
            <Lock className={INPUT_ICON} />
            <input type="password" value={newPass} onChange={event => setNewPass(event.target.value)} placeholder="Minimo 6 caracteres" required className={INPUT} />
          </div>
        </div>
        <div>
          <label className={LABEL}>Confirmar nova senha</label>
          <div className="relative">
            <Lock className={INPUT_ICON} />
            <input type="password" value={newPassConf} onChange={event => setNewPassConf(event.target.value)} placeholder="Repita a senha" required className={INPUT} />
          </div>
        </div>
        <Alert type="error" msg={error} />
        <button type="submit" disabled={loading} className={BTN_PRIMARY}>
          {loading ? <Spinner /> : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )

  const renderPending = () => (
    <div className="w-full max-w-sm text-center">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#CE7028]/15 border-2 border-[#CE7028]/30 flex items-center justify-center mb-5">
          <Clock className="w-10 h-10 text-[#CE7028]" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-2">Cadastro em analise</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Ola, <span className="text-white font-semibold">{pendingUser?.nome || 'membro'}</span>!
          <br /><br />
          Seu cadastro foi recebido com sucesso e esta aguardando aprovacao da diretoria da PROJEP.
          Assim que liberado, voce recebera acesso completo ao sistema.
        </p>
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4 mb-6 text-left">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Aguardando aprovacao</span>
        </div>
        <div className="space-y-1.5 text-sm">
          {pendingUser?.nome && <p className="text-gray-400"><span className="text-gray-600">Nome:</span> {pendingUser.nome}</p>}
          {pendingUser?.email && <p className="text-gray-400"><span className="text-gray-600">Email:</span> {pendingUser.email}</p>}
          {pendingUser?.setor && <p className="text-gray-400"><span className="text-gray-600">Setor:</span> {pendingUser.setor}</p>}
        </div>
      </div>

      <button onClick={() => go('login')} className={BTN_PRIMARY}>
        <ChevronLeft className="w-4 h-4" /> Voltar ao login
      </button>
    </div>
  )

  const renderRight = () => {
    if (view === 'register') return renderRegister()
    if (view === 'forgot') return renderForgot()
    if (view === 'reset') return renderReset()
    if (view === 'pending') return renderPending()
    return renderLogin()
  }

  return (
    <div className="min-h-screen bg-[#021F1E] relative overflow-hidden">
      <div className="absolute inset-0 login-grid-pattern opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_45%,rgba(4,73,71,0.86)_0%,rgba(3,55,53,0.76)_24%,rgba(1,30,29,0.94)_58%,rgba(0,9,9,0.99)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.05)_34%,rgba(0,0,0,0.66)_72%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />
      <div className="absolute -top-[28rem] left-1/2 -translate-x-1/2 w-[70rem] h-[70rem] rounded-full border border-white/[0.07] pointer-events-none" />
      <div className="absolute -top-52 -left-36 w-[38rem] h-[38rem] rounded-full bg-[#0C706A]/26 blur-[135px] pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[32rem] h-[32rem] rounded-full bg-[#012B2A]/55 blur-[115px] pointer-events-none" />
      <div className="absolute -bottom-72 -right-40 w-[42rem] h-[42rem] rounded-full bg-[#CE7028]/13 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_260px_rgba(0,0,0,0.72)] pointer-events-none" />
      <main className="relative z-10 min-h-screen max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14 flex items-center">
        <div className="w-full grid lg:grid-cols-[1.08fr_0.82fr] gap-10 lg:gap-20 items-center">
          <LeftPanel />

          <div className="login-form-enter flex justify-center lg:justify-end">
            <div className="relative overflow-hidden w-full max-w-[470px] bg-[#061715]/88 border border-[#CE7028]/10 rounded-md p-6 sm:p-9 shadow-[0_35px_100px_rgba(0,0,0,0.58),0_0_70px_rgba(4,73,71,0.2)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(206,112,40,0.11),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_35%)] pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#CE7028]/45 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-7 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/35">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]" />
                  Ambiente seguro PROJEP
                </div>
                {renderRight()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="relative lg:absolute lg:bottom-5 lg:left-0 lg:right-0 z-10 text-center pb-6 lg:pb-0">
        <p className="text-white/20 text-[10px] tracking-wide">© 2026 PROJEP - Sistema de Gestao Integrada</p>
      </div>
    </div>
  )
}
