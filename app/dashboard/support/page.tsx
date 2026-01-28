"use client"

import { Bot, MessageCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SupportPage() {
  return (
    <div className="p-6 h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Card className="max-w-md w-full text-center shadow-lg border-2 border-dashed">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Atendimento Inteligente
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
            Conectado ao WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="font-semibold">Disponível em breve</p>
            <p className="text-sm mt-1 opacity-90">
              Estamos finalizando a integração com a nossa IA para melhor atendê-lo.
            </p>
          </div>

          <div className="opacity-50 pointer-events-none grayscale">
            <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-12 text-lg">
              <MessageCircle className="w-5 h-5" />
              Iniciar Conversa no WhatsApp
            </Button>
          </div>
          
          <p className="text-xs text-slate-400">
            Em breve você poderá tirar dúvidas sobre demandas, parceiros e muito mais diretamente pelo WhatsApp.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
