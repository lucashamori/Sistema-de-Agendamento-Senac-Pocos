"use client"

import * as React from "react"
import {
  CalendarCheck,
  FileChartColumn,
  GraduationCap,
  Users,
  Loader2
} from "lucide-react"

import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getDadosUsuarioSidebar } from "@/app/actions/auth" // Importe sua server action

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// DADOS ESTÁTICOS (Menu Completo)
const DATA_MENU = {
  teams: [
    {
      name: "Senac Minas",
      logo: GraduationCap,
      plan: "LabManager",
    },
  ],
  navMain: [
    {
      title: "Agendamento",
      url: "#",
      icon: CalendarCheck,
      isActive: true,
      items: [
        {
          title: "Agendar Laboratório",
          url: "/agendamentos/novo",
        },
        {
           title: "Minha Agenda",
           url: "/agendamentos/meus",
        },
      ],
    },
    {
      title: "Relatórios",
      url: "#",
      icon: FileChartColumn,
      items: [
        {
          title: "Histórico",
          url: "/relatorios/historico",
        },
      ],
    },
    {
      title: "Cadastros", // <--- Este item será filtrado
      url: "#",
      icon: Users,
      items: [
        {
          title: "Cadastrar Docentes",
          url: "/cadastroDocentes",
        },
        {
          title: "Cadastrar Administrativos",
          url: "#",
        },
        {
          title: "Cadastrar Turmas",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Estado para guardar o menu filtrado
  const [menuItems, setMenuItems] = React.useState(DATA_MENU.navMain)
  
  // Estado para guardar dados do usuário real (para o rodapé)
  const [userData, setUserData] = React.useState({
    name: "Carregando...",
    email: "...",
    avatar: "",
  })

  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Busca dados no Banco (Neon)
        const infoBanco = await getDadosUsuarioSidebar(user.uid)
        
        if (infoBanco) {
          // Atualiza o rodapé com nome real
          setUserData({
            name: infoBanco.nomeUsuario,
            email: user.email || "",
            avatar: "", // Se tiver foto no futuro, coloca aqui
          })

          // 2. LÓGICA DE FILTRO DA SIDEBAR
          const cargo = infoBanco.cargo // "Administrador" ou "Docente"

          if (cargo === "Administrador") {
            // Admin vê TUDO
            setMenuItems(DATA_MENU.navMain)
          } else {
            // Docente vê apenas o que NÃO é "Cadastros"
            const menuFiltrado = DATA_MENU.navMain.filter(item => 
              item.title !== "Cadastros"
            )
            setMenuItems(menuFiltrado)
          }
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* O TeamSwitcher já se vira sozinho para buscar os dados dele */}
        <TeamSwitcher  /> 
      </SidebarHeader>
      
      <SidebarContent>
        {loading ? (
           <div className="flex justify-center p-4">
             <Loader2 className="animate-spin" />
           </div>
        ) : (
           /* Passamos o menuItems (que pode estar filtrado) em vez do estático */
           <NavMain items={menuItems} />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}