"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, AlertCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/ui/image-upload"
import { DemandColumn } from "./types"

interface FinishDemandDialogProps {
    demand: DemandColumn
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FinishDemandDialog({ demand, open, onOpenChange }: FinishDemandDialogProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)

    const handleFinish = async () => {
        setLoading(true)
        setError(null)

        try {
            let evidenceUrl = demand.evidenceFinish || ""

            if (file) {
                const formData = new FormData()
                formData.append("file", file)

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!uploadRes.ok) throw new Error("Falha no upload da evidência")

                const uploadData = await uploadRes.json()
                evidenceUrl = uploadData.url
            }

            const response = await fetch(`/api/demands/${demand.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerId: demand.partner.id,
                    assigneeId: demand.assignee?.id,
                    tipo: demand.tipo,
                    urgencia: demand.urgencia,
                    status: "CONCLUIDA",
                    evidenceFinish: evidenceUrl,
                    descricao: demand.descricao, // keep same description
                    prazo: demand.prazo,
                    collaboratorId: demand.collaborator?.id
                }),
            })

            if (!response.ok) {
                throw new Error("Erro ao concluir demanda")
            }

            onOpenChange(false)
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao concluir demanda")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <DialogTitle>Concluir Demanda</DialogTitle>
                    </div>
                    <DialogDescription>
                        Confirme a conclusão da demanda para o parceiro <strong>{demand.partner.nickname}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Anexar Evidência de Conclusão (Opcional)</p>
                        <ImageUpload
                            onChange={setFile}
                            label="Arraste ou clique para anexar evidência de conclusão"
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleFinish} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? "Concluindo..." : "Concluir Demanda"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
