import { FileText, Download, Table } from 'lucide-react'
import { useData } from '../../contexts/DataContext'

const fmtDate = iso => {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('pt-BR') }
  catch { return '' }
}

function toCSV(rows, headers) {
  const escape = v => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(',')]
  rows.forEach(row => lines.push(row.map(escape).join(',')))
  return lines.join('\n')
}

function download(csv, filename) {
  const bom = '﻿'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ReportCard({ icon: Icon, title, description, fields, onDownload }) {
  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-md p-6 flex items-start gap-5">
      <div className="w-12 h-12 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#CE7028]" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold text-base mb-1">{title}</h3>
        <p className="text-gray-500 text-sm mb-3">{description}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {fields.map(f => (
            <span key={f} className="bg-[#1A1A1A] border border-[#1E1E1E] text-gray-500 text-[10px] px-2 py-0.5 rounded">
              {f}
            </span>
          ))}
        </div>
        <button onClick={onDownload}
          className="flex items-center gap-2 bg-[#CE7028] hover:bg-[#B5611F] text-white text-sm font-semibold px-4 py-2 rounded transition-colors">
          <Download className="w-4 h-4" /> Baixar CSV
        </button>
      </div>
    </div>
  )
}

export default function Relatorios() {
  const { projects, members } = useData()
  const all = projects || []

  const handleProjectsReport = () => {
    const headers = ['Nome', 'Cliente', 'Gerente', 'Fase', 'Status', 'Saúde', 'Progresso (%)', 'Data Início', 'Data Fim', 'Atividades Total', 'Atividades Concluídas']
    const rows = all.map(p => {
      const gerenteNome = p.responsavelNome || members?.find(m => String(m.id) === String(p.responsavelId))?.nome || ''
      const tarefas = p.tarefas || []
      const concluidas = tarefas.filter(t => t.status === 'concluida').length
      const statusLabel = {
        planejado: 'Planejado', em_andamento: 'Em andamento', pausado: 'Pausado',
        concluido: 'Concluído', cancelado: 'Cancelado',
      }[p.status] || p.status
      const saudeLabel = { verde: 'No prazo', amarelo: 'Atenção', vermelho: 'Em risco' }[p.saude] || p.saude
      return [p.nome, p.clienteNome || '', gerenteNome, p.fase || '', statusLabel, saudeLabel, p.percentualConcluido || 0, fmtDate(p.dataInicio), fmtDate(p.dataFim), tarefas.length, concluidas]
    })
    download(toCSV(rows, headers), 'projetos.csv')
  }

  const handleScheduleReport = () => {
    const now = new Date()
    const headers = ['Projeto', 'Cliente', 'Gerente', 'Status', 'Início Planejado', 'Fim Planejado', 'Previsão Atual', 'Desvio (dias)', 'Desvio (%)', 'Dias Restantes', 'Progresso (%)']
    const rows = all.map(p => {
      const gerenteNome = p.responsavelNome || members?.find(m => String(m.id) === String(p.responsavelId))?.nome || ''
      const fim = p.dataFim ? new Date(p.dataFim) : null
      const estimadas = (p.etapas || []).map(e => e.dataFimEstimada).filter(Boolean).map(d => new Date(d))
      const previsao = estimadas.length > 0 ? new Date(Math.max(...estimadas)) : fim
      const inicio = p.dataInicio ? new Date(p.dataInicio) : null
      const duracao = inicio && fim ? Math.ceil((fim - inicio) / 86400000) : null
      const desvioD = fim && previsao ? Math.ceil((previsao - fim) / 86400000) : null
      const desvioP = duracao && desvioD !== null ? Math.round((desvioD / duracao) * 100) : null
      const diasRestantes = fim ? Math.ceil((fim - now) / 86400000) : null
      const statusLabel = {
        planejado: 'Planejado', em_andamento: 'Em andamento', pausado: 'Pausado',
        concluido: 'Concluído', cancelado: 'Cancelado',
      }[p.status] || p.status
      return [
        p.nome, p.clienteNome || '', gerenteNome, statusLabel,
        fmtDate(p.dataInicio), fmtDate(p.dataFim),
        previsao && previsao !== fim ? fmtDate(previsao.toISOString()) : '',
        desvioD !== null ? desvioD : '',
        desvioP !== null ? desvioP : '',
        diasRestantes !== null ? diasRestantes : '',
        p.percentualConcluido || 0,
      ]
    })
    download(toCSV(rows, headers), 'cronograma.csv')
  }

  const handleActivitiesReport = () => {
    const headers = ['Projeto', 'Atividade', 'Status', 'Prioridade', 'Fase', 'Responsável', 'Prazo', 'Concluída']
    const rows = []
    all.forEach(p => {
      ;(p.tarefas || []).forEach(t => {
        const statusLabel = { pendente: 'Pendente', em_progresso: 'Em progresso', concluida: 'Concluída' }[t.status] || t.status
        const prio = { baixa: 'Baixa', media: 'Média', alta: 'Alta', critica: 'Crítica' }[t.prioridade] || ''
        rows.push([p.nome, t.nome, statusLabel, prio, t.fase || '', t.responsavelNome || '', fmtDate(t.dataVencimento), t.status === 'concluida' ? 'Sim' : 'Não'])
      })
    })
    download(toCSV(rows, headers), 'atividades.csv')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-[#CE7028]/10 border border-[#CE7028]/20 flex items-center justify-center">
          <FileText className="w-4 h-4 text-[#CE7028]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Relatórios</h1>
          <p className="text-gray-600 text-xs">Exportação de dados gerenciais em CSV</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-md px-4 py-3 text-sm text-gray-500">
        Os arquivos CSV são gerados diretamente no navegador com os dados atuais do sistema. Abra no Excel ou Google Sheets.
      </div>

      <div className="space-y-4">
        <ReportCard
          icon={Table}
          title="Projetos"
          description="Lista completa de projetos com cliente, gerente, saúde, progresso e prazos."
          fields={['Nome', 'Cliente', 'Gerente', 'Fase', 'Status', 'Saúde', 'Progresso', 'Datas', 'Atividades']}
          onDownload={handleProjectsReport}
        />
        <ReportCard
          icon={FileText}
          title="Cronograma"
          description="Datas planejadas, previsão atual, desvios em dias e percentual por projeto."
          fields={['Projeto', 'Datas planejadas', 'Previsão atual', 'Desvio (dias)', 'Desvio (%)', 'Dias Restantes', 'Progresso']}
          onDownload={handleScheduleReport}
        />
        <ReportCard
          icon={Download}
          title="Atividades"
          description="Todas as atividades de todos os projetos com status, prioridade, responsável e prazo."
          fields={['Projeto', 'Atividade', 'Status', 'Prioridade', 'Fase', 'Responsável', 'Prazo']}
          onDownload={handleActivitiesReport}
        />
      </div>
    </div>
  )
}
