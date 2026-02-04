"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updateSalaAction, deleteSalaAction } from "@/app/actions/salas"

export type Sala = {
  id: number
  nome: string
  codigo: string
  capacidade: number
  idArea: number
  idUnidade: number
  status: boolean
}

// Interfaces para as opções
interface Option { id: number; nome: string }

export const getColumns = (areas: Option[], unidades: Option[]): ColumnDef<Sala>[] => [
  {
    accessorKey: "codigo",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-3">
        Código <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("codigo")}</span>,
  },
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "capacidade", header: "Capacidade" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
        <span className={row.original.status ? "text-emerald-600 font-bold text-xs uppercase" : "text-red-500 font-bold text-xs uppercase"}>
            {row.original.status ? "Ativa" : "Inativa"}
        </span>
    )
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <CellAction sala={row.original} areas={areas} unidades={unidades} />,
  },
]

function CellAction({ sala, areas, unidades }: { sala: Sala, areas: Option[], unidades: Option[] }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Estados
  const [nome, setNome] = useState(sala.nome)
  const [codigo, setCodigo] = useState(sala.codigo)
  const [capacidade, setCapacidade] = useState(sala.capacidade)
  const [idArea, setIdArea] = useState(String(sala.idArea))
  const [idUnidade, setIdUnidade] = useState(String(sala.idUnidade))
  const [status, setStatus] = useState(sala.status ? "ativo" : "inativo")

  const handleEdit = async () => {
    startTransition(async () => {
      const res = await updateSalaAction(sala.id, {
        nome, codigo, capacidade: Number(capacidade),
        idArea: Number(idArea),
        idUnidade: Number(idUnidade),
        status: status === "ativo"
      })
      if (res.success) { toast.success("Atualizado!"); setOpenEdit(false); }
      else { toast.error("Erro ao atualizar."); }
    })
  }

  const handleDelete = async () => {
    startTransition(async () => {
        const res = await deleteSalaAction(sala.id)
        if (res.success) { toast.success("Excluído!"); setOpenDelete(false); }
        else { toast.error(res.error); }
    })
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => setOpenEdit(true)}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setOpenDelete(true)}><Trash2 className="h-4 w-4" /></Button>
      </div>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Sala</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Código</Label><Input value={codigo} onChange={e => setCodigo(e.target.value)} /></div>
                <div className="space-y-2"><Label>Capacidade</Label><Input type="number" value={capacidade} onChange={e => setCapacidade(Number(e.target.value))} /></div>
            </div>
            <div className="space-y-2"><Label>Nome</Label><Input value={nome} onChange={e => setNome(e.target.value)} /></div>
            
            {/* LINHA COM UNIDADE E AREA */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select value={idUnidade} onValueChange={setIdUnidade}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{unidades.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Área</Label>
                    <Select value={idArea} onValueChange={setIdArea}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{areas.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.nome}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="ativo">Ativa</SelectItem><SelectItem value="inativo">Inativa</SelectItem></SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão?</AlertDialogTitle><AlertDialogDescription>Ação irreversível.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600">Excluir</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}