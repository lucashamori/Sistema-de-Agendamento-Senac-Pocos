"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updateEquipamentoAction, deleteEquipamentoAction } from "@/app/actions/equipamentos"

export type Equipamento = {
  id: number
  descricao: string
  quantidade: number
  ativo: boolean
  observacao: string | null
  idSala: number
  nomeSala: string
  codigoSala: string
}

interface CellActionProps {
  equipamento: Equipamento
  salasOptions: { id: number, nome: string, codigo: string }[]
}

export const getColumns = (salasOptions: { id: number, nome: string, codigo: string }[]): ColumnDef<Equipamento>[] => [
  {
    accessorKey: "descricao",
    header: "Equipamento",
    cell: ({ row }) => (
      <div className="flex flex-col max-w-[200px]">
        <span className="font-medium truncate">{row.getValue("descricao")}</span>
        {row.original.observacao && (
          <span className="text-xs text-muted-foreground truncate">
            {row.original.observacao}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "nomeSala",
    header: "Sala Vinculada",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.codigoSala}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{row.original.nomeSala}</span>
      </div>
    ),
  },
  {
    accessorKey: "quantidade",
    header: "Quantidade",
    cell: ({ row }) => {
      const qtd = row.original.quantidade
      let colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200"
      
      if (qtd === 0) colorClass = "bg-red-100 text-red-700 border-red-200"
      else if (qtd < 5) colorClass = "bg-amber-100 text-amber-700 border-amber-200"

      return (
        <Badge variant="outline" className={`${colorClass} font-medium`}>
          {qtd} un
        </Badge>
      )
    },
  },
  {
    accessorKey: "ativo",
    header: "Status",
    cell: ({ row }) => {
      const ativo = row.original.ativo
      return (
        <div className={`flex items-center gap-2 font-medium ${ativo ? "text-emerald-600" : "text-red-500"}`}>
          {ativo ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {ativo ? "Ativo" : "Inativo"}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => <CellAction equipamento={row.original} salasOptions={salasOptions} />,
  },
]

function CellAction({ equipamento, salasOptions }: CellActionProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [descricao, setDescricao] = useState(equipamento.descricao)
  const [quantidade, setQuantidade] = useState(equipamento.quantidade)
  const [idSala, setIdSala] = useState(String(equipamento.idSala))
  const [observacao, setObservacao] = useState(equipamento.observacao || "")
  const [ativo, setAtivo] = useState(equipamento.ativo ? "true" : "false")

  const handleEdit = async () => {
    startTransition(async () => {
      try {
        const res = await updateEquipamentoAction(equipamento.id, {
          descricao,
          quantidade: Number(quantidade),
          idSala: Number(idSala),
          observacao,
          ativo: ativo === "true"
        })

        if (res.success) {
          toast.success("Equipamento atualizado!")
          setOpenEdit(false)
        } else {
          toast.error(res.error || "Erro ao atualizar.")
        }
      } catch (error) {
        toast.error("Erro inesperado.")
      }
    })
  }

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const res = await deleteEquipamentoAction(equipamento.id)
        if (res.success) {
            toast.success("Equipamento excluído.")
            setOpenDelete(false)
        } else {
            toast.error(res.error)
        }
      } catch (error) {
        toast.error("Erro ao excluir.")
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setOpenEdit(true)}
            title="Editar"
            className="h-8 w-8 hover:bg-blue-50"
        >
            <Pencil className="h-4 w-4" />
        </Button>

        <Button 
             
            size="icon" 
            onClick={() => setOpenDelete(true)}
            title="Excluir"
            className="h-8 w-8  hover:bg-red-50"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Equipamento</DialogTitle>
            <DialogDescription>Atualize as informações do equipamento.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Quantidade</Label>
                    <Input type="number" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={ativo} onValueChange={setAtivo}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Ativo</SelectItem>
                            <SelectItem value="false">Inativo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Sala Vinculada</Label>
                <Select value={idSala} onValueChange={setIdSala}>
                    <SelectTrigger><SelectValue placeholder="Selecione a sala" /></SelectTrigger>
                    <SelectContent>
                        {salasOptions.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.codigo} - {s.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
              <Label>Observação</Label>
              <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} className="h-20 resize-none" />
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
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir equipamento?</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja remover <b>{equipamento.descricao}</b> permanentemente?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">{isPending ? "Excluindo..." : "Excluir"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}