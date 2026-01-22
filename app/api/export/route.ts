import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import * as XLSX from "xlsx"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Get filters from body if needed (e.g. date range, partnerId)
    // For now, let's export everything or basic filters
    const body = await req.json()
    const { partnerId, status, startDate, endDate } = body as {
      partnerId?: string
      status?: string
      startDate?: string
      endDate?: string
    }

    const where: Prisma.DemandWhereInput = {}
    if (partnerId && partnerId !== "all") where.partnerId = parseInt(partnerId)
    if (status && status !== "all") where.status = status
    if (startDate && endDate) {
      where.criadaEm = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const demands = await prisma.demand.findMany({
      where,
      include: {
        partner: true,
        collaborator: true,
        subDemands: true
      },
      orderBy: { criadaEm: 'desc' }
    })

    // Flatten data for Excel
    const data = demands.map(d => ({
      ID: d.id,
      Parceiro: d.partner.nickname || d.partner.razaoSocial,
      Tipo: d.tipo,
      Urgencia: d.urgencia,
      Status: d.status,
      "Criado Em": d.criadaEm,
      Prazo: d.prazo,
      Descricao: d.descricao,
      Colaborador: d.collaborator?.nome || "N/A"
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Demandas")

    // Generate buffer
    const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return new NextResponse(buf, {
      headers: {
        "Content-Disposition": `attachment; filename="relatorio_demandas.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    })

  } catch (error) {
    console.error("[EXPORT_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
