import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const now = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(now.getDate() + 3)

    // Delayed demands: status is not completed/cancelled and deadline is past
    const delayed = await prisma.demand.findMany({
      where: {
        status: {
          notIn: ["CONCLUIDA", "CANCELADA"]
        },
        prazo: {
          lt: now
        }
      },
      include: {
        partner: {
          select: { nickname: true }
        }
      },
      orderBy: {
        prazo: 'asc'
      },
      take: 5
    })

    // Upcoming demands: status is not completed/cancelled and deadline is within next 3 days
    const upcoming = await prisma.demand.findMany({
      where: {
        status: {
          notIn: ["CONCLUIDA", "CANCELADA"]
        },
        prazo: {
          gt: now,
          lte: threeDaysFromNow
        }
      },
      include: {
        partner: {
          select: { nickname: true }
        }
      },
      orderBy: {
        prazo: 'asc'
      },
      take: 5
    })

    return NextResponse.json({
      delayed,
      upcoming
    })
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
