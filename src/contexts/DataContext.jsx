import { createContext, useContext, useState, useEffect } from 'react'
import { INITIAL_MEMBERS } from '../data/members'

const DataContext = createContext(null)

const INITIAL_LEADS = [
  { id: 1, company: 'TechStart Ltda', contact: 'João Oliveira', email: 'joao@techstart.com', phone: '(11) 99999-0001', value: 8500, stage: 'prospeccao', hunter: 'Ana Silva', closer: null, date: '2026-06-01', notes: 'Interesse em consultoria de processos' },
  { id: 2, company: 'Inova Soluções', contact: 'Maria Santos', email: 'maria@inova.com', phone: '(11) 99999-0002', value: 15000, stage: 'contato', hunter: 'Bruno Lima', closer: null, date: '2026-06-03', notes: 'Reunião agendada para apresentação' },
  { id: 3, company: 'Grupo Alpha', contact: 'Pedro Alves', email: 'pedro@alpha.com', phone: '(11) 99999-0003', value: 22000, stage: 'proposta', hunter: 'Ana Silva', closer: 'Felipe Daniel', date: '2026-06-05', notes: 'Proposta enviada, aguardando retorno' },
  { id: 4, company: 'Delta Corp', contact: 'Fernanda Lima', email: 'fernanda@delta.com', phone: '(11) 99999-0004', value: 35000, stage: 'negociacao', hunter: 'Bruno Lima', closer: 'Ana Silva', date: '2026-06-07', notes: 'Em negociação de valores e escopo' },
  { id: 5, company: 'Nexus Tech', contact: 'Ricardo Souza', email: 'ricardo@nexus.com', phone: '(11) 99999-0005', value: 45000, stage: 'fechado', hunter: 'Felipe Daniel', closer: 'Ana Silva', date: '2026-06-09', notes: 'Contrato assinado!' },
  { id: 6, company: 'Prime Systems', contact: 'Lucia Ferreira', email: 'lucia@prime.com', phone: '(11) 99999-0006', value: 12000, stage: 'contato', hunter: 'Ana Silva', closer: null, date: '2026-06-10', notes: 'Primeiro contato realizado' },
  { id: 7, company: 'Omega Digital', contact: 'Marcos Vieira', email: 'marcos@omega.com', phone: '(11) 99999-0007', value: 28000, stage: 'fechado', hunter: 'Bruno Lima', closer: 'Felipe Daniel', date: '2026-06-02', notes: 'Projeto de transformação digital' },
]

const INITIAL_CONTRACTS = [
  { id: 1, company: 'Nexus Tech', value: 45000, startDate: '2026-06-09', endDate: '2026-09-09', status: 'ativo', description: 'Consultoria em processos organizacionais', responsible: 'Ana Silva', deliveries: 3, deliveriesDone: 1 },
  { id: 2, company: 'Omega Digital', value: 28000, startDate: '2026-06-02', endDate: '2026-08-02', status: 'ativo', description: 'Transformação digital e mapeamento de processos', responsible: 'Felipe Daniel', deliveries: 4, deliveriesDone: 2 },
  { id: 3, company: 'Beta Solutions', value: 18000, startDate: '2026-04-01', endDate: '2026-06-01', status: 'concluido', description: 'Pesquisa de mercado e benchmarking', responsible: 'Bruno Lima', deliveries: 2, deliveriesDone: 2 },
]


const INITIAL_PROCESS = [
  { id: 1, name: 'Ana Silva', role: 'Diretora Comercial', stage: 'entrevista_rh', date: '2026-06-10', score: 85, notes: 'Ótima candidata, experiência em vendas B2B' },
  { id: 2, name: 'Lucas Campos', role: 'Analista de Marketing', stage: 'prova', date: '2026-06-11', score: 72, notes: 'Bom portfólio de design' },
  { id: 3, name: 'Mariana Torres', role: 'Analista Financeiro', stage: 'entrevista_diretoria', date: '2026-06-12', score: 91, notes: 'Excelente conhecimento em finanças' },
  { id: 4, name: 'Rafael Brito', role: 'Trainee de GP', stage: 'aprovado', date: '2026-06-08', score: 78, notes: 'Aprovado para início em julho' },
]

function loadData(key, initial) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : initial
  } catch {
    return initial
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function DataProvider({ children }) {
  const [leads, setLeads] = useState(() => loadData('ej_leads', INITIAL_LEADS))
  const [contracts, setContracts] = useState(() => loadData('ej_contracts', INITIAL_CONTRACTS))
  const [members, setMembers] = useState(() => loadData('ej_members_v2', INITIAL_MEMBERS))
  const [process, setProcess] = useState(() => loadData('ej_process', INITIAL_PROCESS))

  useEffect(() => { saveData('ej_leads', leads) }, [leads])
  useEffect(() => { saveData('ej_contracts', contracts) }, [contracts])
  useEffect(() => { saveData('ej_members_v2', members) }, [members])
  useEffect(() => { saveData('ej_process', process) }, [process])

  const addLead = (lead) => setLeads(prev => [...prev, { ...lead, id: Date.now() }])
  const updateLead = (id, data) => setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l))
  const deleteLead = (id) => setLeads(prev => prev.filter(l => l.id !== id))
  const moveLead = (id, stage) => updateLead(id, { stage })

  const addContract = (contract) => setContracts(prev => [...prev, { ...contract, id: Date.now() }])
  const updateContract = (id, data) => setContracts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  const deleteContract = (id) => setContracts(prev => prev.filter(c => c.id !== id))

  const addMember = (member) => setMembers(prev => [...prev, { ...member, id: Date.now() }])
  const updateMember = (id, data) => setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m))
  const deleteMember = (id) => setMembers(prev => prev.filter(m => m.id !== id))

  const addCandidate = (candidate) => setProcess(prev => [...prev, { ...candidate, id: Date.now() }])
  const updateCandidate = (id, data) => setProcess(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  const deleteCandidate = (id) => setProcess(prev => prev.filter(p => p.id !== id))

  return (
    <DataContext.Provider value={{
      leads, addLead, updateLead, deleteLead, moveLead,
      contracts, addContract, updateContract, deleteContract,
      members, addMember, updateMember, deleteMember,
      process, addCandidate, updateCandidate, deleteCandidate,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
