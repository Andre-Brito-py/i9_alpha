"use client"

import { useState, useEffect } from "react"
import { Bell, AlertCircle, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

type NotificationDemand = {
  id: number
  tipo: string | null
  prazo: string
  partner: {
    nickname: string | null
  }
}

export function Notifications() {
  const [delayed, setDelayed] = useState<NotificationDemand[]>([])
  const [upcoming, setUpcoming] = useState<NotificationDemand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications")
        if (res.ok) {
          const data = await res.json()
          setDelayed(data.delayed)
          setUpcoming(data.upcoming)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    // Poll every minute
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const totalCount = delayed.length + upcoming.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {totalCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : totalCount === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação pendente.
            </div>
          ) : (
            <>
              {delayed.length > 0 && (
                <div className="py-2">
                  <h4 className="px-2 text-xs font-semibold text-red-500 mb-2 flex items-center">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Atrasadas ({delayed.length})
                  </h4>
                  {delayed.map((demand) => (
                    <DropdownMenuItem key={demand.id} asChild>
                      <Link href="/dashboard/demands" className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                        <div className="font-medium text-sm">
                          {demand.partner.nickname || "Sem parceiro"} - {demand.tipo || "Sem tipo"}
                        </div>
                        <div className="text-xs text-red-500">
                          Venceu em: {format(new Date(demand.prazo), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
              
              {delayed.length > 0 && upcoming.length > 0 && <DropdownMenuSeparator />}

              {upcoming.length > 0 && (
                <div className="py-2">
                  <h4 className="px-2 text-xs font-semibold text-amber-500 mb-2 flex items-center">
                    <CalendarClock className="mr-1 h-3 w-3" />
                    Próximas ({upcoming.length})
                  </h4>
                  {upcoming.map((demand) => (
                    <DropdownMenuItem key={demand.id} asChild>
                      <Link href="/dashboard/demands" className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                        <div className="font-medium text-sm">
                          {demand.partner.nickname || "Sem parceiro"} - {demand.tipo || "Sem tipo"}
                        </div>
                        <div className="text-xs text-amber-600">
                          Vence em: {format(new Date(demand.prazo), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
