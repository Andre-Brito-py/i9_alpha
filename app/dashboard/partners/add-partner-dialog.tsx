"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { formatCNPJ, validateCNPJ } from "@/lib/utils"

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
import { Alert, AlertDescription } from "@/components/ui/alert"

const partnerSchema = z.object({
  nickname: z.string().min(1, "Apelido é obrigatório"),
  nomeFantasia: z.string().optional(),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional().refine((val) => !val || validateCNPJ(val), "CNPJ inválido"),
  sapCliente: z.string().optional(),
  sapFornecedor: z.string().optional(),
})

type PartnerFormValues = z.infer<typeof partnerSchema>

export function AddPartnerDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
  })

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    e.target.value = formatted
    setValue("cnpj", formatted)
  }

  const onSubmit = async (data: PartnerFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar parceiro")
      }

      setOpen(false)
      reset()
      router.refresh()
    } catch (err) {
      setError("Ocorreu um erro ao salvar o parceiro.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Parceiro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Parceiro</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo parceiro. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                Apelido
              </Label>
              <Input
                id="nickname"
                className="col-span-3"
                {...register("nickname")}
              />
            </div>
            {errors.nickname && (
               <p className="text-sm text-red-500 text-right">{errors.nickname.message}</p>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nomeFantasia" className="text-right">
                Nome Fantasia
              </Label>
              <Input
                id="nomeFantasia"
                className="col-span-3"
                {...register("nomeFantasia")}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cnpj" className="text-right">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                className="col-span-3"
                {...register("cnpj")}
                onChange={handleCNPJChange}
                maxLength={18}
              />
            </div>
            {errors.cnpj && (
               <p className="text-sm text-red-500 text-right">{errors.cnpj.message}</p>
            )}
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
