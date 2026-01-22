import { DataTable } from "@/components/ui/data-table"
import { columns, Partner } from "./columns"
import { AddPartnerDialog } from "./add-partner-dialog"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

async function getPartners(): Promise<Partner[]> {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: { nickname: 'asc' },
      include: {
        _count: {
          select: { demands: true, collaborators: true }
        }
      }
    })
    return partners
  } catch (error) {
    console.error("Error fetching partners:", error)
    return []
  }
}

export default async function PartnersPage() {
  const data = await getPartners()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Parceiros</h1>
        <AddPartnerDialog />
      </div>
      <DataTable columns={columns} data={data} filterColumn="nickname" />
    </div>
  )
}
