import { useData } from '../../contexts/DataContext'
import { Users, UserCheck, UserPlus, TrendingUp, Star, Activity } from 'lucide-react'

function KPICard({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-6">
      <div className="w-9 h-9 rounded flex items-center justify-center mb-4" style={{ backgroundColor: `${accent}15` }}>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
    </div>
  )
}

const DEPT_COLORS = {
  'Comercial': 'bg-[#CE7028]',
  'Gestão de Pessoas': 'bg-blue-500',
  'Projetos': 'bg-purple-500',
  'Diretoria': 'bg-yellow-500',
  'Marketing': 'bg-pink-500',
}

export default function GPDashboard() {
  const { members, process } = useData()

  const activeMembers = members.filter(m => m.status === 'ativo')
  const inProcess = process.filter(p => p.stage !== 'aprovado' && p.stage !== 'reprovado')
  const approved = process.filter(p => p.stage === 'aprovado')
  const avgPerformance = activeMembers.length > 0
    ? Math.round(activeMembers.reduce((s, m) => s + (m.performance || 0), 0) / activeMembers.length)
    : 0

  const deptMap = {}
  activeMembers.forEach(m => { deptMap[m.department] = (deptMap[m.department] || 0) + 1 })
  const depts = Object.entries(deptMap).sort((a, b) => b[1] - a[1])

  const topPerformers = [...activeMembers].sort((a, b) => (b.performance || 0) - (a.performance || 0)).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard de GP</h1>
        <p className="text-gray-500 text-sm mt-1">Gestão de pessoas e capital humano</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Membros Ativos" value={activeMembers.length} subtitle="Na empresa júnior" icon={Users} accent="#3b82f6" />
        <KPICard title="Em Processo Seletivo" value={inProcess.length} subtitle="Candidatos avaliados" icon={UserPlus} accent="#CE7028" />
        <KPICard title="Aprovados" value={approved.length} subtitle="Aguardando onboarding" icon={UserCheck} accent="#22c55e" />
        <KPICard title="Performance Média" value={`${avgPerformance}%`} subtitle="De toda a equipe" icon={TrendingUp} accent="#a855f7" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-semibold">Membros por Área</h2>
          </div>
          <div className="space-y-4">
            {depts.map(([dept, count]) => {
              const pct = (count / activeMembers.length) * 100
              const color = DEPT_COLORS[dept] || 'bg-gray-500'
              return (
                <div key={dept}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-sm text-gray-300">{dept}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">{count} membro{count !== 1 ? 's' : ''}</span>
                      <span className="text-white font-semibold tabular-nums">{Math.round(pct)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                    <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-4 h-4 text-yellow-500" />
            <h2 className="text-white font-semibold">Top Performers</h2>
          </div>
          <div className="space-y-2">
            {topPerformers.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-[#161616] border border-[#1E1E1E] rounded hover:border-[#2A2A2A] transition-colors">
                <div className="w-8 h-8 bg-blue-900/50 border border-blue-800/30 rounded flex items-center justify-center text-xs font-bold text-blue-300">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{member.name}</p>
                  <p className="text-gray-600 text-xs">{member.role}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 bg-[#1E1E1E] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${member.performance >= 90 ? 'bg-green-500' : member.performance >= 75 ? 'bg-[#CE7028]' : 'bg-red-500'}`}
                      style={{ width: `${member.performance}%` }}
                    />
                  </div>
                  <span className="text-white text-xs font-bold w-8 text-right tabular-nums">{member.performance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
