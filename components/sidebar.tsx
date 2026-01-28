"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Building2,
  ListTodo,
  ChevronLeft,
  ChevronRight,
  Bot,
  FileSpreadsheet,
  UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role
  const [collapsed, setCollapsed] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
      roles: ["ADMIN", "SUPERVISOR", "BACKOFFICE"],
    },
    {
      label: "Demandas",
      icon: ListTodo,
      href: "/dashboard/demands",
      color: "text-violet-500",
      roles: ["ADMIN", "SUPERVISOR", "BACKOFFICE"],
    },
    {
      label: "Parceiros",
      icon: Users,
      href: "/dashboard/partners",
      color: "text-pink-700",
      roles: ["ADMIN", "SUPERVISOR", "BACKOFFICE"],
    },
    {
      label: "Exportar",
      icon: FileSpreadsheet,
      href: "/dashboard/export",
      color: "text-emerald-500",
      roles: ["ADMIN", "SUPERVISOR", "BACKOFFICE"],
    },
    {
      label: "Usuários",
      icon: UserCog,
      href: "/dashboard/users",
      color: "text-orange-700",
      roles: ["ADMIN"],
    },
    {
      label: "Atendimento IA",
      icon: Bot,
      href: "/dashboard/support",
      color: "text-blue-600",
      roles: ["ADMIN", "SUPERVISOR", "BACKOFFICE"],
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/dashboard/settings",
      roles: ["ADMIN", "SUPERVISOR", "BACKOFFICE"],
    },
  ]

  const filteredRoutes = routes.filter((route) => 
    !route.roles || (role && route.roles.includes(role))
  )

  return (
    <div 
      className={cn(
        "relative flex flex-col h-full bg-gray-900 text-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <Button
        onClick={() => setCollapsed(!collapsed)}
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 hidden md:flex shadow-md"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="px-3 py-6 flex-1 overflow-y-auto">
        <Link href="/dashboard" className={cn("flex items-center mb-10 transition-all", collapsed ? "justify-center" : "pl-3")}>
          <h1 className={cn("font-bold transition-all duration-300 whitespace-nowrap overflow-hidden", collapsed ? "text-xl" : "text-2xl")}>
            {collapsed ? "i9" : "i9 Manager"}
          </h1>
        </Link>
        
        <div className="space-y-1">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
                collapsed ? "justify-center" : "justify-start"
              )}
              title={collapsed ? route.label : undefined}
            >
              <div className={cn("flex items-center transition-all", collapsed ? "justify-center" : "flex-1")}>
                <route.icon className={cn("h-5 w-5", route.color, collapsed ? "mr-0" : "mr-3")} />
                <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block")}>
                  {route.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="px-3 py-4">
         {!collapsed && (
            <div className="mb-4 px-3 text-xs text-zinc-400 animate-in fade-in duration-300">
                Logado como: <span className="text-white font-bold block truncate">{session?.user?.name}</span> ({role})
            </div>
         )}
         <Button 
            variant="destructive" 
            className={cn("w-full transition-all", collapsed ? "justify-center px-0" : "justify-start")}
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sair"
         >
            <LogOut className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
            <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block")}>
              Sair
            </span>
         </Button>
      </div>
    </div>
  )
}
