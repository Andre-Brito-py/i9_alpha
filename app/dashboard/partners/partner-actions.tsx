"use client"

import { useState } from "react"
import { MoreHorizontal, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddCollaboratorDialog } from "./add-collaborator-dialog"
import { Partner } from "./columns"

interface PartnerActionsProps {
  partner: Partner
}

export function PartnerActions({ partner }: PartnerActionsProps) {
  const [openAddCollaborator, setOpenAddCollaborator] = useState(false)

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
            onClick={() => navigator.clipboard.writeText(partner.id.toString())}
          >
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
          <DropdownMenuItem>Editar</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenAddCollaborator(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Funcionário
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddCollaboratorDialog 
        partnerId={partner.id} 
        partnerName={partner.nickname || partner.nomeFantasia || "Parceiro"}
        open={openAddCollaborator} 
        onOpenChange={setOpenAddCollaborator} 
      />
    </>
  )
}
