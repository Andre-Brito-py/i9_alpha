import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["ADMIN", "SUPERVISOR", "BACKOFFICE"]),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    let whereClause = {}
    const userRole = session.user.role
    const userId = parseInt(session.user.id)

    if (userRole === "SUPERVISOR") {
      whereClause = {
        OR: [
          { id: userId },
          { role: "BACKOFFICE" }
        ]
      }
    } else if (userRole === "BACKOFFICE") {
      whereClause = {
        id: userId
      }
    }
    // ADMIN sees all (empty whereClause)

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error("[USERS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = userSchema.parse(body)

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
      }
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 400 })
    }
    // Check for unique email
    // @ts-expect-error - Prisma error code type issue
    if (error.code === 'P2002') {
       return new NextResponse("Email already exists", { status: 409 })
    }
    console.error("[USERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
