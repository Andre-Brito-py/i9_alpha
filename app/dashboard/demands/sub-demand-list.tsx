"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ChevronRight, ChevronDown, CheckCircle2, Circle, Image as ImageIcon, ExternalLink, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/image-upload"

type SubStep = {
  id: number
  nome: string
  status: string
}

type SubDemand = {
  id: number
  titulo: string
  descricao: string | null
  evidence: string | null
  subSteps: SubStep[]
}

interface SubDemandListProps {
  demandId: number
}

export function SubDemandList({ demandId }: SubDemandListProps) {
  const [subDemands, setSubDemands] = useState<SubDemand[]>([])
  const [loading, setLoading] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [adding, setAdding] = useState(false)
  const [uploadingFor, setUploadingFor] = useState<number | null>(null)

  // State for new step inputs: Record<subDemandId, string>
  const [newStepTitles, setNewStepTitles] = useState<Record<number, string>>({})

  // State for expanded sub-demands: Record<subDemandId, boolean>
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  const fetchSubDemands = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/sub-demands?demandId=${demandId}`)
      if (res.ok) {
        const data = await res.json()
        setSubDemands(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubDemands()
  }, [demandId])

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAddSubDemand = async () => {
    if (!newTitle.trim()) return

    try {
      setAdding(true)
      const res = await fetch("/api/sub-demands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demandId,
          titulo: newTitle,
        })
      })

      if (res.ok) {
        setNewTitle("")
        fetchSubDemands()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  const handleAddStep = async (subDemandId: number) => {
    const title = newStepTitles[subDemandId]
    if (!title?.trim()) return

    try {
      const res = await fetch("/api/sub-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subDemandId,
          nome: title
        })
      })

      if (res.ok) {
        setNewStepTitles(prev => ({ ...prev, [subDemandId]: "" }))
        fetchSubDemands()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleStep = async (step: SubStep) => {
    const newStatus = step.status === "CONCLUIDA" ? "PENDENTE" : "CONCLUIDA"

    // Optimistic update
    setSubDemands(prev => prev.map(sd => ({
      ...sd,
      subSteps: sd.subSteps.map(s => s.id === step.id ? { ...s, status: newStatus } : s)
    })))

    try {
      await fetch("/api/sub-steps", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: step.id,
          status: newStatus
        })
      })
    } catch (err) {
      console.error(err)
      fetchSubDemands() // Revert on error
    }
  }

  const handleUploadEvidence = async (subDemandId: number, file: File | null) => {
    if (!file) return

    try {
      setUploadingFor(subDemandId)

      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Falha no upload")

      const { url } = await uploadRes.json()

      const res = await fetch("/api/sub-demands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subDemandId,
          evidence: url
        })
      })

      if (res.ok) {
        setUploadingFor(null)
        fetchSubDemands()
      }
    } catch (err) {
      console.error(err)
      setUploadingFor(null)
    }
  }

  const handleDeleteStep = async (stepId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta etapa?")) return

    try {
      await fetch(`/api/sub-steps?id=${stepId}`, { method: "DELETE" })
      fetchSubDemands()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Sub-demandas e Etapas</h3>
      </div>
      <Separator />

      <div className="space-y-4">
        {subDemands.map((sub) => (
          <div key={sub.id} className="border rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-2 cursor-pointer font-medium select-none flex-1"
                onClick={() => toggleExpand(sub.id)}
              >
                {expanded[sub.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>{sub.titulo}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({sub.subSteps.filter(s => s.status === "CONCLUIDA").length}/{sub.subSteps.length})
                </span>
                {sub.evidence && (
                  <ImageIcon size={14} className="text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {sub.evidence && (
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <a href={sub.evidence} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadingFor(uploadingFor === sub.id ? null : sub.id)
                  }}
                >
                  <Upload size={14} className={cn(uploadingFor === sub.id && "text-primary")} />
                </Button>
              </div>
            </div>

            {uploadingFor === sub.id && (
              <div className="px-6 py-2 border-t mt-2">
                <ImageUpload
                  onChange={(file) => handleUploadEvidence(sub.id, file)}
                  label="Anexar evidência à sub-demanda"
                />
              </div>
            )}

            {expanded[sub.id] && (
              <div className="pl-6 space-y-3 mt-2">
                {sub.evidence && (
                  <div className="relative group w-full max-w-[120px] rounded-md overflow-hidden border aspect-square">
                    <img src={sub.evidence} alt="Evidência" className="w-full h-full object-cover" />
                    <a
                      href={sub.evidence}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="text-white h-4 w-4" />
                    </a>
                  </div>
                )}
                <div className="space-y-2">
                  {sub.subSteps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 hover:bg-transparent"
                          onClick={() => handleToggleStep(step)}
                        >
                          {step.status === "CONCLUIDA" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </Button>
                        <span className={cn(
                          "text-sm",
                          step.status === "CONCLUIDA" && "text-muted-foreground line-through"
                        )}>
                          {step.nome}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => handleDeleteStep(step.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 items-center mt-2">
                  <Input
                    placeholder="Nova etapa..."
                    className="h-8 text-sm"
                    value={newStepTitles[sub.id] || ""}
                    onChange={(e) => setNewStepTitles(prev => ({ ...prev, [sub.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddStep(sub.id)
                    }}
                  />
                  <Button size="sm" variant="outline" onClick={() => handleAddStep(sub.id)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-2 items-center pt-2">
          <Input
            placeholder="Nova sub-demanda..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubDemand()
            }}
          />
          <Button onClick={handleAddSubDemand} disabled={adding}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
