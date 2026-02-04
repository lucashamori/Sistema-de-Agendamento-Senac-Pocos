"use client"

import * as React from "react"
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getColumns, Sala } from "./columns" // Importa a função getColumns aqui

interface DataTableProps {
  data: Sala[]
  areasOptions: { id: number; nome: string }[]
  unidadesOptions: { id: number; nome: string }[]
}

export function DataTable({ data, areasOptions, unidadesOptions }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "codigo", desc: false }])

  // GERA AS COLUNAS AQUI NO CLIENT SIDE
  const columns = React.useMemo(() => 
    getColumns(areasOptions, unidadesOptions), 
  [areasOptions, unidadesOptions])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  })

  return (
    <div className="overflow-hidden rounded-md border bg-white dark:bg-zinc-900 shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhum registro encontrado.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}