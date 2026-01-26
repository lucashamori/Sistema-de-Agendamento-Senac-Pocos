"use client"

import { getColumns, Equipamento } from "./columns"
import { DataTable } from "./data-table"

interface TableWrapperProps {
  data: Equipamento[]
  salasOptions: { id: number; nome: string; codigo: string }[]
}

export function EquipamentoTableWrapper({ data, salasOptions }: TableWrapperProps) {
  // Agora podemos chamar getColumns aqui, pois este é um Client Component
  const columns = getColumns(salasOptions)

  return <DataTable columns={columns} data={data} />
}