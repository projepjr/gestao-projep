import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, ChevronLeft,
  User, Briefcase, Building, CheckCircle, Clock, RefreshCw, KeyRound,
} from 'lucide-react'
import { ProjepSymbol, ProjepLogoFull } from '../components/ProjepLogo'

// ── Shared styles ─────────────────────────────────────────────
const INPUT = "w-full bg-[#111111] border border-[#1E1E1E] rounded px-10 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#CE7028] transition-colors"
const INPUT_ICON = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
const BTN_PRIMARY = "w-full bg-[#CE7028] hover:bg-[#B5611F] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded text-sm transition-colors flex items-center justify-center gap-2"
const BTN_GHOST = "text-[#FF882D] hover:text-[#CE7028] text-sm font-medium transition-colors"
const LABEL = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"

const DEPARTMENTS = [
  'Presidência', 'Adm. e Financeiro', 'Comercial',
  'Projetos', 'Marketing', 'Gestão de Pessoas',
]

// ── Left brand panel ──────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:flex w-5/12 bg-white flex-col items-center justify-between py-16 px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#044947]/5 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#CE7028]/5 rounded-tr-full" />

      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <ProjepLogoFull symbolSize={64} symbolColor="#CE7028" textColor="#044947" />

        <div className="mt-12 w-full">
          <div className="w-10 h-0.5 bg-[#CE7028] mx-auto mb-6" />
          <h2 className="text-[#044947] text-xl font-bold leading-snug mb-3">
            Sistema de Gestão Integrada
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
            Plataforma centralizada para gerenciamento de setores, projetos e pessoas da empresa júnior.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 w-full">
          {[{ num: '6', label: 'Setores' }, { num: '100%', label: 'Integrado' }, { num: '24/7', label: 'Disponível' }].map(item => (
            <div key={item.label} className="border border-gray-100 rounded p-3 text-center bg-gray-50">
              <p className="text-[#044947] font-bold text-base">{item.num}</p>
              <p className="text-gray-400 text-xs mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-gray-300 text-xs">© 2026 PROJEP — Todos os direitos reservados</p>
    </div>
  )
}

// ── Error / Success alerts ────────────────────────────────────
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

// ── Spinner ───────────────────────────────────────────────────
function Spinner() {
  return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}

// ── Back button ───────────────────────────────────────────────
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
      <ChevronLeft className="w-4 h-4" /> Voltar ao login
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function Login() {
  const { login, register, generateResetCode, verifyResetCode, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [view,      setView]      = useState('login') // login | register | forgot | verify | reset | pending
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [showPass,  setShowPass]  = useState(false)

  // Login state
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register state
  const [reg, setReg] = useState({ name: '', email: '', password: '', confirm: '', department: '', jobTitle: '' })
  const setR = (k) => (e) => setReg(prev => ({ ...prev, [k]: e.target.value }))

  // Pending user info
  const [pendingUser, setPendingUser] = useState(null)

  // Reset flow
  const [resetEmail,  setResetEmail]  = useState('')
  const [genCode,     setGenCode]     = useState(null)   // the 6-digit code generated
  const [verifyInput, setVerifyInput] = useState('')
  const [newPass,     setNewPass]     = useState('')
  const [newPassConf, setNewPassConf] = useState('')

  const go = (v) => { setView(v); setError(''); setSuccess('') }

  // ── Login submit ──────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 450))
    const result = login(loginEmail, loginPassword)
    setLoading(false)
    if (result.success) {
      navigate(result.user.role === 'gp' ? '/gp' : '/comercial')
    } else if (result.status === 'pending') {
      setPendingUser(result.user)
      go('pending')
    } else {
      setError(result.error)
    }
  }

  const demoLogin = (email) => { setLoginEmail(email); setLoginPassword('123456') }

  // ── Register submit ───────────────────────────────────────────
  const handleRegister = (e) => {
    e.preventDefault()
    setError('')
    if (!reg.name.trim())     return setError('Informe seu nome completo')
    if (reg.password !== reg.confirm) return setError('As senhas não coincidem')
    if (reg.password.length < 6)      return setError('A senha deve ter pelo menos 6 caracteres')
    if (!reg.department)              return setError('Selecione um setor')
    const result = register(reg)
    if (result.success) {
      setPendingUser(result.user)
      go('pending')
    } else {
      setError(result.error)
    }
  }

  // ── Forgot submit ─────────────────────────────────────────────
  const handleForgot = (e) => {
    e.preventDefault()
    setError('')
    const result = generateResetCode(resetEmail)
    setGenCode(result.exists ? result.code : null)
    go('verify')
  }

  // ── Verify code submit ────────────────────────────────────────
  const handleVerify = (e) => {
    e.preventDefault()
    setError('')
    if (!genCode) return setError('Email não encontrado. Verifique e tente novamente.')
    const ok = verifyResetCode(resetEmail, verifyInput.trim())
    if (ok) { go('reset') } else { setError('Código incorreto ou expirado. Tente novamente.') }
  }

  // ── Reset password submit ─────────────────────────────────────
  const handleReset = (e) => {
    e.preventDefault()
    setError('')
    if (newPass !== newPassConf) return setError('As senhas não coincidem')
    if (newPass.length < 6)     return setError('A senha deve ter pelo menos 6 caracteres')
    resetPassword(resetEmail, newPass)
    go('login')
    setSuccess('Senha alterada com sucesso! Entre com sua nova senha.')
  }

  // ── Render right panel ────────────────────────────────────────
  const renderRight = () => {
    // ── LOGIN ──────────────────────────────────────────────────
    if (view === 'login') return (
      <div className="w-full max-w-sm">
        <div className="lg:hidden mb-8"><ProjepLogoFull symbolSize={32} symbolColor="#CE7028" textColor="white" /></div>
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold tracking-tight">Acesso ao sistema</h1>
          <p className="text-gray-500 text-sm mt-1">Entre com suas credenciais institucionais</p>
        </div>

        <Alert type="success" msg={success} />

        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div>
            <label className={LABEL}>Email</label>
            <div className="relative">
              <Mail className={INPUT_ICON} />
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                placeholder="seu@email.com" required className={INPUT} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Senha</label>
            <div className="relative">
              <Lock className={INPUT_ICON} />
              <input type={showPass ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••" required className={`${INPUT} pr-12`} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => go('forgot')} className={BTN_GHOST + ' text-xs'}>
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
          <p className="text-xs text-gray-600 mb-3 uppercase tracking-wider font-semibold">Acesso rápido — Demo</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Comercial',  email: 'comercial@gestaoej.com'      },
              { label: 'GP',         email: 'gp@gestaoej.com'             },
              { label: 'Presidente', email: 'felipedaniel.wk@gmail.com'   },
            ].map(d => (
              <button key={d.label} onClick={() => demoLogin(d.email)}
                className="text-xs bg-[#111111] hover:bg-[#1A1A1A] border border-[#1E1E1E] hover:border-[#CE7028]/40 text-gray-500 hover:text-[#FF882D] rounded py-2 px-2 transition-all">
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )

    // ── REGISTER ───────────────────────────────────────────────
    if (view === 'register') return (
      <div className="w-full max-w-sm">
        <div className="lg:hidden mb-6"><ProjepLogoFull symbolSize={28} symbolColor="#CE7028" textColor="white" /></div>
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
              <select value={reg.department} onChange={setR('department')} required
                className={`${INPUT} appearance-none`}>
                <option value="">Selecione o setor</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
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

          <button type="submit" className={BTN_PRIMARY}>Solicitar acesso</button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-5">
          Já tem conta?{' '}
          <button onClick={() => go('login')} className={BTN_GHOST}>Entrar</button>
        </p>
      </div>
    )

    // ── FORGOT ─────────────────────────────────────────────────
    if (view === 'forgot') return (
      <div className="w-full max-w-sm">
        <BackBtn onClick={() => go('login')} />
        <div className="mb-8">
          <KeyRound className="w-10 h-10 text-[#CE7028] mb-4" />
          <h1 className="text-white text-2xl font-bold tracking-tight">Recuperar senha</h1>
          <p className="text-gray-500 text-sm mt-1">Informe seu email para receber o código de recuperação</p>
        </div>

        <form onSubmit={handleForgot} className="space-y-4">
          <div>
            <label className={LABEL}>Email cadastrado</label>
            <div className="relative">
              <Mail className={INPUT_ICON} />
              <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                placeholder="seu@email.com" required className={INPUT} />
            </div>
          </div>
          <Alert type="error" msg={error} />
          <button type="submit" className={BTN_PRIMARY}>Enviar código</button>
        </form>
      </div>
    )

    // ── VERIFY ─────────────────────────────────────────────────
    if (view === 'verify') return (
      <div className="w-full max-w-sm">
        <BackBtn onClick={() => go('forgot')} />
        <div className="mb-6">
          <RefreshCw className="w-10 h-10 text-[#CE7028] mb-4" />
          <h1 className="text-white text-2xl font-bold tracking-tight">Verificar código</h1>
          <p className="text-gray-500 text-sm mt-1">Digite o código de 6 dígitos enviado para <span className="text-white">{resetEmail}</span></p>
        </div>

        {genCode && (
          <div className="bg-[#044947]/20 border border-[#044947]/40 rounded p-4 mb-6">
            <p className="text-xs text-[#CE7028] font-semibold uppercase tracking-wider mb-1.5">Simulação — código gerado:</p>
            <p className="text-white font-mono text-2xl font-bold tracking-[0.3em]">{genCode}</p>
            <p className="text-gray-500 text-xs mt-2">Em produção este código seria enviado por email. Válido por 15 minutos.</p>
          </div>
        )}

        {!genCode && (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded p-4 mb-6">
            <p className="text-gray-400 text-sm">Se este email estiver cadastrado, você receberá as instruções em breve.</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className={LABEL}>Código de verificação</label>
            <input
              type="text" value={verifyInput} onChange={e => setVerifyInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000" required maxLength={6}
              className="w-full bg-[#111111] border border-[#1E1E1E] rounded px-4 py-3 text-white text-center text-xl font-mono tracking-[0.3em] focus:outline-none focus:border-[#CE7028] transition-colors"
            />
          </div>
          <Alert type="error" msg={error} />
          <button type="submit" className={BTN_PRIMARY}>Verificar</button>
        </form>
      </div>
    )

    // ── RESET ──────────────────────────────────────────────────
    if (view === 'reset') return (
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
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="Mínimo 6 caracteres" required className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Confirmar nova senha</label>
            <div className="relative">
              <Lock className={INPUT_ICON} />
              <input type="password" value={newPassConf} onChange={e => setNewPassConf(e.target.value)}
                placeholder="Repita a senha" required className={INPUT} />
            </div>
          </div>
          <Alert type="error" msg={error} />
          <button type="submit" className={BTN_PRIMARY}>Salvar nova senha</button>
        </form>
      </div>
    )

    // ── PENDING ────────────────────────────────────────────────
    if (view === 'pending') return (
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#CE7028]/15 border-2 border-[#CE7028]/30 flex items-center justify-center mb-5">
            <Clock className="w-10 h-10 text-[#CE7028]" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Cadastro em análise</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Olá, <span className="text-white font-semibold">{pendingUser?.name || 'membro'}</span>!
            <br /><br />
            Seu cadastro foi recebido com sucesso e está aguardando aprovação da diretoria da PROJEP.
            Assim que liberado, você receberá acesso completo ao sistema.
          </p>
        </div>

        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-4 mb-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Aguardando aprovação</span>
          </div>
          <div className="space-y-1.5 text-sm">
            {pendingUser?.name       && <p className="text-gray-400"><span className="text-gray-600">Nome:</span> {pendingUser.name}</p>}
            {pendingUser?.email      && <p className="text-gray-400"><span className="text-gray-600">Email:</span> {pendingUser.email}</p>}
            {pendingUser?.department && <p className="text-gray-400"><span className="text-gray-600">Setor:</span> {pendingUser.department}</p>}
          </div>
        </div>

        <button onClick={() => go('login')} className={BTN_PRIMARY}>
          <ChevronLeft className="w-4 h-4" /> Voltar ao login
        </button>
      </div>
    )

    return null
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      <LeftPanel />
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0A0A0A]">
        {renderRight()}
      </div>
    </div>
  )
}
