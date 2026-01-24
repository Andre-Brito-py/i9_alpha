import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const collaboratorSchema = z.object({
  partnerId: z.number(),
  nome: z.string().min(1, "Nome é obrigatório"),
  cargo: z.string().optional(),
  telefone: z.string().min(10, "Telefone inválido").transform(val => val.replace(/\D/g, "")),
  matricula: z.string().regex(/^[A-Z]\d{7}$/, "Matrícula deve ter formato T1234567"),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const partnerId = searchParams.get("partnerId")

  try {
    const whereClause = partnerId ? { partnerId: parseInt(partnerId) } : {}
    
    const collaborators = await prisma.collaborator.findMany({
      where: whereClause,
      orderBy: { nome: 'asc' }
    })
    
    return NextResponse.json(collaborators)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = collaboratorSchema.parse(json)

    const collaborator = await prisma.collaborator.create({
      data: {
        partnerId: body.partnerId,
        nome: body.nome,
        cargo: body.cargo,
        telefone: body.telefone,
        matricula: body.matricula,
      },
    })

    return NextResponse.json(collaborator)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse(null, { status: 500 })
  }
}
