import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Suas informações de usuário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Nome</Label>
            <Input value={session?.user?.name || ''} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={session?.user?.email || ''} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Função</Label>
            <Input value={session?.user?.role || ''} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Gerenciar sua senha</CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" disabled>Alterar Senha (Em breve)</Button>
        </CardContent>
      </Card>
    </div>
  )
}
