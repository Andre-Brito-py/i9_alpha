"use client"

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
  ListTodo
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role

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
      icon: Building2,
      href: "/dashboard/partners",
      color: "text-pink-700",
      roles: ["ADMIN", "SUPERVISOR", "BACKOFFICE"],
    },
    {
      label: "Exportar",
      icon: FileText,
      href: "/dashboard/export",
      color: "text-green-600",
      roles: ["ADMIN", "SUPERVISOR", "BACKOFFICE"],
    },
    {
      label: "Usuários",
      icon: Users,
      href: "/dashboard/users",
      color: "text-orange-700",
      roles: ["ADMIN"],
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/dashboard/settings",
      roles: ["ADMIN", "SUPERVISOR"],
    },
  ]

  const filteredRoutes = routes.filter((route) => 
    !route.roles || (role && route.roles.includes(role))
  )

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">i9 Manager</h1>
        </Link>
        <div className="space-y-1">
          {filteredRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
         <div className="mb-4 px-3 text-xs text-zinc-400">
            Logado como: <span className="text-white font-bold">{session?.user?.name}</span> ({role})
         </div>
         <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: "/login" })}
         >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
         </Button>
      </div>
    </div>
  )
}
