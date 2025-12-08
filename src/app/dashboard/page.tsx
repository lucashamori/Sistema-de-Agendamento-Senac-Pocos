"use client"

import * as React from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
  FlaskConical,
  ListChecks,
  SunMedium,
  Pencil, 
  Loader2,
  X, 
  Check, 
  Lock,
  Unlock
} from "lucide-react"

// --- IMPORTS DE AUTENTICAÇÃO ---
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getDadosUsuarioSidebar } from "@/app/actions/auth"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input" 
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner" 
import { toast } from "sonner"

// --- TIPOS ---
type Periodo = "Manhã" | "Tarde" | "Noite"

interface Usuario {
  id: number
  nome: string
  email: string
  role: "ADMIN" | "USER"
}

interface Agendamento {
  id: number
  dia: number
  mes: number
  ano: number
  periodo: Periodo
  status: "confirmado" | "pendente"
  docente: string
  disciplina: string
  labId?: number
}

// DADOS ESTÁTICOS DOS LABORATÓRIOS
const LABORATORIOS = [
  { id: 1, nome: "Laboratório de Informática 01" },
  { id: 2, nome: "Laboratório de Hardware" },
  { id: 3, nome: "Laboratório de Enfermagem" },
]

export default function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const [date, setDate] = React.useState(new Date(2025, 11, 1)) 
  
  // ESTADOS DE DADOS
  const [agendamentos, setAgendamentos] = React.useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // ESTADO DO USUÁRIO
  const [currentUser, setCurrentUser] = React.useState<Usuario | null>(null)

  // FILTROS
  const [selectedLab, setSelectedLab] = React.useState("0") 
  const [filterStatus, setFilterStatus] = React.useState("todos")
  const [filterPeriod, setFilterPeriod] = React.useState("todos")
  
  // MODAIS
  const [selectedDayDetails, setSelectedDayDetails] = React.useState<{ day: number, month: number, year: number, appointments: Agendamento[] } | null>(null)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<{
    day: number, 
    month: number, 
    year: number, 
    periodo: Periodo,
    labIdPre?: string 
  } | null>(null)

  // --- 1. BUSCA DADOS DO USUÁRIO ---
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const infoBanco = await getDadosUsuarioSidebar(user.uid)
          
          if (infoBanco) {
            const roleMapeada = infoBanco.cargo === "Administrador" ? "ADMIN" : "USER"

            setCurrentUser({
              id: (infoBanco as any).idUsuario || 1, 
              nome: infoBanco.nomeUsuario,
              email: user.email || "",
              role: roleMapeada
            })
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error)
          toast.error("Erro ao carregar perfil do usuário.")
        }
      } else {
        setCurrentUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // --- 2. BUSCA AGENDAMENTOS (SIMULAÇÃO) ---
  React.useEffect(() => {
    const fetchAgendamentos = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        const dadosDoBanco: Agendamento[] = [
          { id: 1, dia: 5, mes: 11, ano: 2025, periodo: "Manhã", status: "confirmado", docente: "Carlos Silva", disciplina: "Algoritmos", labId: 1 },
          { id: 2, dia: 5, mes: 11, ano: 2025, periodo: "Noite", status: "pendente", docente: "Ana Souza", disciplina: "Redes", labId: 1 },
          { id: 3, dia: 12, mes: 11, ano: 2025, periodo: "Tarde", status: "confirmado", docente: "Roberto", disciplina: "Banco de Dados", labId: 2 },
          { id: 4, dia: 15, mes: 11, ano: 2025, periodo: "Manhã", status: "confirmado", docente: "Julia", disciplina: "Design", labId: 3 },
        ]
        setAgendamentos(dadosDoBanco)
      } catch (error) {
        console.error("Erro", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAgendamentos()
  }, [])

  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
  const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // --- INTERAÇÕES ---

  const handleDayClick = (day: number, month: number) => {
    const year = date.getFullYear()
    const isAdmin = currentUser?.role === "ADMIN"
    
    // VERIFICAÇÃO DE DATA RETROATIVA
    const clickedDate = new Date(year, month, day);
    const now = new Date();
    now.setHours(0,0,0,0); 

    if (clickedDate < now && !isAdmin) {
        toast.error("Data Retroativa", {
            description: "Não é possível realizar agendamentos em dias passados.",
            icon: <Lock className="h-4 w-4 text-red-500"/>
        })
        return;
    }

    if (selectedLab === "0") {
        toast.error("Laboratório não selecionado", {
            description: "Por favor, selecione um laboratório no filtro superior."
        })
        return; 
    }

    const apps = getAppointments(day, month, year)
    setSelectedDayDetails({ day, month, year, appointments: apps })
  }

  const handleOpenAddForm = (periodo: Periodo) => {
    if (selectedLab === "0") return;

    setSelectedDayDetails(null) 

    setFormData({
        day: selectedDayDetails!.day,
        month: selectedDayDetails!.month,
        year: selectedDayDetails!.year,
        periodo: periodo,
        labIdPre: selectedLab 
    })
    setIsFormOpen(true)
  }

  const handleSaveAppointment = async (data: { docente: string, disciplina: string, labId: number }) => {
    if (!formData) return;

    const initialStatus = currentUser?.role === 'ADMIN' ? 'confirmado' : 'pendente';

    const newAppointment: Agendamento = {
      id: Math.random(),
      dia: formData.day,
      mes: formData.month,
      ano: formData.year,
      periodo: formData.periodo,
      status: initialStatus,
      docente: data.docente,
      disciplina: data.disciplina || "Sem disciplina",
      labId: data.labId
    }

    setAgendamentos(prev => [...prev, newAppointment])
    setIsFormOpen(false)
    
    if (initialStatus === 'pendente') {
        toast.message("Solicitação enviada!", {
            description: "Seu agendamento aguarda aprovação do administrador.",
            icon: <Clock className="h-4 w-4 text-orange-500" />
        })
    } else {
        toast.success("Agendamento confirmado com sucesso!")
    }
  }

  const handleDeleteAppointment = (id: number) => {
    setAgendamentos(prev => prev.filter(a => a.id !== id))
    
    if (selectedDayDetails) {
       const updatedList = selectedDayDetails.appointments.filter(a => a.id !== id)
       setSelectedDayDetails({ ...selectedDayDetails, appointments: updatedList })
    }
    
    toast.success("Agendamento removido.")
  }

  const handleApproveAppointment = (id: number) => {
    setAgendamentos(prev => prev.map(a => 
        a.id === id ? { ...a, status: "confirmado" } : a
    ))

    if (selectedDayDetails) {
        const updatedList = selectedDayDetails.appointments.map(a => 
            a.id === id ? { ...a, status: "confirmado" } : a
        ) as Agendamento[] 
        setSelectedDayDetails({ ...selectedDayDetails, appointments: updatedList })
    }

    toast.success("Agendamento aprovado!")
  }

  // --- HELPERS CALENDÁRIO ---
  const getCalendarDays = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, currentMonth: false, month: month - 1 });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true, month: month });
    }
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ day: i, currentMonth: false, month: month + 1 });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  const getAppointments = (day: number, month: number, year: number) => {
    if (selectedLab === "0") return [];

    return agendamentos.filter(
      (a) => {
        const matchDate = a.dia === day && a.mes === month && a.ano === year;
        const matchStatus = filterStatus === "todos" ? true : a.status === filterStatus;
        const matchPeriod = filterPeriod === "todos" ? true : a.periodo === filterPeriod;
        const matchLab = String(a.labId) === selectedLab;
        return matchDate && matchStatus && matchPeriod && matchLab;
      }
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#F8F9FA] dark:bg-zinc-950">
        
        {/* HEADER */}
         <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Agendamento</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Agendamentos</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              {currentUser ? (
                <span>Logado como: <strong>{currentUser.nome}</strong> ({currentUser.role})</span>
              ) : (
                <span>Carregando usuário...</span>
              )}
          </div>
        </header>

        {/* ÁREA PRINCIPAL */}
        <div className="flex flex-1 flex-col p-4 md:p-6 overflow-hidden h-[calc(100vh-64px)]">
          
          {/* BARRA SUPERIOR */}
          <div className="flex items-center justify-between w-full mb-6">
              <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg border shadow-sm p-1">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-zinc-500 hover:text-zinc-900"><ChevronLeft className="h-4 w-4" /></Button>
                <div className="px-4 border-x border-zinc-100 dark:border-zinc-800 mx-1 min-w-[180px] flex justify-center">
                    <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-200 tracking-tight">{monthName}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-zinc-500 hover:text-zinc-900"><ChevronRight className="h-4 w-4" /></Button>
              </div>

              <Button onClick={() => {
                if (selectedLab === "0") {
                    toast.error("Selecione um laboratório antes de criar um novo agendamento.")
                    return
                }
                setFormData({ 
                  day: today.getDate(), month: today.getMonth(), year: today.getFullYear(), 
                  periodo: "Manhã", labIdPre: selectedLab 
                })
                setIsFormOpen(true)
              }}>
                <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
              </Button>
          </div>

          {/* BARRA DE CONTROLE E FILTROS */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-4"> 
              <div className="flex items-center gap-4 px-1 shrink-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Manhã
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tarde
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 dark:bg-zinc-100"></span> Noite
                  </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
                <div className="relative w-full sm:w-[200px]">
                    <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                        <SelectTrigger className="h-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-sm w-full text-sm">
                          <div className="flex items-center gap-2 truncate">
                              <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-md shrink-0"><SunMedium className="h-4 w-4 text-orange-600 dark:text-orange-400" /></div>
                              <SelectValue placeholder="Período" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os períodos</SelectItem>
                            <SelectItem value="Manhã">Manhã</SelectItem>
                            <SelectItem value="Tarde">Tarde</SelectItem>
                            <SelectItem value="Noite">Noite</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative w-full sm:w-[200px]">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-10 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-sm w-full text-sm">
                          <div className="flex items-center gap-2 truncate">
                              <div className="bg-violet-100 dark:bg-violet-900/30 p-1 rounded-md shrink-0"><ListChecks className="h-4 w-4 text-violet-600 dark:text-violet-400" /></div>
                              <SelectValue placeholder="Status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os status</SelectItem>
                            <SelectItem value="confirmado">Confirmados</SelectItem>
                            <SelectItem value="pendente">Pendentes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative w-full sm:w-[280px]">
                    <Select value={selectedLab} onValueChange={setSelectedLab}>
                        <SelectTrigger className={cn(
                          "h-10 border-zinc-300 dark:border-zinc-700 shadow-sm w-full text-sm transition-colors",
                          selectedLab === "0" 
                            ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 ring-1 ring-red-200 dark:ring-red-900" 
                            : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        )}>
                          <div className="flex items-center gap-2 truncate">
                              <div className={cn(
                                "p-1 rounded-md shrink-0 transition-colors",
                                selectedLab === "0" ? "bg-zinc-200 dark:bg-zinc-700" : "bg-blue-100 dark:bg-blue-900/30"
                              )}>
                                  <FlaskConical className={cn(
                                    "h-4 w-4", 
                                    selectedLab === "0" ? "text-zinc-500" : "text-blue-600 dark:text-blue-400"
                                  )} />
                              </div>
                              <SelectValue placeholder="Procurar sala" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0" className="text-muted-foreground font-medium">Preencher sala...</SelectItem>
                            {LABORATORIOS.map((lab) => (
                                <SelectItem key={lab.id} value={String(lab.id)}>{lab.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
          </div>

          {/* GRID CALENDÁRIO */}
          <div className="flex-1 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm flex flex-col overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 z-50 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Carregando agenda...</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-7 border-b bg-zinc-50/80 dark:bg-zinc-900/50">
                {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((d) => (
                  <div key={d} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <span className="hidden md:inline">{d}</span>
                    <span className="md:hidden">{d.slice(0, 3)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
                {calendarDays.map((slot, i) => {
                  let slotYear = date.getFullYear();
                  if (slot.month === -1) slotYear = date.getFullYear() - 1; 
                  if (slot.month === 12) slotYear = date.getFullYear() + 1;

                  const apps = getAppointments(slot.day, slot.month, slotYear);
                  
                  const todayDate = new Date();
                  todayDate.setHours(0,0,0,0);
                  const slotDate = new Date(slotYear, slot.month, slot.day);
                  
                  const isToday = slotDate.getTime() === todayDate.getTime();
                  const isPastDay = slotDate < todayDate; 
                  
                  const isCurrentMonth = slot.currentMonth;
                  const dayOfWeek = slotDate.getDay(); 
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  const isAdmin = currentUser?.role === "ADMIN";
                  const isBlockedForUser = (isPastDay || isWeekend) && !isAdmin;

                  return (
                    <div 
                      key={i}
                      onClick={() => {
                        if (!isCurrentMonth) return;

                        if (isWeekend && !isAdmin) {
                            toast.error("Indisponível", {
                                description: "Não é possível realizar agendamentos aos fins de semana.",
                                icon: <AlertCircle className="h-4 w-4 text-red-500" />
                            })
                            return;
                        }

                        handleDayClick(slot.day, slot.month)
                      }}
                      className={cn(
                        "relative border-b border-r p-2 transition-all flex flex-col gap-1 min-h-[100px] select-none",
                        isPastDay && !isAdmin && "bg-zinc-100/50 dark:bg-zinc-900/80 cursor-not-allowed opacity-60",
                        isPastDay && isAdmin && "bg-zinc-50/30 cursor-pointer",
                        
                        !isCurrentMonth && "bg-zinc-50/60 dark:bg-zinc-900/50 opacity-40 grayscale pointer-events-none",
                        
                        isCurrentMonth && isWeekend && !isAdmin ? "bg-red-50 dark:bg-red-950/10 cursor-not-allowed hover:bg-red-100/50 dark:hover:bg-red-900/20" : 
                        (isCurrentMonth && !isBlockedForUser && "bg-background cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50")
                      )}
                    >
                      <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full transition-colors",
                            isToday && isCurrentMonth ? "bg-primary text-primary-foreground shadow-md font-bold" : "text-zinc-600 dark:text-zinc-400",
                             isWeekend && isCurrentMonth && "text-red-400 dark:text-red-400/70"
                          )}>
                              {slot.day}
                          </span>
                          {isPastDay && isCurrentMonth && !isWeekend && !isAdmin && (
                             <Lock className="h-3 w-3 text-zinc-300" />
                          )}
                           {isWeekend && isCurrentMonth && !isAdmin && (
                             <Lock className="h-3 w-3 text-red-200 dark:text-red-900" />
                          )}
                      </div>

                      {(!isWeekend || isAdmin) && (
                          <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                            {apps.map((app) => (
                            <EventPill key={app.id} app={app} />
                            ))}
                          </div>
                      )}
                    </div>
                  )
                })}
              </div>
          </div>
        </div>

        {/* MODAL DETALHES DO DIA */}
        <DayDetailsDialog 
          isOpen={!!selectedDayDetails}
          onClose={() => setSelectedDayDetails(null)}
          data={selectedDayDetails}
          monthName={monthName}
          onAddClick={handleOpenAddForm}
          onDelete={handleDeleteAppointment}
          onApprove={handleApproveAppointment}
          currentUser={currentUser}
        />

        {/* MODAL FORMULÁRIO DE ADIÇÃO */}
        <AppointmentFormDialog 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          formData={formData}
          onSave={handleSaveAppointment}
          laboratorios={LABORATORIOS}
          currentUser={currentUser}
        />

        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  )
}

// --- COMPONENTE PÍLULA ---
function EventPill({ app }: { app: Agendamento }) {
    const bgStyles = {
        confirmado: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        pendente: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
    }
    const dotColors = {
        Manhã: "bg-amber-500",
        Tarde: "bg-blue-500",
        Noite: "bg-zinc-950 dark:bg-zinc-100",
    }
    return (
      <div className={cn("text-[11px] px-2 py-0.5 rounded-md border truncate font-medium flex items-center gap-1.5 shadow-sm", bgStyles[app.status])}>
        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[app.periodo])} />
        <span className="truncate leading-tight">{app.docente}</span>
      </div>
    )
}
  
// --- MODAL DE DETALHES ---
function DayDetailsDialog({ isOpen, onClose, data, monthName, onAddClick, onDelete, onApprove, currentUser }: any) {
    const [deleteConfirmation, setDeleteConfirmation] = React.useState<number | null>(null)
    
    if (!data) return null
    const periodosOrder: Periodo[] = ["Manhã", "Tarde", "Noite"]
    const isAdmin = currentUser?.role === "ADMIN"

    // CORES DOS TURNOS
    const badgeColors: Record<string, string> = {
        Manhã: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100/80",
        Tarde: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100/80",
        Noite: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-100/80"
    }

    // CORES DOS STATUS (NOVO)
    const statusBadgeStyles = {
        disponivel: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-100/80",
        encerrado: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80",
        pendente: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-100/80",
        confirmado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100/80",
    }

    const isPeriodExpired = (period: Periodo) => {
        if (isAdmin) return false; 

        const now = new Date();
        const selectedDate = new Date(data.year, data.month, data.day);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selectedDate > today) return false;
        if (selectedDate < today) return true;

        const currentHour = now.getHours();
        if (period === 'Manhã' && currentHour >= 12) return true;
        if (period === 'Tarde' && currentHour >= 18) return true;
        if (period === 'Noite' && currentHour >= 23) return true; 

        return false;
    }

    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]">
            <DialogHeader className="pb-4 border-b">
                <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="bg-primary/10 p-2.5 rounded-xl"><CalendarIcon className="h-6 w-6 text-primary" /></div>
                <div>
                    <span className="block text-sm font-normal text-muted-foreground">Agenda do laboratório</span>
                    <span className="font-bold">{data.day} de {monthName}</span>
                </div>
                </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] -mr-4 pr-4 pt-4">
                <div className="grid gap-3">
                {periodosOrder.map((periodo) => {
                    const agendamento = data.appointments.find((a: any) => a.periodo === periodo)
                    const expired = isPeriodExpired(periodo);

                    return (
                        <div key={periodo} className={cn(
                        "group relative flex flex-col gap-1 rounded-xl border p-4 transition-all duration-200",
                        agendamento 
                            ? "bg-card shadow-sm border-zinc-200 dark:border-zinc-800" 
                            : expired 
                                ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-70"
                                : "bg-zinc-50/50 border-dashed border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900/50 dark:border-zinc-800"
                        )}>
                        <div className="flex items-center justify-between mb-2">
                            {/* ESQUERDA: Turno + Status Badge */}
                            <div className="flex items-center gap-2">
                                {/* Badge do Turno */}
                                <Badge variant="secondary" className={cn("px-2.5 py-0.5 text-sm font-medium border-0", badgeColors[periodo])}>
                                    <Clock className="mr-1.5 h-3.5 w-3.5" />{periodo}
                                </Badge>
                                
                                {/* Status Disponível / Encerrado (Sem agendamento) */}
                                {!agendamento && (
                                    <Badge variant="secondary" className={cn("px-2.5 py-0.5 text-xs font-medium border-0", expired ? statusBadgeStyles.encerrado : statusBadgeStyles.disponivel)}>
                                        {expired ? <Lock className="mr-1.5 h-3 w-3"/> : <Unlock className="mr-1.5 h-3 w-3" />}
                                        {expired ? "Encerrado" : "Disponível"}
                                    </Badge>
                                )}

                                {/* Status Confirmado / Pendente (Com agendamento) */}
                                {agendamento && (
                                    <Badge variant="secondary" className={cn("px-2.5 py-0.5 text-xs font-medium border-0", agendamento.status === 'confirmado' ? statusBadgeStyles.confirmado : statusBadgeStyles.pendente)}>
                                        {agendamento.status === 'confirmado' ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> : <AlertCircle className="mr-1.5 h-3.5 w-3.5" />}
                                        <span className="uppercase">{agendamento.status}</span>
                                    </Badge>
                                )}
                            </div>
                            
                            {/* DIREITA: Botões de Ação */}
                            <div className="flex items-center gap-1">
                                {agendamento && isAdmin && agendamento.status === 'pendente' && (
                                    <Button 
                                            variant="ghost" size="icon" 
                                            className="h-6 w-6 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                            onClick={() => onApprove(agendamento.id)} title="Aprovar Agendamento"
                                    >
                                            <Check className="h-4 w-4" />
                                    </Button>
                                )}

                                {agendamento && isAdmin && (
                                    <Button 
                                            variant="ghost" size="icon" 
                                            className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                            onClick={() => setDeleteConfirmation(agendamento.id)} title="Remover Agendamento"
                                    >
                                            <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        {agendamento ? (
                            <div className="pl-1">
                                <div className="flex items-center gap-2 mt-1">
                                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full"><User className="h-4 w-4" /></div>
                                <div>
                                    <span className="block font-bold text-lg text-zinc-800 dark:text-zinc-100 leading-none">{agendamento.docente}</span>
                                    <span className="text-xs text-muted-foreground">{agendamento.disciplina}</span>
                                </div>
                                </div>
                            </div>
                        ) : (
                            !expired && (
                                <div className="mt-2 flex justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" onClick={() => onAddClick(periodo)} className="w-full border-2 border-dashed border-transparent hover:border-primary/20 hover:bg-primary/5 text-primary">
                                    <Plus className="mr-2 h-4 w-4" /> Agendar Horário
                                    </Button>
                                </div>
                            )
                        )}
                        </div>
                    )
                })}
                </div>
            </ScrollArea>
            </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remover Agendamento?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o agendamento do sistema.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => {
                            if (deleteConfirmation) onDelete(deleteConfirmation)
                            setDeleteConfirmation(null)
                        }}
                    >
                        Remover
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
    )
}

// --- FORMULÁRIO DE ADIÇÃO ---
function AppointmentFormDialog({ isOpen, onClose, formData, onSave, laboratorios, currentUser }: any) {
    const [docente, setDocente] = React.useState("")
    const [disciplina, setDisciplina] = React.useState("")
    const [labId, setLabId] = React.useState("")
    
    const isAdmin = currentUser?.role === "ADMIN"
  
    React.useEffect(() => {
        if(isOpen) {
            if (currentUser) {
                setDocente(currentUser.nome)
            } else {
                setDocente("") 
            }
            setDisciplina("")
            setLabId(formData?.labIdPre || "")
        }
    }, [isOpen, formData, currentUser])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if(!docente || !labId) return
        onSave({ docente, disciplina, labId: Number(labId) })
    }
  
    if (!formData) return null
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
             
             <div className="flex items-center p-0 overflow-hidden bg-zinc-50 dark:bg-zinc-900 rounded-lg border text-sm">
                <div className="flex-1 p-3 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1">
                    <span className="text-muted-foreground text-xs uppercase font-semibold">Data</span>
                    <span className="font-medium text-base">{formData.day}/{formData.month + 1}/{formData.year}</span>
                </div>
                <div className="flex-1 p-3 flex flex-col items-center justify-center gap-1">
                    <span className="text-muted-foreground text-xs uppercase font-semibold">Período</span>
                    <span className="font-medium text-base">{formData.periodo}</span>
                </div>
             </div>
             
             <div className="grid gap-2">
                <Label htmlFor="docente" className="flex items-center justify-between">
                    Nome do Docente {isAdmin && <span className="text-xs text-blue-600 flex items-center gap-1"><Pencil className="w-3 h-3"/> Editável (Admin)</span>}
                </Label>
                <div className="relative">
                    <Input 
                        id="docente" 
                        placeholder="Ex: Prof. Carlos Silva" 
                        value={docente} 
                        onChange={(e) => setDocente(e.target.value)} 
                        readOnly={!isAdmin} 
                        className={cn(!isAdmin && "bg-muted text-muted-foreground cursor-not-allowed border-dashed focus-visible:ring-0")} 
                        tabIndex={!isAdmin ? -1 : 0}
                        required 
                    />
                    {!isAdmin && (<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><span className="text-xs text-muted-foreground bg-background px-1 border rounded shadow-sm">Seu nome</span></div>)}
                </div>
             </div>

             <div className="grid gap-2">
                <Label htmlFor="lab">Laboratório</Label>
                <Select value={labId} onValueChange={setLabId} disabled>
                  <SelectTrigger className="w-full bg-muted text-muted-foreground opacity-100 cursor-not-allowed">
                    <SelectValue placeholder="Laboratório" />
                  </SelectTrigger>
                  <SelectContent>
                    {laboratorios.map((lab: any) => (<SelectItem key={lab.id} value={String(lab.id)}>{lab.nome}</SelectItem>))}
                  </SelectContent>
                </Select>
             </div>

             <div className="grid gap-2">
                <Label htmlFor="disciplina">Disciplina / Curso <span className="text-xs font-normal text-muted-foreground ml-2">(Opcional)</span></Label>
                <Input id="disciplina" placeholder="Ex: Algoritmos e Lógica" value={disciplina} onChange={(e) => setDisciplina(e.target.value)} />
             </div>
             
             <div className="grid grid-cols-2 gap-4 pt-4">
                 <Button type="button" variant="outline" onClick={onClose} className="w-full">
                   Cancelar
                 </Button>
                 <Button type="submit" className="w-full">
                   Confirmar
                 </Button>
             </div>
          </form>
        </DialogContent>
      </Dialog>
    )
}