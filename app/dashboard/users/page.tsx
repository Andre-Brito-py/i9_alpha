import { DataTable } from "@/components/ui/data-table"
import { columns, User } from "./columns"
import { AddUserDialog } from "./add-user-dialog"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })

    const serializedUsers = users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString()
    }))

    return serializedUsers as User[]
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const data = await getUsers()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <AddUserDialog />
      </div>
      <DataTable columns={columns} data={data} filterColumn="name" />
    </div>
  )
}
