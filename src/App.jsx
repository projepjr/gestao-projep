import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import { getDefaultPath, hasPathAccess } from './config/accessControl'

const ComercialDashboard = lazy(() => import('./pages/comercial/Dashboard'))
const LeadsInsights = lazy(() => import('./pages/comercial/Leads'))
const Pipeline = lazy(() => import('./pages/comercial/Pipeline'))
const Calendario = lazy(() => import('./pages/comercial/Calendario'))
const Ranking = lazy(() => import('./pages/comercial/Ranking'))
const Contratos = lazy(() => import('./pages/comercial/Contratos'))
const EquipeComercial = lazy(() => import('./pages/comercial/Equipe'))
const GPDashboard = lazy(() => import('./pages/gp/Dashboard'))
const GPMembros = lazy(() => import('./pages/gp/Membros'))
const ProcessoSeletivo = lazy(() => import('./pages/gp/ProcessoSeletivo'))
const Aprovacoes = lazy(() => import('./pages/gp/Aprovacoes'))
const Seguranca = lazy(() => import('./pages/presidencia/Seguranca'))
const BaseConhecimentoProjetos = lazy(() => import('./pages/projetos/BaseConhecimento'))
const Perfil = lazy(() => import('./pages/Perfil'))
const Chat = lazy(() => import('./pages/Chat'))

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#CE7028]/30 border-t-[#CE7028] rounded-full animate-spin" />
    </div>
  )
}

function defaultHome(user) {
  return getDefaultPath(user)
}

function ProtectedRoute({ children, requiredPath }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace />
  if (!hasPathAccess(user, requiredPath || location.pathname)) {
    return <Navigate to={defaultHome(user)} replace />
  }
  return (
    <Layout>
      <ErrorBoundary key={location.pathname}>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </ErrorBoundary>
    </Layout>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={defaultHome(user)} replace /> : <Login />} />
      <Route path="/redefinir-senha" element={<Login />} />
      <Route path="/" element={<Navigate to={user ? defaultHome(user) : '/login'} replace />} />

      <Route path="/comercial"           element={<ProtectedRoute><ComercialDashboard /></ProtectedRoute>} />
      <Route path="/comercial/leads"     element={<ProtectedRoute><LeadsInsights /></ProtectedRoute>} />
      <Route path="/comercial/pipeline"  element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
      <Route path="/comercial/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
      <Route path="/comercial/ranking"   element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
      <Route path="/comercial/contratos" element={<ProtectedRoute><Contratos /></ProtectedRoute>} />
      <Route path="/comercial/equipe"    element={<ProtectedRoute><EquipeComercial /></ProtectedRoute>} />

      <Route path="/gp"               element={<ProtectedRoute><GPDashboard /></ProtectedRoute>} />
      <Route path="/gp/membros"       element={<ProtectedRoute><GPMembros /></ProtectedRoute>} />
      <Route path="/gp/processo"      element={<ProtectedRoute><ProcessoSeletivo /></ProtectedRoute>} />
      <Route path="/gp/aprovacoes"    element={<ProtectedRoute><Aprovacoes /></ProtectedRoute>} />

      <Route path="/presidencia"           element={<ProtectedRoute requiredPath="/presidencia/seguranca"><Navigate to="/presidencia/seguranca" replace /></ProtectedRoute>} />
      <Route path="/presidencia/seguranca" element={<ProtectedRoute><Seguranca /></ProtectedRoute>} />

      <Route path="/projetos"      element={<ProtectedRoute requiredPath="/projetos/base"><Navigate to="/projetos/base" replace /></ProtectedRoute>} />
      <Route path="/projetos/base" element={<ProtectedRoute><BaseConhecimentoProjetos /></ProtectedRoute>} />

      <Route path="/membros" element={<Navigate to="/chat" replace />} />
      <Route path="/chat"   element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
