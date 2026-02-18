"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Image as ImageIcon } from "lucide-react"
import { DemandColumn } from "./types"
import { DemandNameCell } from "./demand-name-cell"
import { DemandActions } from "./demand-actions"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const columns: ColumnDef<DemandColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "partner.nickname",
    id: "partnerNickname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Parceiro
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <DemandNameCell demand={row.original} />,
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
  },
  {
    accessorKey: "urgencia",
    header: "Urgência",
    cell: ({ row }) => {
      const urgency = row.getValue("urgencia") as string
      let color = "bg-gray-500"
      if (urgency === "ALTA") color = "bg-orange-500"
      if (urgency === "URGENTE") color = "bg-red-500"
      if (urgency === "BAIXA") color = "bg-green-500"

      return <Badge className={color}>{urgency}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const prazoStr = row.getValue("prazo") as string
      let isDelayed = false
      let daysDelayed = 0

      if (prazoStr && status !== "CONCLUIDA" && status !== "CANCELADA") {
        const prazo = new Date(prazoStr)
        const now = new Date()
        if (now > prazo) {
          isDelayed = true
          const diffTime = Math.abs(now.getTime() - prazo.getTime())
          daysDelayed = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }
      }

      return (
        <div className="flex flex-col gap-1">
          <Badge variant={isDelayed ? "destructive" : "outline"}>
            {status}
          </Badge>
          {isDelayed && (
            <span className="text-xs text-red-500 font-bold">
              ATRASADA ({daysDelayed} dia{daysDelayed > 1 ? 's' : ''})
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "assignee.name",
    header: "Responsável",
    cell: ({ row }) => {
      return row.original.assignee?.name || "-"
    }
  },
  {
    accessorKey: "editor.name",
    header: "Editado Por",
    cell: ({ row }) => {
      return row.original.editor?.name || "-"
    }
  },
  {
    accessorKey: "prazo",
    header: "Prazo",
    cell: ({ row }) => {
      const date = row.getValue("prazo") as string
      if (!date) return "-"
      return format(new Date(date), "dd/MM/yyyy")
    },
  },
  {
    accessorKey: "creator.name",
    header: "Criado Por",
    cell: ({ row }) => {
      return row.original.creator?.name || "-"
    }
  },
  {
    accessorKey: "criadaEm",
    header: "Criado Em",
    cell: ({ row }) => {
      const date = row.getValue("criadaEm") as string
      return format(new Date(date), "dd/MM/yyyy HH:mm")
    },
  },
  {
    accessorKey: "atualizadaEm",
    header: "Atualizado Em",
    cell: ({ row }) => {
      const date = row.getValue("atualizadaEm") as string
      return format(new Date(date), "dd/MM/yyyy HH:mm")
    },
  },
  {
    id: "evidence",
    header: "Evidência",
    cell: ({ row }) => {
      const hasOpen = !!row.original.evidenceOpen
      const hasFinish = !!row.original.evidenceFinish

      if (!hasOpen && !hasFinish) return "-"

      return (
        <TooltipProvider>
          <div className="flex gap-1">
            {hasOpen && (
              <Tooltip>
                <TooltipTrigger>
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>Evidência de Abertura disponível</TooltipContent>
              </Tooltip>
            )}
            {hasFinish && (
              <Tooltip>
                <TooltipTrigger>
                  <ImageIcon className="h-4 w-4 text-green-500" />
                </TooltipTrigger>
                <TooltipContent>Evidência de Conclusão disponível</TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <DemandActions demand={row.original} />,
  },
]
