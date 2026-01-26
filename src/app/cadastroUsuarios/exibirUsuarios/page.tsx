import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "./data-table"
import { UserControls } from "@/components/user-controls"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { columns } from "./columns"
import { getUsuariosAction } from "@/app/actions/usuarios"
import { listarUnidades, listarPerfis } from "@/app/actions/admin" 

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

type SearchParams = Promise<{ term?: string; status?: string; perfil?: string }>

export default async function Page(props: { searchParams: SearchParams }) {
  const params = await props.searchParams;

  const [data, unidades, perfis] = await Promise.all([
    getUsuariosAction({
      term: params.term,
      status: params.status,
      perfil: params.perfil
    }),
    listarUnidades(),
    listarPerfis()
  ])
    
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Gerenciar Usuários</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex-1">
          {/* CORREÇÃO AQUI: Adicionado px-4 para mobile e md:px-0 para telas maiores se preferir, 
              mas px-4 ou container com padding é essencial no mobile */}
          <div className="container mx-auto py-6 px-4 md:py-10 space-y-4">
             <UserControls unidades={unidades} perfis={perfis} />
             <DataTable columns={columns} data={data} />
          </div>
        </div>
        
      </SidebarInset>
    </SidebarProvider>
  );
}