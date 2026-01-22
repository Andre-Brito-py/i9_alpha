import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { DemandColumn } from "./types"
import { AddDemandDialog } from "./add-demand-dialog"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

async function getDemands(): Promise<DemandColumn[]> {
  try {
    const demands = await prisma.demand.findMany({
      orderBy: { criadaEm: 'desc' },
      include: {
        partner: {
          select: { nickname: true }
        },
        collaborator: {
          select: { nome: true }
        },
        creator: {
          select: { name: true }
        },
        assignee: {
          select: { id: true, name: true, role: true }
        },
        editor: {
          select: { name: true }
        }
      }
    })
    
    // Serialize dates to strings to avoid "Date object" warning/error in client components
    const serializedDemands = demands.map(demand => ({
      ...demand,
      criadaEm: demand.criadaEm.toISOString(),
      atualizadaEm: demand.atualizadaEm.toISOString(),
      prazo: demand.prazo ? demand.prazo.toISOString() : null
    }))

    return serializedDemands as DemandColumn[]
  } catch (error) {
    console.error("Error fetching demands:", error)
    return []
  }
}

export default async function DemandsPage() {
  const data = await getDemands()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Demandas</h1>
        <AddDemandDialog />
      </div>
      <DataTable columns={columns} data={data} filterColumn="partnerNickname" />
    </div>
  )
}
