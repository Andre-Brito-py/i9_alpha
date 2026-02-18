"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/ui/image-upload"
import { DemandColumn } from "./types"
import { SubDemandList } from "./sub-demand-list"

const demandSchema = z.object({
  partnerId: z.string().min(1, "Parceiro é obrigatório"),
  collaboratorId: z.string().optional(),
  assigneeId: z.string().min(1, "Responsável é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  urgencia: z.string().min(1, "Urgência é obrigatória"),
  status: z.string().min(1, "Status é obrigatório"),
  prazo: z.date().optional(),
  descricao: z.string().optional(),
  evidenceFinish: z.string().optional(),
})

type DemandFormValues = z.infer<typeof demandSchema>

type PartnerOption = {
  id: number
  nickname: string
}

type CollaboratorOption = {
  id: number
  nome: string
}

type UserOption = {
  id: number
  name: string
}

interface EditDemandDialogProps {
  demand: DemandColumn
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditDemandDialog({ demand, open, onOpenChange }: EditDemandDialogProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<PartnerOption[]>([])
  const [collaborators, setCollaborators] = useState<CollaboratorOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [file, setFile] = useState<File | null>(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      partnerId: demand.partner.id.toString(),
      collaboratorId: demand.collaborator?.id?.toString() || "",
      assigneeId: demand.assignee?.id.toString() || "",
      tipo: demand.tipo || "",
      urgencia: demand.urgencia,
      status: demand.status,
      prazo: demand.prazo ? new Date(demand.prazo) : undefined,
      descricao: demand.descricao || "",
    }
  })

  const selectedPartnerId = watch("partnerId")

  // Update form values when demand changes
  useEffect(() => {
    if (demand) {
      setValue("partnerId", demand.partner.id.toString())
      setValue("collaboratorId", demand.collaborator?.id?.toString() || "")
      setValue("assigneeId", demand.assignee?.id?.toString() || "")
      setValue("tipo", demand.tipo || "")
      setValue("urgencia", demand.urgencia)
      setValue("status", demand.status)
      setValue("prazo", demand.prazo ? new Date(demand.prazo) : undefined)
      setValue("descricao", demand.descricao || "")
    }
  }, [demand, setValue])

  useEffect(() => {
    if (selectedPartnerId) {
      // Fetch collaborators for selected partner
      fetch(`/api/collaborators?partnerId=${selectedPartnerId}`)
        .then(res => res.json())
        .then(data => setCollaborators(data))
        .catch(err => console.error("Failed to fetch collaborators", err))
    } else {
      setCollaborators([])
    }
  }, [selectedPartnerId])

  useEffect(() => {
    // Fetch partners and users
    const fetchData = async () => {
      try {
        const [partnersRes, usersRes] = await Promise.all([
          fetch("/api/partners"),
          fetch("/api/users")
        ])

        if (partnersRes.ok) {
          const data = await partnersRes.json()
          setPartners(data)
        }
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data)
        }
      } catch (e) {
        console.error("Failed to fetch data", e)
      }
    }
    if (open) {
      fetchData()
    }
  }, [open])

  const onSubmit = async (data: DemandFormValues) => {
    setLoading(true)
    setError(null)

    try {
      let evidenceUrl = ""

      // Handle file upload if status is being changed to CONCLUIDA
      if (data.status === "CONCLUIDA" && file) {
        const formData = new FormData()
        formData.append("file", file)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          evidenceUrl = uploadData.url
        } else {
          console.error("Failed to upload evidence")
        }
      }

      const response = await fetch(`/api/demands/${demand.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          partnerId: parseInt(data.partnerId),
          collaboratorId: data.collaboratorId ? parseInt(data.collaboratorId) : null,
          prazo: data.prazo ? data.prazo.toISOString() : null,
          evidenceFinish: evidenceUrl || demand.evidenceFinish // Keep existing if no new one provided
        }),
      })

      if (!response.ok) {
        const msg = await response.text()
        throw new Error(msg || "Erro ao atualizar demanda")
      }

      onOpenChange(false)
      setFile(null)
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao atualizar a demanda."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const prazo = watch("prazo")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Demanda</DialogTitle>
          <DialogDescription>
            Atualize as informações da demanda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partner" className="text-right">
                Parceiro
              </Label>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => setValue("partnerId", val)}
                  defaultValue={demand.partner.id.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um parceiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id.toString()}>
                        {partner.nickname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.partnerId && (
                  <p className="text-sm text-red-500 mt-1">{errors.partnerId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collaborator" className="text-right">
                Colaborador
              </Label>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => setValue("collaboratorId", val)}
                  disabled={!selectedPartnerId || collaborators.length === 0}
                  defaultValue={demand.collaborator?.id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedPartnerId ? "Selecione um parceiro primeiro" : (collaborators.length === 0 ? "Nenhum colaborador encontrado" : "Selecione um colaborador (opcional)")} />
                  </SelectTrigger>
                  <SelectContent>
                    {collaborators.map((collab) => (
                      <SelectItem key={collab.id} value={collab.id.toString()}>
                        {collab.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                Responsável
              </Label>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => setValue("assigneeId", val)}
                  defaultValue={demand.assignee?.id.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assigneeId && (
                  <p className="text-sm text-red-500 mt-1">{errors.assigneeId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Tipo
              </Label>
              <Input
                id="tipo"
                className="col-span-3"
                {...register("tipo")}
              />
            </div>
            {errors.tipo && (
              <p className="text-sm text-red-500 text-right">{errors.tipo.message}</p>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="urgencia" className="text-right">
                Urgência
              </Label>
              <div className="col-span-3">
                <Select
                  defaultValue={demand.urgencia}
                  onValueChange={(val) => setValue("urgencia", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a urgência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAIXA">Baixa</SelectItem>
                    <SelectItem value="MEDIA">Média</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="URGENTE">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select
                  defaultValue={demand.status}
                  onValueChange={(val) => setValue("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABERTA">Aberta</SelectItem>
                    <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                    <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {watch("status") === "CONCLUIDA" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="evidenceFinish" className="text-right">
                  Evidência (Conclusão)
                </Label>
                <div className="col-span-3">
                  <Input
                    id="evidenceFinish"
                    type="file"
                    accept="image/*"
                  />
                  {demand.evidenceFinish && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Já existe uma evidência anexada. Se desejar alterá-la, selecione um novo arquivo.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Prazo</Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !prazo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {prazo ? format(prazo, "PPP") : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={prazo}
                      onSelect={(date) => setValue("prazo", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {(demand.evidenceOpen || demand.evidenceFinish) && (
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-semibold">Evidências Anexadas</Label>
                <div className="grid grid-cols-2 gap-4">
                  {demand.evidenceOpen && (
                    <div className="flex flex-col gap-2 rounded-lg border p-3 bg-muted/50">
                      <span className="text-sm font-medium">Abertura:</span>
                      <div className="relative group cursor-pointer overflow-hidden rounded-md border bg-background aspect-video">
                        <img
                          src={demand.evidenceOpen}
                          alt="Evidência Abertura"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <a
                          href={demand.evidenceOpen}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-white text-xs font-bold uppercase tracking-wider">Ver Original / Download</span>
                        </a>
                      </div>
                    </div>
                  )}
                  {demand.evidenceFinish && (
                    <div className="flex flex-col gap-2 rounded-lg border p-3 bg-muted/50">
                      <span className="text-sm font-medium">Conclusão:</span>
                      <div className="relative group cursor-pointer overflow-hidden rounded-md border bg-background aspect-video">
                        <img
                          src={demand.evidenceFinish}
                          alt="Evidência Conclusão"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <a
                          href={demand.evidenceFinish}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="text-white text-xs font-bold uppercase tracking-wider">Ver Original / Download</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="descricao"
                  className="w-full"
                  {...register("descricao")}
                />
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>

        <SubDemandList demandId={demand.id} />
      </DialogContent>
    </Dialog>
  )
}
