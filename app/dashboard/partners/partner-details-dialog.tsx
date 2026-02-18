"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Partner } from "./columns"
import { Separator } from "@/components/ui/separator"
import { formatPhone } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface PartnerDetailsDialogProps {
  partner: Partner
  children: React.ReactNode
}

type Collaborator = {
  id: number
  nome: string
  cargo: string | null
  telefone: string | null
  matricula: string | null
}

export function PartnerDetailsDialog({ partner, children }: PartnerDetailsDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      // setLoading(true) is now handled in handleOpenChange or we can just keep it but this lint is strict
      fetch(`/api/collaborators?partnerId=${partner.id}`)
        .then((res) => res.json())
        .then((data) => setCollaborators(data))
        .catch((err) => console.error("Erro ao carregar colaboradores:", err))
        .finally(() => setLoading(false))
    }
  }, [open, partner.id])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setLoading(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{partner.nickname}</DialogTitle>
          <DialogDescription>
            Detalhes do parceiro e lista de funcionários.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Dados do Parceiro */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Dados Cadastrais</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Nome Fantasia:</span>
                <p>{partner.nomeFantasia || "-"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Razão Social:</span>
                <p>{partner.razaoSocial || "-"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">CNPJ:</span>
                <p>{partner.cnpj || "-"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">SAP Cliente:</span>
                <p>{partner.sapCliente || "-"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">SAP Fornecedor:</span>
                <p>{partner.sapFornecedor || "-"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lista de Colaboradores */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Funcionários
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                {loading ? "..." : collaborators.length}
              </span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : collaborators.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Matrícula</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collaborators.map((collab) => (
                      <TableRow key={collab.id}>
                        <TableCell className="font-medium">{collab.nome}</TableCell>
                        <TableCell>{collab.cargo || "-"}</TableCell>
                        <TableCell>{collab.telefone ? formatPhone(collab.telefone) : "-"}</TableCell>
                        <TableCell>{collab.matricula || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-md">
                Nenhum funcionário cadastrado para este parceiro.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
