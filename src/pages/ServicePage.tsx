import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table"
import { useServices } from "@/hooks/useService"
import type { Service, DriftStatus } from "@/types/services"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { CatalogTableSkeleton } from "@/components/ui/screen-skeletons"
import { CustomSelect } from "@/components/ui/custom-select"
import {
  Search,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  GitFork,
  Cpu,
  X,
} from "lucide-react"

export function ServicesPage() {
  const navigate = useNavigate()
  const { data: services = [], isLoading, isError, error, refetch } = useServices()

  // State for TanStack Table
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [searchValue, setSearchValue] = React.useState("")
  const [selectedTeam, setSelectedTeam] = React.useState("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")

  // Extract unique team list from loaded services
  const uniqueTeams = React.useMemo(() => {
    const teams = new Set<string>()
    services.forEach((s) => {
      if (s.owner) teams.add(s.owner)
    })
    return Array.from(teams).sort()
  }, [services])

  const teamOptions = React.useMemo(
    () => [
      { value: "all", label: `Все команды (${services.length})` },
      ...uniqueTeams.map((team) => ({ value: team, label: team })),
    ],
    [uniqueTeams, services.length]
  )

  // Summary counts
  const stats = React.useMemo(() => {
    const total = services.length
    const inSync = services.filter((s) => s.driftStatus === "in_sync").length
    const drift = services.filter((s) => s.driftStatus === "drift_detected").length
    return { total, inSync, drift }
  }, [services])

  // Table Column Definitions
  const columns = React.useMemo<ColumnDef<Service>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Название сервиса
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="py-1">
            <div className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <span>{row.original.name}</span>
              {row.original.tier !== undefined && (
                <span className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono border">
                  Tier {row.original.tier}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono">{row.original.id}</span>
              {row.original.endpoints && row.original.endpoints.length > 0 && (
                <span className="text-[13px] font-mono text-primary font-medium">
                  • {row.original.endpoints[0]}
                </span>
              )}
            </div>
          </div>
        ),
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue) return true
          const val = String(filterValue).toLowerCase()
          const name = String(row.original.name).toLowerCase()
          const id = String(row.original.id).toLowerCase()
          const endpoints = (row.original.endpoints || []).join(' ').toLowerCase()
          return name.includes(val) || id.includes(val) || endpoints.includes(val)
        },
      },
      {
        accessorKey: "owner",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Владелец (команда)
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-foreground">{row.original.owner}</div>
        ),
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true
          return row.original.owner === filterValue
        },
      },
      {
        accessorKey: "stack",
        header: "Язык / Стек",
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
            <Cpu className="h-3 w-3 text-muted-foreground" />
            {row.original.stack}
          </div>
        ),
      },
      {
        accessorKey: "driftStatus",
        header: "Статус дрейфа",
        cell: ({ row }) => {
          const status = row.original.driftStatus as DriftStatus
          if (status === "drift_detected") {
            return (
              <Badge variant="destructive" className="flex w-fit items-center gap-1 px-2 py-0.5 font-medium">
                <AlertTriangle className="h-3 w-3" />
                Обнаружен дрейф
              </Badge>
            )
          }
          return (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 flex w-fit items-center gap-1 px-2 py-0.5 font-medium"
            >
              <CheckCircle2 className="h-3 w-3" />
              Актуально
            </Badge>
          )
        },
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true
          return row.original.driftStatus === filterValue
        },
      },
      {
        accessorKey: "dependenciesCount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 font-semibold hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Зависимости
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-muted-foreground">
            <GitFork className="h-3.5 w-3.5" />
            {row.original.dependenciesCount}
          </div>
        ),
      },
    ],
    []
  )

  // Initialize TanStack Table
  const table = useReactTable({
    data: services,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // Handlers for search & filters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    table.getColumn("name")?.setFilterValue(value)
  }

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value)
    table.getColumn("owner")?.setFilterValue(value === "all" ? "" : value)
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    table.getColumn("driftStatus")?.setFilterValue(status === "all" ? "" : status)
  }

  const handleResetFilters = () => {
    setSearchValue("")
    setSelectedTeam("all")
    setSelectedStatus("all")
    setColumnFilters([])
  }

  const isFiltered = searchValue !== "" || selectedTeam !== "all" || selectedStatus !== "all"

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Каталог сервисов</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Реестр микросервисов организации, их стек, архитектурный статус и зависимости.
          </p>
        </div>

        {/* Counter cards */}
        {!isLoading && !isError && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg border bg-card text-xs flex items-center gap-2 shadow-sm">
              <span className="text-muted-foreground">Всего:</span>
              <span className="font-semibold">{stats.total}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs flex items-center gap-2 shadow-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Актуально:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.inSync}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/5 text-xs flex items-center gap-2 shadow-sm">
              <span className="text-destructive font-medium">Дрейф:</span>
              <span className="font-semibold text-destructive">{stats.drift}</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search by service name substring */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или ID сервиса..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9 h-10 bg-background"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue("")
                table.getColumn("name")?.setFilterValue("")
              }}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Team Filter */}
        <CustomSelect
          value={selectedTeam}
          onChange={handleTeamChange}
          options={teamOptions}
          className="min-w-[210px]"
        />

        {/* Quick status filters */}
        <div className="inline-flex rounded-md border bg-card p-1 text-xs">
          <button
            onClick={() => handleStatusChange("all")}
            className={`px-3 py-1 rounded transition-colors ${
              selectedStatus === "all"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Все
          </button>
          <button
            onClick={() => handleStatusChange("in_sync")}
            className={`px-3 py-1 rounded transition-colors ${
              selectedStatus === "in_sync"
                ? "bg-emerald-600 text-white font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Актуально
          </button>
          <button
            onClick={() => handleStatusChange("drift_detected")}
            className={`px-3 py-1 rounded transition-colors ${
              selectedStatus === "drift_detected"
                ? "bg-destructive text-destructive-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Дрейф
          </button>
        </div>

        {/* Reset button if filter is active */}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-10 text-xs px-2.5">
            Сбросить
          </Button>
        )}
      </div>

      {/* Main Table Content */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* Error State */}
        {isError && (
          <div className="p-6">
            <ErrorState error={error} onRetry={() => refetch()} />
          </div>
        )}

        {/* Normal / Loading / Empty States */}
        {!isError && (
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-10 text-xs font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {/* Loading State: Skeletons */}
              {isLoading ? (
                <CatalogTableSkeleton rows={6} />
              ) : table.getRowModel().rows.length > 0 ? (
                /* Service rows */
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => navigate(`/services/${row.original.id}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/60 data-[state=selected]:bg-muted"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                /* Empty State */
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-6">
                    <EmptyState
                      title="Сервисы не найдены"
                      description={
                        isFiltered
                          ? "По заданным условиям фильтрации ничего не найдено. Попробуйте изменить запрос или сбросить фильтры."
                          : "В каталоге пока нет зарегистрированных микросервисов."
                      }
                      actionLabel={isFiltered ? "Сбросить фильтры" : undefined}
                      onAction={isFiltered ? handleResetFilters : undefined}
                    />
                  </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Footer hint */}
      {!isLoading && !isError && table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Показано сервисов: <strong>{table.getRowModel().rows.length}</strong> из{" "}
            {services.length}
          </span>
          <span className="italic">
            Нажмите на строку сервиса для перехода в паспорт (/services/:id)
          </span>
        </div>
      )}
    </div>
  )
}