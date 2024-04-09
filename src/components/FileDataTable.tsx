"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Loader2, LoaderIcon, MoreHorizontal, Plus, PlusSquare } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useParams } from "next/navigation"
import { useState } from "react"
import { trpc } from "@/app/_trpc/client"
import { Badge, badgeVariants } from "./ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LoadingButton } from "./ui/loading-button"
// Project Imports
// 3rd Party Imports
// Styles



/** ================================|| FileDataTable ||=================================== **/

export type FileProject = {
  id: string
  name: string
}
export type FileData = {
  id: string
  questions?: string[]
  name: string
  projects: FileProject[]
}

const FileDataTable = () => {

  const params = useParams()

  // Infer type based on the key present in params
  let type: "project" | "all" | "question" = 'all'
  let key = '#';

  if (params.projectid) {
    type = 'project';
    key = Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;
  } else if (params.questionId) {
    type = 'question';
    key = Array.isArray(params.questionId) ? params.questionId[0] : params.questionId;
  }

  // // We need to know exactly what file is currently being deleted
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)
  const [currentlyAddingFile, setCurrentlyAddingFile] = useState<string | null>(null)
  const [loadingSelectedFiles, setLoadingSelectedFiles] = useState(false)
  const [currentlyAddingMultipleFiles, setCurrentlyAddingMultipleFiles] = useState<string[] | null>(null)

  // // If we invalidate the data, we force an automatic refresh
  const utils = trpc.useUtils()

  const { data, isLoading } = trpc.getNonLinkedFiles.useQuery({ type: type, key: key })

  const { mutate: addLinkedFile } = trpc.addLinkedFile.useMutation({
    async onSuccess() {
      utils.getFiles.invalidate()
      utils.getNonLinkedFiles.invalidate()

    },
    onMutate({ fileId }) {
      setCurrentlyAddingFile(fileId)
    },
    onSettled() {
      // Whether there is an error or not, the loading state should stop
      setCurrentlyAddingFile(null)
    }
  })

  const { mutate: addLinkedFiles } = trpc.addLinkedFiles.useMutation({
    async onSuccess() {
      utils.getFiles.invalidate()
      utils.getNonLinkedFiles.invalidate()
    },
    onMutate({ fileIds }) {
      setCurrentlyAddingMultipleFiles(fileIds)
    },
    onSettled() {
      setCurrentlyAddingMultipleFiles(null)
      setLoadingSelectedFiles(false)

    }
  })

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})


  const columns: ColumnDef<FileData>[] = [
    {
      id: "select",
      cell: ({ row }) => {
        const fileProjects = row.getValue("projects") as FileProject[];

        // Determine if the current file is linked to the project by checking if the project's ID matches the `key`
        const isAlreadyLinked = fileProjects.some(project => project.id === key);

        if (isAlreadyLinked) return null

        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            disabled={isAlreadyLinked || loadingSelectedFiles}
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      // header: "Name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            File Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Link href={`/dashboard/${row.original.id}`} className={"text-sm"}>
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "projects",
      header: 'Linked Projects',
      cell: ({ row }) => {

        const projects = row.getValue("projects") as FileProject[] | undefined;

        return (
          <div className="space-x-2">

            {projects?.map((project, index) => project.id === key ? (
              <Badge key={index} variant='outline' className='font-normal border-primary/50'>
                {project.name.length > 15 ? `${project.name.substring(0, 15)}...` : project.name}
              </Badge>
            ) : (
              <Link href={`/research/project/${project.id}`} key={index}>
                <Badge
                  variant='outline' className='text-zinc-500 hover:text-zinc-700 hover:bg-secondary/60 font-normal'>
                  {project.name.length > 15 ? `${project.name.substring(0, 15)}...` : project.name}
                </Badge>
              </Link>
            ))}

          </div>
        )
      },
    },
    {
      accessorKey: "id",
      header: () => null,
      enableHiding: false,
      cell: ({ row }) => {

        const fileIdFromTable = row.getValue("id") as string
        const fileProjects = row.getValue("projects") as FileProject[];

        // Determine if the current file is linked to the project by checking if the project's ID matches the `key`
        const isAlreadyLinked = fileProjects.some(project => project.id === key);


        return (
          <div className="lowercase">

            {!isAlreadyLinked && ( // Only show the button if the file is not linked to the project
              <LoadingButton
                onClick={() => addLinkedFile({ fileId: fileIdFromTable, projectId: key })}
                size='sm'
                className='w-full'
                variant='secondary'
                disabled={loadingSelectedFiles}
              >
                {currentlyAddingFile === fileIdFromTable ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Plus className='h-4 w-4' />
                )}
              </LoadingButton>
            )}

          </div>
        )
      },
    },
  ]
  // Provide an empty array as fallback if data is undefined
  const tableData: FileData[] = data || [];

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleAddSelectionClick = () => {

    setLoadingSelectedFiles(true)

    // Filter the selected rows
    const selectedRows = table.getSelectedRowModel().rows;

    // Extract the desired values from the selected rows 
    const selectedValues = selectedRows.map(row => row.original.id)
    addLinkedFiles({ projectId: key, fileIds: selectedValues })

    // Clear checkbox state in data table
    table.resetRowSelection() 
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter files..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <LoadingButton
          variant={Object.keys(table.getState().rowSelection).length > 0 ? `ringHover` : `outline`}
          size="sm"
          onClick={() => handleAddSelectionClick()}
          loading={loadingSelectedFiles}
          disabled={Object.keys(table.getState().rowSelection).length < 1}
        >
          Add Selection
        </LoadingButton>

        <div className="flex-1 text-sm text-muted-foreground pl-2.5">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>

      </div>
    </div>
  )
};

export default FileDataTable;
