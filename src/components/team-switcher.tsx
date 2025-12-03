"use client"

import * as React from "react"
import { Building2, Loader2 } from "lucide-react" // Ícones sugeridos
import { auth } from "@/lib/firebase" // Sua config do firebase
import { onAuthStateChanged } from "firebase/auth"
import { getDadosUsuarioSidebar } from "@/app/actions/auth" // A action que criamos acima

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher() {
  // Estado para guardar os dados vindos do banco
  const [dados, setDados] = React.useState<{
    nomeUnidade: string;
    cargo: string;
  } | null>(null)

  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Escuta o Firebase para saber quando o usuário logou/recarregou a página
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Se tem usuário, busca os detalhes no Neon (Postgres)
        const info = await getDadosUsuarioSidebar(user.uid)
        if (info) {
          setDados({
            nomeUnidade: info.nomeUnidade,
            cargo: info.cargo
          })
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Enquanto carrega, mostra um skeleton ou nada
  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
         <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Se não achou dados (usuário deslogado ou erro), não renderiza nada
  if (!dados) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-default hover:bg-transparent"
        >
          {/* Ícone da Unidade */}
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Building2 className="size-4" />
          </div>
          
          {/* Textos Dinâmicos do Banco */}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {dados.nomeUnidade} {/* Ex: Senac Poços de Caldas */}
            </span>
            <span className="truncate text-xs">
              {dados.cargo} {/* Ex: Administrador ou Docente */}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}