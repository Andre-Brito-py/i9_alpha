export type DemandColumn = {
  id: number
  tipo: string | null
  urgencia: string
  status: string
  criadaEm: string
  atualizadaEm: string
  prazo: string | null
  descricao: string | null
  partner: {
    id: number
    nickname: string | null
  }
  collaborator: {
    id: number
    nome: string
  } | null
  creator: {
    name: string | null
  } | null
  assignee: {
    id: number
    name: string | null
    role: string
  } | null
  editor: {
    name: string | null
  } | null
  evidenceOpen: string | null
  evidenceFinish: string | null
}
