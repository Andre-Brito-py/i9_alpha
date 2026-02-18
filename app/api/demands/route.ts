import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const demandSchema = z.object({
  partnerId: z.coerce.number().min(1, "Parceiro é obrigatório"),
  collaboratorId: z.coerce.number().optional().nullable(),
  assigneeId: z.coerce.number().min(1, "Responsável é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  urgencia: z.string().default("MEDIA"),
  prazo: z.string().optional().nullable(),
  descricao: z.string().optional(),
  evidenceOpen: z.string().optional().nullable(),
  subDemands: z.array(z.object({
    titulo: z.string().min(1),
    evidence: z.string().optional().nullable(),
    subSteps: z.array(z.object({
      nome: z.string().min(1)
    })).optional()
  })).optional()
})

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const demands = await prisma.demand.findMany({
      orderBy: { criadaEm: 'desc' },
      include: {
        partner: {
          select: { id: true, nickname: true }
        },
        collaborator: {
          select: { id: true, nome: true }
        },
        creator: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true }
        },
        editor: {
          select: { id: true, name: true }
        },
        subDemands: {
          include: {
            subSteps: true
          }
        }
      }
    })
    return NextResponse.json(demands)
  } catch (error) {
    console.error("[DEMANDS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = demandSchema.parse(body)
    const userId = parseInt(session.user.id)

    // Permission check for assignee
    if (validatedData.assigneeId !== userId) {
      if (session.user.role === "BACKOFFICE") {
        return new NextResponse("Backoffice users can only assign demands to themselves", { status: 403 })
      }
      if (session.user.role === "SUPERVISOR") {
        // Check if assignee is BACKOFFICE
        const assignee = await prisma.user.findUnique({ where: { id: validatedData.assigneeId } })
        if (!assignee || (assignee.role !== "BACKOFFICE" && assignee.id !== userId)) {
          return new NextResponse("Supervisors can only assign to themselves or Backoffice users", { status: 403 })
        }
      }
      // ADMIN can assign to anyone
    }

    let creatorId: number | null = null
    if (session.user.id) {
      const parsed = parseInt(session.user.id)
      if (!isNaN(parsed)) {
        creatorId = parsed
      }
    }

    console.log("[DEMANDS_POST] Received body:", JSON.stringify(body, null, 2))
    console.log("[DEMANDS_POST] Validated data:", JSON.stringify(validatedData, null, 2))

    const demand = await prisma.demand.create({
      data: {
        partnerId: validatedData.partnerId,
        collaboratorId: (validatedData.collaboratorId && (validatedData.collaboratorId as any) !== "undefined") ? validatedData.collaboratorId : null,
        creatorId: creatorId,
        assigneeId: validatedData.assigneeId,
        tipo: validatedData.tipo,
        urgencia: validatedData.urgencia,
        prazo: validatedData.prazo ? new Date(validatedData.prazo) : null,
        descricao: validatedData.descricao,
        status: "ABERTA",
        evidenceOpen: validatedData.evidenceOpen,
        subDemands: {
          create: validatedData.subDemands?.map(sd => ({
            titulo: sd.titulo,
            evidence: sd.evidence,
            subSteps: {
              create: sd.subSteps?.map(step => ({
                nome: step.nome,
                status: "PENDENTE"
              })) || []
            }
          })) || []
        }
      },
      include: {
        subDemands: {
          include: {
            subSteps: true
          }
        }
      }
    })

    return NextResponse.json(demand)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("[DEMANDS_POST] Validation Error:", error.issues)
      return new NextResponse(JSON.stringify({ error: "Invalid data", details: error.issues }), { status: 400 })
    }
    console.error("[DEMANDS_POST] Prisma or Other Error:", error)
    return new NextResponse(JSON.stringify({ error: "Internal Error", message: error.message }), { status: 500 })
  }
}
