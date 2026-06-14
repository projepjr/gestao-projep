import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import ComercialDashboard from './pages/comercial/Dashboard'
import Pipeline from './pages/comercial/Pipeline'
import Ranking from './pages/comercial/Ranking'
import Contratos from './pages/comercial/Contratos'
import GPDashboard from './pages/gp/Dashboard'
import GPMembros from './pages/gp/Membros'
import ProcessoSeletivo from './pages/gp/ProcessoSeletivo'
import Aprovacoes from './pages/gp/Aprovacoes'
import Perfil from './pages/Perfil'
import Chat from './pages/Chat'

function ProtectedRoute({ children, allowedRoles, module }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'comercial') return <Navigate to="/comercial" replace />
    if (user.role === 'gp') return <Navigate to="/gp" replace />
    return <Navigate to="/login" replace />
  }
  return <Layout module={module}>{children}</Layout>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'gp' ? '/gp' : '/comercial'} replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? (user.role === 'gp' ? '/gp' : '/comercial') : '/login'} replace />} />

      <Route path="/comercial"          element={<ProtectedRoute allowedRoles={['comercial', 'presidente']} module="comercial"><ComercialDashboard /></ProtectedRoute>} />
      <Route path="/comercial/pipeline" element={<ProtectedRoute allowedRoles={['comercial', 'presidente']} module="comercial"><Pipeline /></ProtectedRoute>} />
      <Route path="/comercial/ranking"  element={<ProtectedRoute allowedRoles={['comercial', 'presidente']} module="comercial"><Ranking /></ProtectedRoute>} />
      <Route path="/comercial/contratos"element={<ProtectedRoute allowedRoles={['comercial', 'presidente']} module="comercial"><Contratos /></ProtectedRoute>} />

      <Route path="/gp"               element={<ProtectedRoute allowedRoles={['gp', 'presidente']} module="gp"><GPDashboard /></ProtectedRoute>} />
      <Route path="/gp/membros"       element={<ProtectedRoute allowedRoles={['gp', 'presidente']} module="gp"><GPMembros /></ProtectedRoute>} />
      <Route path="/gp/processo"      element={<ProtectedRoute allowedRoles={['gp', 'presidente']} module="gp"><ProcessoSeletivo /></ProtectedRoute>} />
      <Route path="/gp/aprovacoes"    element={<ProtectedRoute allowedRoles={['gp', 'presidente']} module="gp"><Aprovacoes /></ProtectedRoute>} />

      <Route path="/chat"    element={<ProtectedRoute allowedRoles={['comercial', 'gp', 'presidente']} module={null}><Chat /></ProtectedRoute>} />
      <Route path="/perfil"  element={<ProtectedRoute allowedRoles={['comercial', 'gp', 'presidente']} module={null}><Perfil /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
