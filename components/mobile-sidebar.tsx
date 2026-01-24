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
  ListTodo,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { useState, useEffect } from "react"

export default function MobileSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role
  const [open, setOpen] = useState(false)

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-gray-900 text-white border-r-gray-800">
        <SheetHeader className="p-6">
            <SheetTitle className="text-white text-left text-2xl font-bold">i9 Manager</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
            <div className="px-3 py-2 flex-1">
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
            <div className="px-3 py-2 pb-8">
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
      </SheetContent>
    </Sheet>
  )
}
