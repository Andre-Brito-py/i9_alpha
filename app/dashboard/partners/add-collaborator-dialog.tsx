"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Plus, UserPlus } from "lucide-react"

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
import { formatPhone, formatMatricula } from "@/lib/utils"

const collaboratorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cargo: z.string().optional(),
  telefone: z.string().min(10, "Telefone inválido (mínimo 10 dígitos)"),
  matricula: z.string().regex(/^[A-Z]\d{7}$/, "Matrícula deve ser Letra + 7 números (Ex: T1234567)"),
})

type CollaboratorFormValues = z.infer<typeof collaboratorSchema>

interface AddCollaboratorDialogProps {
  partnerId: number
  partnerName: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddCollaboratorDialog({ 
  partnerId, 
  partnerName, 
  trigger, 
  onSuccess,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: AddCollaboratorDialogProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CollaboratorFormValues>({
    resolver: zodResolver(collaboratorSchema),
  })

  // Watch fields for formatting
  const telefoneValue = watch("telefone")
  const matriculaValue = watch("matricula")

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setValue("telefone", formatted, { shouldValidate: true })
  }

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMatricula(e.target.value)
    // Limitar a 8 caracteres (1 letra + 7 numeros)
    if (formatted.length <= 8) {
        setValue("matricula", formatted, { shouldValidate: true })
    }
  }

  const onSubmit = async (data: CollaboratorFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/collaborators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          partnerId,
        }),
      })

      if (!response.ok) {
        const resBody = await response.text()
        throw new Error(resBody || "Erro ao criar colaborador")
      }

      setOpen(false)
      reset()
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error(err)
      setError("Ocorreu um erro ao salvar o colaborador.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Colaborador
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Colaborador</DialogTitle>
          <DialogDescription>
            Adicionar funcionário para {partnerName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <div className="col-span-3">
                <Input
                  id="nome"
                  {...register("nome")}
                  placeholder="Nome do funcionário"
                />
                {errors.nome && (
                  <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cargo" className="text-right">
                Cargo
              </Label>
              <div className="col-span-3">
                <Input
                  id="cargo"
                  {...register("cargo")}
                  placeholder="Gerente, Vendedor, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">
                Telefone
              </Label>
              <div className="col-span-3">
                <Input
                  id="telefone"
                  {...register("telefone")}
                  onChange={handlePhoneChange}
                  placeholder="(XX) XXXXX-XXXX"
                />
                {errors.telefone && (
                  <p className="text-sm text-red-500 mt-1">{errors.telefone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="matricula" className="text-right">
                Matrícula
              </Label>
              <div className="col-span-3">
                <Input
                  id="matricula"
                  {...register("matricula")}
                  onChange={handleMatriculaChange}
                  placeholder="T1234567"
                  maxLength={8}
                />
                {errors.matricula && (
                  <p className="text-sm text-red-500 mt-1">{errors.matricula.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="col-span-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Colaborador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
