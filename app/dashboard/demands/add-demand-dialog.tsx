"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Plus, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
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

const demandSchema = z.object({
  partnerId: z.string().min(1, "Parceiro é obrigatório"),
  assigneeId: z.string().min(1, "Responsável é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  urgencia: z.string().min(1, "Urgência é obrigatória"),
  prazo: z.date().optional(),
  descricao: z.string().optional(),
})

type DemandFormValues = z.infer<typeof demandSchema>

type PartnerOption = {
  id: number
  nickname: string
}

type UserOption = {
  id: number
  name: string
}

export function AddDemandDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<PartnerOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DemandFormValues>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      urgencia: "MEDIA"
    }
  })

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
      const response = await fetch("/api/demands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          partnerId: parseInt(data.partnerId), // Convert to number for API
          prazo: data.prazo ? data.prazo.toISOString() : null
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar demanda")
      }

      setOpen(false)
      reset()
      router.refresh()
    } catch (err) {
      setError("Ocorreu um erro ao salvar a demanda.")
    } finally {
      setLoading(false)
    }
  }

  const prazo = watch("prazo")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Demanda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
