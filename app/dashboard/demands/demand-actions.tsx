"use client"

import { useState } from "react"
import { MoreHorizontal, CheckCircle2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditDemandDialog } from "./edit-demand-dialog"
import { FinishDemandDialog } from "./finish-demand-dialog"
import { DemandColumn } from "./types"

interface DemandActionsProps {
  demand: DemandColumn
}

export function DemandActions({ demand }: DemandActionsProps) {
  const { data: session } = useSession()
  const [openEdit, setOpenEdit] = useState(false)
  const [openFinish, setOpenFinish] = useState(false)

  const isFinished = demand.status === "CONCLUIDA" || demand.status === "CANCELADA"

  // Determine if user can edit
  const canEdit = (() => {
    if (!session?.user || isFinished) return false
    const { role, id } = session.user
    const userId = parseInt(id)

    if (role === "ADMIN") return true

    if (role === "SUPERVISOR") {
      // Can edit if assigned to self or backoffice
      if (demand.assignee?.id === userId) return true
      if (demand.assignee?.role === "BACKOFFICE") return true
      return false
    }

    if (role === "BACKOFFICE") {
      // Can edit if assigned to self
      return demand.assignee?.id === userId
    }

    return false
  })()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(demand.id.toString())}
          >
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>

          {!isFinished && canEdit && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenFinish(true)} className="text-green-600 focus:text-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                Editar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDemandDialog
        demand={demand}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

      <FinishDemandDialog
        demand={demand}
        open={openFinish}
        onOpenChange={setOpenFinish}
      />
    </>
  )
}

