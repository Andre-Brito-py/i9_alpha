import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const subStepSchema = z.object({
  subDemandId: z.number(),
  nome: z.string().min(1, "Nome é obrigatório"),
  prazo: z.string().optional().nullable(),
})

const updateSubStepSchema = z.object({
  id: z.number(),
  status: z.string().optional(),
  nome: z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const body = subStepSchema.parse(json)

    const subStep = await prisma.subStep.create({
      data: {
        subDemandId: body.subDemandId,
        nome: body.nome,
        prazo: body.prazo ? new Date(body.prazo) : null,
        status: "PENDENTE"
      }
    })

    return NextResponse.json(subStep)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 400 })
    }
    console.error("[SUBSTEPS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const json = await req.json()
    const body = updateSubStepSchema.parse(json)

    const subStep = await prisma.subStep.update({
      where: { id: body.id },
      data: {
        status: body.status,
        nome: body.nome
      }
    })

    return NextResponse.json(subStep)
  } catch (error) {
    console.error("[SUBSTEPS_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return new NextResponse("ID required", { status: 400 })
    }

    await prisma.subStep.delete({
      where: { id: parseInt(id) }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[SUBSTEPS_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
