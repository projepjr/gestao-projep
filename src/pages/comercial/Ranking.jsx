import { useData } from '../../contexts/DataContext'
import { Trophy, Target } from 'lucide-react'

function buildRanking(leads, field) {
  const map = {}
  leads.forEach(lead => {
    const person = lead[field]
    if (!person) return
    if (!map[person]) map[person] = { name: person, leads: 0, value: 0, closed: 0 }
    map[person].leads++
    map[person].value += Number(lead.value)
    if (lead.stage === 'fechado') map[person].closed++
  })
  return Object.values(map).sort((a, b) => b.value - a.value)
}

const MEDAL_STYLES = [
  { bg: 'bg-yellow-500/5', border: 'border-yellow-600/30', text: 'text-yellow-400', icon: '🥇' },
  { bg: 'bg-gray-500/5', border: 'border-gray-600/30', text: 'text-gray-400', icon: '🥈' },
  { bg: 'bg-orange-900/10', border: 'border-orange-800/30', text: 'text-orange-500', icon: '🥉' },
]

function RankingCard({ title, subtitle, icon: Icon, data, valueLabel = 'Valor em Pipeline' }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#CE7028]/10 border border-[#CE7028]/20 rounded flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#FF882D]" />
        </div>
        <div>
          <h2 className="text-white font-semibold">{title}</h2>
          <p className="text-gray-600 text-xs">{subtitle}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-700 text-sm">Nenhum dado disponível</div>
      ) : (
        <div className="space-y-2">
          {data.map((person, idx) => {
            const style = MEDAL_STYLES[idx] || { bg: 'bg-[#161616]', border: 'border-[#1E1E1E]', text: 'text-gray-500', icon: `#${idx + 1}` }
            const convRate = person.leads > 0 ? Math.round((person.closed / person.leads) * 100) : 0
            return (
              <div key={person.name} className={`flex items-center gap-4 p-4 ${style.bg} border ${style.border} rounded transition-all hover:border-opacity-50`}>
                <div className={`w-9 h-9 rounded flex items-center justify-center text-base ${style.bg} border ${style.border} flex-shrink-0`}>
                  {idx < 3 ? style.icon : <span className={`text-xs font-bold ${style.text}`}>#{idx + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{person.name}</p>
                  <p className="text-gray-600 text-xs">{person.leads} leads • {person.closed} fechados • {convRate}% conv.</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold text-sm tabular-nums">R$ {person.value.toLocaleString('pt-BR')}</p>
                  <p className="text-gray-600 text-xs">{valueLabel}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Ranking() {
  const { leads } = useData()

  const hunters = buildRanking(leads, 'hunter')
  const closers = buildRanking(leads.filter(l => l.stage === 'fechado'), 'closer')

  const totalClosed = leads.filter(l => l.stage === 'fechado').length
  const totalRevenue = leads.filter(l => l.stage === 'fechado').reduce((s, l) => s + Number(l.value), 0)
  const avgTicket = totalClosed > 0 ? totalRevenue / totalClosed : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Ranking Comercial</h1>
        <p className="text-gray-500 text-sm mt-1">Performance da equipe de vendas</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { emoji: '🏆', label: 'Contratos Fechados', value: totalClosed, cls: 'text-white' },
          { emoji: '💰', label: 'Receita Total', value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, cls: 'text-green-400' },
          { emoji: '📊', label: 'Ticket Médio', value: `R$ ${Math.round(avgTicket).toLocaleString('pt-BR')}`, cls: 'text-[#FF882D]' },
        ].map(item => (
          <div key={item.label} className="bg-[#111111] border border-[#1E1E1E] rounded-md p-5 text-center">
            <div className="text-2xl mb-2">{item.emoji}</div>
            <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold mb-1">{item.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${item.cls}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RankingCard title="Ranking de Hunters" subtitle="Prospecção de novos leads" icon={Target} data={hunters} valueLabel="Valor prospectado" />
        <RankingCard title="Ranking de Closers" subtitle="Fechamento de contratos" icon={Trophy} data={closers} valueLabel="Valor fechado" />
      </div>
    </div>
  )
}
