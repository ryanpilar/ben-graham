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
import { ArrowUpDown, CheckIcon, ChevronDown, Loader2, LoaderIcon, MoreHorizontal, Plus, PlusSquare } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Checkbox as NUICheckbox, useCheckbox } from '@nextui-org/checkbox'
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
import { useEffect, useState } from "react"
import { trpc } from "@/app/_trpc/client"
import { Badge, badgeVariants } from "./ui/badge"
import { Chip as NUIChip } from "@nextui-org/chip"
import { Tooltip as NUITooltip } from "@nextui-org/tooltip"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { LoadingButton } from "./ui/loading-button"
import { tv } from "@nextui-org/theme"
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import Skeleton from "react-loading-skeleton"
// Project Imports
// 3rd Party Imports
// Styles



/** ================================|| FileDataTable ||=================================== **/

export type FileProject = {
  id: string
  name: string
}
export type FileQuestion = {
  id: string
  text: string
}
export type FileData = {
  id: string
  questions: FileQuestion[]
  name: string
  projects: FileProject[]
}
interface FilesProps {
  type: "project" | "question" | 'all'
}

const FileDataTable = ({ type }: FilesProps) => {

  const params = useParams()

  const getKey = () => {
    if (type === 'project' && params.projectid) {
      return Array.isArray(params.projectid) ? params.projectid[0] : params.projectid;
    } else if (type === 'question' && params.questionid) {
      return Array.isArray(params.questionid) ? params.questionid[0] : params.questionid;
    }
    return '#'
  };

  const key = getKey()

  // We need to know exactly what file is currently being deleted
  const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)
  const [currentlyAddingFile, setCurrentlyAddingFile] = useState<string | null>(null)
  const [loadingSelectedFiles, setLoadingSelectedFiles] = useState(false)
  const [currentlyAddingMultipleFiles, setCurrentlyAddingMultipleFiles] = useState<string[] | null>(null)

  // Invalidate the data to force an automatic refresh
  const utils = trpc.useUtils()

  const { data, isLoading } = trpc.getNonLinkedFiles.useQuery({ type: type, key: key })

  const { mutate: addLinkedFile } = trpc.addLinkedFile.useMutation({
    async onSuccess() {
      utils.getFiles.invalidate()
      utils.getNonLinkedFiles.invalidate()
      utils.getFileCount.invalidate()
      table.resetRowSelection()

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
      utils.getFileCount.invalidate()

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
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})


  // TABLE COLUMN COMPONENTS
  const columns: ColumnDef<FileData>[] = [

    // COLUMN: CHECKBOX
    // {
    //   id: "select",
    //   cell: ({ row }) => {
    //     const filterProjects = row.original.projects as FileProject[];
    //     const filterQuestions = row.original.questions as FileQuestion[];

    //     const isProjectAlreadyLinked = filterProjects.some(project => project.id === key);
    //     const isQuestionAlreadyLinked = filterQuestions.some(question => question.id === key);

    //     if (isProjectAlreadyLinked || isQuestionAlreadyLinked) return null

    //     return (
    //       <>
    //         <NUICheckbox
    //           isSelected={row.getIsSelected()}
    //           onValueChange={(value) => row.toggleSelected(!!value)}
    //           aria-label="Select row"
    //           isDisabled={isProjectAlreadyLinked || isQuestionAlreadyLinked || loadingSelectedFiles}
    //           color='primary'
    //           size='md'
    //           radius='sm'
    //         />


    //         <Checkbox
    //           checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)}
    //           aria-label="Select row"
    //           disabled={isProjectAlreadyLinked || loadingSelectedFiles}
    //         />
    //       </>

    //     )
    //   },
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    // COLUMN: NAME
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
    // COLUMN: PROJECT BADGES
    {
      accessorKey: "projects",
      header: 'Linked Projects',
      cell: ({ row }) => {

        const projects = row.getValue("projects") as FileProject[] | undefined;

        return (
          <div className="flex gap-x-2 gap-y-1">

            {/* {projects?.map((project, index) => project.id === key ? (
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
            ))} */}

            {projects?.map((project, index) => {
              // Determine if the project is the currently selected one
              const isSelected = project.id === key;

              // Truncate the project name if it's too long
              const displayProjectName = project.name.length > 15 ? `${project.name.substring(0, 15)}...` : project.name;

              return (
                // <NUITooltip key={index} content={project.name} placement="top-start" radius="sm" showArrow >
                <NUIChip
                  key={`linked-projects-cell-${index}`}
                  variant="shadow"
                  color="secondary"
                  size="sm"
                  radius="sm"
                  className="text-foreground-500"
                >
                  {/* Conditionally render the content inside the chip based on whether the project is selected */}
                  {isSelected ? (
                    displayProjectName // Just display text if selected
                  ) : (
                    <Link href={`/research/project/${project.id}`}>
                      {displayProjectName}
                    </Link>
                  )}
                </NUIChip>
                // </NUITooltip> 
              )
            })}

          </div>
        )
      },
    },
    // COLUMN: QUESTION BADGES
    {
      accessorKey: "questions",
      header: 'Linked Questions',
      cell: ({ row }) => {

        const questions = row.getValue("questions") as FileQuestion[] | undefined;

        return (
          <div className="flex gap-x-2 gap-y-1">
            {questions?.map((question, index) => {
              // Check if the current question is the selected one
              const isSelected = question.id === key;

              // Truncate text if it's too long
              const displayText = question.text.length > 15 ? `${question.text.substring(0, 15)}...` : question.text;

              return (
                <NUITooltip key={`linked-questions-tooltip-cell-${index}`}
                  content={question.text} placement="top-start" radius="sm" showArrow >
                  <NUIChip
                    key={`linked-questions-cell-${index}`}
                    variant="shadow"
                    color="secondary"
                    size="sm"
                    radius="sm"
                    className="text-foreground-500"
                  >
                    {/* Conditionally render the content inside the chip based on whether the question is selected */}
                    {isSelected ? (
                      displayText 
                    ) : (
                      <Link href={`/research/question/${question.id}`}>
                        {displayText}
                      </Link>
                    )}
                  </NUIChip>
                </NUITooltip>
              );
            })}
          </div>
        )
      },
    },
    // COLUMN: ADD BUTTON
    {
      accessorKey: "id",
      header: () => null,
      enableHiding: false,
      cell: ({ row }) => {

        const fileIdFromTable = row.getValue("id") as string
        const fileProjects = row.original.projects as FileProject[];
        const fileQuestions = row.original.questions as FileQuestion[];
        const isAlreadyLinked = (type === 'project' ? fileProjects : fileQuestions).some(item => item.id === key);

        const checkbox = tv({
          slots: {
            base: "border-default hover:bg-default-200",
            content: "text-default-500"
          },
          variants: {
            isSelected: {
              true: {
                base: "border-primary bg-primary hover:bg-primary-500 hover:border-primary-500",
                content: "text-primary-foreground pl-1"
              }
            },
            isFocusVisible: {
              true: {
                base: "outline-none ring-2 ring-focus ring-offset-2 ring-offset-background",
              }
            }
          }
        })

        const {
          children,
          isSelected,
          isFocusVisible,
          getBaseProps,
          getLabelProps,
          getInputProps,
        } = useCheckbox({
          defaultSelected: true,
        })

        const styles = checkbox({ isSelected, isFocusVisible })

        return (

          <div className="lowercase text-right">
            {!isAlreadyLinked ? (




              <LoadingButton
                onClick={() => addLinkedFile({ fileId: fileIdFromTable, key: key, type: type })}
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

            ) : <span className='capitalize'>Added</span>


            }
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
    addLinkedFiles({ key: key, fileIds: selectedValues, type: type })

    // Clear checkbox state in data table
    table.resetRowSelection()
  };
  useEffect(() => {
    const columnVisibility = {
      'projects': type === 'project' || type === 'all',
      'questions': type === 'question' || type === 'all',
    };
    table.setColumnVisibility(columnVisibility);
  }, [type, table])

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
                    // key={column.id}
                    key={`dropdown-menu-checkbox-item-${column.id}`}
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
              <TableRow
                // key={headerGroup.id}
                key={`table-header-row-one-${headerGroup.id}`}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      // key={header.id}                    
                      key={`table-head-${header.id}`}
                    >
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

            {isLoading ? (
              // Assume you want to display 4 skeleton rows during loading
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`$skeleton-table-row-${index}-index`}>
                  {Array.from({ length: columns.length }).map((_, index) => (
                    <TableCell key={`$skeleton-table-cell-${index}-index`}>
                      <Skeleton height={35} width="100%" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={`is-not-loading-table-row-${row.id}`}
                  // key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                    key={`is-not-loading-table-cell-${cell.id}`}
                    // key={cell.id}
                    >
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
        {/* <LoadingButton
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
        </div> */}

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
