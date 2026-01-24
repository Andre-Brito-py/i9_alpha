"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PartnerActions } from "./partner-actions"

export type Partner = {
  id: number
  nickname: string | null
  nomeFantasia: string | null
  razaoSocial: string | null
  cnpj: string | null
  sapCliente: string | null
  sapFornecedor: string | null
  _count: {
    demands: number
    collaborators: number
  }
}

import { PartnerDetailsDialog } from "./partner-details-dialog"

export const columns: ColumnDef<Partner>[] = [
  {
    accessorKey: "nickname",
    id: "nickname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Apelido
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const partner = row.original
      return (
        <PartnerDetailsDialog partner={partner}>
          <Button variant="link" className="p-0 h-auto font-medium text-primary hover:underline">
            {partner.nickname}
          </Button>
        </PartnerDetailsDialog>
      )
    },
  },
  {
    accessorKey: "nomeFantasia",
    header: "Nome Fantasia",
  },
  {
    accessorKey: "cnpj",
    header: "CNPJ",
  },
  {
    accessorKey: "_count.demands",
    header: "Demandas",
  },
  {
    id: "actions",
    cell: ({ row }) => <PartnerActions partner={row.original} />,
  },
]
