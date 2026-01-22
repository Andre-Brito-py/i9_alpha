import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const demandSchema = z.object({
  partnerId: z.coerce.number().min(1, "Parceiro é obrigatório"),
  assigneeId: z.coerce.number().min(1, "Responsável é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  urgencia: z.string().default("MEDIA"),
  prazo: z.string().optional().nullable(),
  descricao: z.string().optional(),
  status: z.string().optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { id } = await params
    const demandId = parseInt(id)
    const body = await req.json()
    const validatedData = demandSchema.parse(body)
    const userId = parseInt(session.user.id)
    const userRole = session.user.role

    // Fetch existing demand to check permissions
    const existingDemand = await prisma.demand.findUnique({
      where: { id: demandId },
      include: { assignee: true }
    })

    if (!existingDemand) {
      return new NextResponse("Demand not found", { status: 404 })
    }

    // Permission check for editing
    let canEdit = false
    if (userRole === "ADMIN") {
      canEdit = true
    } else if (userRole === "SUPERVISOR") {
      // Can edit if assigned to self or backoffice
      if (existingDemand.assigneeId === userId) {
        canEdit = true
      } else if (existingDemand.assignee?.role === "BACKOFFICE") {
        canEdit = true
      }
    } else if (userRole === "BACKOFFICE") {
      // Can edit if assigned to self
      if (existingDemand.assigneeId === userId) {
        canEdit = true
      }
    }

    if (!canEdit) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Permission check for changing assignee
    if (validatedData.assigneeId !== existingDemand.assigneeId) {
       if (userRole === "BACKOFFICE") {
         return new NextResponse("Backoffice users cannot reassign demands", { status: 403 })
       }
       if (userRole === "SUPERVISOR") {
         const newAssignee = await prisma.user.findUnique({ where: { id: validatedData.assigneeId } })
         if (!newAssignee || (newAssignee.role !== "BACKOFFICE" && newAssignee.id !== userId)) {
            return new NextResponse("Supervisors can only assign to themselves or Backoffice users", { status: 403 })
         }
       }
    }

    const demand = await prisma.demand.update({
      where: { id: demandId },
      data: {
        partnerId: validatedData.partnerId,
        assigneeId: validatedData.assigneeId,
        editorId: userId,
        tipo: validatedData.tipo,
        urgencia: validatedData.urgencia,
        prazo: validatedData.prazo ? new Date(validatedData.prazo) : null,
        descricao: validatedData.descricao,
        status: validatedData.status || existingDemand.status
      }
    })

    return NextResponse.json(demand)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 400 })
    }
    console.error("[DEMAND_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { id } = await params
        await prisma.demand.delete({
            where: { id: parseInt(id) }
        })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[DEMAND_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
