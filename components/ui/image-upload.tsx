"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, FileImage, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
    value?: string
    onChange: (file: File | null) => void
    onRemove?: () => void
    label?: string
    id?: string
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    label = "Arraste uma imagem ou clique para selecionar",
    id = "image-upload"
}: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [preview, setPreview] = useState<string | null>(value || null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (value) {
            setPreview(value)
        }
    }, [value])

    const handleFile = useCallback((file: File) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            onChange(file)
        }
    }, [onChange])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const clearFile = () => {
        setPreview(null)
        onChange(null)
        if (onRemove) onRemove()
        if (inputRef.current) inputRef.current.value = ""
    }

    return (
        <div className="space-y-2 w-full">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-all flex flex-col items-center justify-center gap-2 text-center",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                    preview ? "py-4" : "py-10"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    id={id}
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />

                {preview ? (
                    <div className="relative w-full max-w-[200px] aspect-square rounded-md overflow-hidden border">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                            onClick={clearFile}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                            <span className="text-[10px] text-white font-medium uppercase tracking-tight">Pronto</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP (Max. 5MB)</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => inputRef.current?.click()}
                        >
                            Selecionar Arquivo
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}
