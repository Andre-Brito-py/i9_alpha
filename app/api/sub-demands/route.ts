import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const subDemandSchema = z.object({
  demandId: z.number().optional(),
  titulo: z.string().min(1, "Título é obrigatório").optional(),
  descricao: z.string().optional(),
  prazo: z.string().optional().nullable(),
  evidence: z.string().optional().nullable(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  try {
    const json = await req.json()
    const body = subDemandSchema.parse(json)

    if (!body.demandId || !body.titulo) {
      return new NextResponse("DemandId and Titulo are required for creation", { status: 400 })
    }

    const subDemand = await prisma.subDemand.create({
      data: {
        demandId: body.demandId,
        titulo: body.titulo,
        descricao: body.descricao,
        prazo: body.prazo ? new Date(body.prazo) : null,
        evidence: body.evidence,
      },
      include: {
        subSteps: true
      }
    })

    return NextResponse.json(subDemand)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  try {
    const json = await req.json()
    const { id, ...data } = json

    if (!id) return new NextResponse("ID is required", { status: 400 })

    const body = subDemandSchema.parse(data)

    const subDemand = await prisma.subDemand.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        prazo: body.prazo ? new Date(body.prazo) : undefined,
      },
    })

    return NextResponse.json(subDemand)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const demandId = searchParams.get("demandId")

  if (demandId) {
    const subDemands = await prisma.subDemand.findMany({
      where: { demandId: parseInt(demandId) },
      include: { subSteps: true },
      orderBy: { id: 'asc' }
    })
    return NextResponse.json(subDemands)
  }

  return NextResponse.json([])
}
