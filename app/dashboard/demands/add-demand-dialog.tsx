"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Plus, CalendarIcon, Trash2, Circle, Image as ImageIcon, Upload, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const demandSchema = z.object({
  partnerId: z.string().min(1, "Parceiro é obrigatório"),
  collaboratorId: z.string().optional(),
  assigneeId: z.string().min(1, "Responsável é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  urgencia: z.string().min(1, "Urgência é obrigatória"),
  prazo: z.date().optional(),
  descricao: z.string().optional(),
  evidenceOpen: z.string().optional(),
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

type LocalSubStep = {
  nome: string
}

type LocalSubDemand = {
  titulo: string
  evidence: string | null
  subSteps: LocalSubStep[]
}

export function AddDemandDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<PartnerOption[]>([])
  const [collaborators, setCollaborators] = useState<CollaboratorOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [subDemands, setSubDemands] = useState<LocalSubDemand[]>([])
  const [tempSubTitle, setTempSubTitle] = useState("")
  const [tempStepTitles, setTempStepTitles] = useState<Record<number, string>>({})
  const [subUploading, setSubUploading] = useState<number | null>(null)

  const addLocalSubDemand = () => {
    if (!tempSubTitle.trim()) return
    setSubDemands(prev => [...prev, { titulo: tempSubTitle, evidence: null, subSteps: [] }])
    setTempSubTitle("")
  }

  const handleAddLocalEvidence = async (index: number, file: File | null) => {
    if (!file) return

    try {
      setSubUploading(index)
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Falha no upload")

      const { url } = await uploadRes.json()

      setSubDemands(prev => prev.map((sd, i) =>
        i === index ? { ...sd, evidence: url } : sd
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setSubUploading(null)
    }
  }

  const removeLocalSubDemand = (index: number) => {
    setSubDemands(prev => prev.filter((_, i) => i !== index))
  }

  const addLocalStep = (subIndex: number) => {
    const title = tempStepTitles[subIndex]
    if (!title?.trim()) return

    setSubDemands(prev => prev.map((sd, i) =>
      i === subIndex
        ? { ...sd, subSteps: [...sd.subSteps, { nome: title }] }
        : sd
    ))
    setTempStepTitles(prev => ({ ...prev, [subIndex]: "" }))
  }

  const removeLocalStep = (subIndex: number, stepIndex: number) => {
    setSubDemands(prev => prev.map((sd, i) =>
      i === subIndex
        ? { ...sd, subSteps: sd.subSteps.filter((_, si) => si !== stepIndex) }
        : sd
    ))
  }

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      urgencia: "MEDIA"
    }
  })

  const selectedPartnerId = watch("partnerId")

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
          if (data.length === 1) {
            setValue("assigneeId", data[0].id.toString())
          }
        }
      } catch (e) {
        console.error("Failed to fetch data", e)
      }
    }
    if (open) {
      fetchData()
    }
  }, [open, setValue])

  const onSubmit = async (data: DemandFormValues) => {
    setLoading(true)
    setError(null)

    try {
      let evidenceUrl = ""

      // Handle file upload if present
      if (file) {
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
          throw new Error("Falha ao fazer upload da evidência. Por favor, tente novamente.")
        }
      }

      const response = await fetch("/api/demands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          partnerId: parseInt(data.partnerId), // Convert to number for API
          collaboratorId: (data.collaboratorId && data.collaboratorId !== "undefined") ? parseInt(data.collaboratorId) : null,
          prazo: data.prazo ? data.prazo.toISOString() : null,
          evidenceOpen: evidenceUrl || null,
          subDemands: subDemands.map(sd => ({
            titulo: sd.titulo,
            evidence: sd.evidence,
            subSteps: sd.subSteps
          }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || "Erro ao criar demanda")
      }

      setOpen(false)
      reset()
      setFile(null)
      setSubDemands([])
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar a demanda.")
    } finally {
      setLoading(false)
    }
  }

  const prazo = watch("prazo")

  // Evitar erro de hidratação com datas
  const formatPrazo = (date: Date) => {
    try {
      return format(date, "dd/MM/yyyy")
    } catch (e) {
      return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Demanda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Demanda</DialogTitle>
          <DialogDescription>
            Crie uma nova demanda vinculada a um parceiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partner" className="text-right">
                Parceiro
              </Label>
              <div className="col-span-3">
                <Select onValueChange={(val) => setValue("partnerId", val)}>
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
                <Select onValueChange={(val) => setValue("collaboratorId", val)} disabled={!selectedPartnerId || collaborators.length === 0}>
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
                <Select onValueChange={(val) => setValue("assigneeId", val)}>
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
                  defaultValue="MEDIA"
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
                      {prazo ? formatPrazo(prazo) : <span>Escolha uma data</span>}
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="descricao"
                className="col-span-3"
                {...register("descricao")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceOpen">
                Evidência (Abertura)
              </Label>
              <ImageUpload
                id="evidenceOpen"
                onChange={setFile}
                label="Arraste ou clique para anexar evidência de abertura"
              />
            </div>

            <Separator className="my-2" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Sub-demandas e Etapas (Opcional)</Label>
              </div>

              <div className="space-y-3">
                {subDemands.map((sub, subIndex) => (
                  <div key={subIndex} className="border rounded-md p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium text-sm">{sub.titulo}</span>
                        {sub.evidence && (
                          <ImageIcon size={14} className="text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSubUploading(subUploading === subIndex ? null : subIndex)}
                        >
                          <Upload size={14} className={cn(subUploading === subIndex && "text-primary")} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeLocalSubDemand(subIndex)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {sub.evidence && (
                      <div className="relative group w-full max-w-[80px] rounded-md overflow-hidden border aspect-square mb-2 ml-4">
                        <img src={sub.evidence} alt="Evidência" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setSubDemands(prev => prev.map((sd, i) =>
                              i === subIndex ? { ...sd, evidence: null } : sd
                            ))
                          }}
                          className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    )}

                    {subUploading === subIndex && (
                      <div className="px-4 py-2 border-t mt-2">
                        <ImageUpload
                          id={`sub-evidence-${subIndex}`}
                          onChange={(file) => handleAddLocalEvidence(subIndex, file)}
                          label="Anexar evidência à sub-demanda"
                        />
                      </div>
                    )}

                    <div className="pl-4 space-y-1">
                      {sub.subSteps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2">
                            <Circle className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{step.nome}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 text-destructive"
                            onClick={() => removeLocalStep(subIndex, stepIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      <div className="flex gap-2 items-center mt-2">
                        <Input
                          placeholder="Adicionar etapa..."
                          className="h-7 text-xs"
                          value={tempStepTitles[subIndex] || ""}
                          onChange={(e) => setTempStepTitles(prev => ({ ...prev, [subIndex]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addLocalStep(subIndex)
                            }
                          }}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => addLocalStep(subIndex)}
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 items-center pt-2">
                  <Input
                    placeholder="Nova sub-demanda..."
                    className="h-9"
                    value={tempSubTitle}
                    onChange={(e) => setTempSubTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addLocalSubDemand()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLocalSubDemand}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
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
              {loading ? "Criando..." : "Criar Demanda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
