import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const partnerSchema = z.object({
  nickname: z.string().min(1, "Nickname é obrigatório"),
  nomeFantasia: z.string().optional(),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  sapCliente: z.string().optional(),
  sapFornecedor: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const partners = await prisma.partner.findMany({
      orderBy: { nickname: 'asc' },
      include: {
        _count: {
          select: { demands: true, collaborators: true }
        }
      }
    })
    return NextResponse.json(partners)
  } catch (error) {
    console.error("[PARTNERS_GET]", error)
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
    const validatedData = partnerSchema.parse(body)

    const partner = await prisma.partner.create({
      data: validatedData
    })

    return NextResponse.json(partner)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 400 })
    }
    console.error("[PARTNERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
