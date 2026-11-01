import * as React from "react"
import { useFindings, useResolveFinding } from "@/hooks/useFindings"
import { FindingSeverityBadge } from "@/components/findings/FindingSeverityBadge"
import { FindingStatusBadge } from "@/components/findings/FindingStatusBadge"
import { EvidenceReviewPanel } from "@/components/findings/EvidenceReviewPanel"
import { RiskAcceptanceDialog } from "@/components/findings/RiskAcceptanceDialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Search,
  AlertTriangle,
  RefreshCw,
  SearchX,
  X,
  ChevronRight,
  Inbox,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
} from "lucide-react"

export function InboxPage() {
  const { data: findings = [], isLoading, isError, refetch } = useFindings()
  const resolveFindingMutation = useResolveFinding()

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [searchValue, setSearchValue] = React.useState("")
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>("all")
  const [selectedService, setSelectedService] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")

  const [isRiskDialogOpen, setIsRiskDialogOpen] = React.useState(false)
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = React.useState(false)

  // Unique service IDs from findings
  const uniqueServices = React.useMemo(() => {
    const set = new Set<string>()
    findings.forEach((f) => {
      if (f.serviceId) set.add(f.serviceId)
    })
    return Array.from(set).sort()
  }, [findings])

  // Summary counts
  const stats = React.useMemo(() => {
    const total = findings.length
    const newCount = findings.filter((f) => f.status === "NEW").length
    const confirmedCount = findings.filter((f) => f.status === "CONFIRMED").length
    const riskCount = findings.filter((f) => f.status === "RISK_ACCEPTED").length
    return { total, newCount, confirmedCount, riskCount }
  }, [findings])

  // Filtered list
  const filteredFindings = React.useMemo(() => {
    return findings.filter((item) => {
      // Text search
      if (searchValue.trim()) {
        const query = searchValue.toLowerCase()
        const matchId = item.id.toLowerCase().includes(query)
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchService = item.serviceId.toLowerCase().includes(query)
        const matchDoc = item.evidence.docFile?.toLowerCase().includes(query) || false
        const matchCode = item.evidence.codeFile?.toLowerCase().includes(query) || false
        if (!matchId && !matchTitle && !matchService && !matchDoc && !matchCode) {
          return false
        }
      }

      // Severity filter
      if (selectedSeverity !== "all" && item.severity !== selectedSeverity) {
        return false
      }

      // Service filter
      if (selectedService !== "all" && item.serviceId !== selectedService) {
        return false
      }

      // Status filter
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [findings, searchValue, selectedSeverity, selectedService, selectedStatus])

  const activeSelectedId =
    selectedId && filteredFindings.some((f) => f.id === selectedId)
      ? selectedId
      : filteredFindings[0]?.id || null

  const selectedFinding = React.useMemo(() => {
    return findings.find((f) => f.id === activeSelectedId) || null
  }, [findings, activeSelectedId])

  // Mutation action handlers
  const handleConfirmDefect = (id: string) => {
    resolveFindingMutation.mutate({ id, status: "CONFIRMED" })
  }

  const handleOpenRiskDialog = (_id: string) => {
    setIsRiskDialogOpen(true)
  }

  const handleConfirmRisk = (duration: string, reason: string) => {
    if (!activeSelectedId) return
    resolveFindingMutation.mutate(
      {
        id: activeSelectedId,
        status: "RISK_ACCEPTED",
        duration,
        reason,
      },
      {
        onSuccess: () => {
          setIsRiskDialogOpen(false)
        },
      }
    )
  }

  const handleFalsePositive = (id: string) => {
    resolveFindingMutation.mutate({ id, status: "FALSE_POSITIVE" })
  }

  const handleResetFilters = () => {
    setSearchValue("")
    setSelectedSeverity("all")
    setSelectedService("all")
    setSelectedStatus("all")
  }

  const isFiltered =
    searchValue !== "" ||
    selectedSeverity !== "all" ||
    selectedService !== "all" ||
    selectedStatus !== "all"

  return (
    <div className="space-y-5">
      {/* 1. Header with Counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Inbox className="h-6 w-6 text-indigo-400" />
            Инбокс находок
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Верификация архитектурных аномалий, дрейфа и принятие решений (Human-in-the-Loop)
          </p>
        </div>

        {/* Counters */}
        {!isLoading && !isError && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                selectedStatus === "all"
                  ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>Все:</span>
              <span className="font-semibold text-zinc-100">{stats.total}</span>
            </button>

            <button
              onClick={() => setSelectedStatus("NEW")}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                selectedStatus === "NEW"
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/15"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Новые:</span>
              <span className="font-semibold">{stats.newCount}</span>
            </button>

            <button
              onClick={() => setSelectedStatus("CONFIRMED")}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                selectedStatus === "CONFIRMED"
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/15"
              }`}
            >
              <AlertOctagon className="h-3 w-3" />
              <span>В работе:</span>
              <span className="font-semibold">{stats.confirmedCount}</span>
            </button>

            <button
              onClick={() => setSelectedStatus("RISK_ACCEPTED")}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                selectedStatus === "RISK_ACCEPTED"
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15"
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              <span>Риски:</span>
              <span className="font-semibold">{stats.riskCount}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Toolbar: Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Поиск по файлам, коду, сервисам..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 h-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Severity Filter */}
        <div className="min-w-[150px]">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="h-10 w-full px-3 text-xs rounded-md border border-zinc-800 bg-zinc-900 text-zinc-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Критичность: Все</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Service Filter */}
        <div className="min-w-[170px]">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="h-10 w-full px-3 text-xs rounded-md border border-zinc-800 bg-zinc-900 text-zinc-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">Сервис: Все</option>
            {uniqueServices.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="h-10 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 px-3"
          >
            Сбросить
          </Button>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <div className="p-8 text-center flex flex-col items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/5">
          <AlertTriangle className="h-10 w-10 text-rose-500 mb-3" />
          <h3 className="font-semibold text-base mb-1 text-zinc-100">
            Не удалось загрузить находки
          </h3>
          <p className="text-sm text-zinc-400 max-w-md mb-4">
            Проверьте подключение к Fastify BFF серверу на порту 5000.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Повторить попытку
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[600px]">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skel-${i}`}
                className="p-4 rounded-lg border border-zinc-800 bg-zinc-900 space-y-2"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 bg-zinc-800" />
                  <Skeleton className="h-4 w-16 bg-zinc-800" />
                </div>
                <Skeleton className="h-5 w-4/5 bg-zinc-800" />
                <Skeleton className="h-3 w-32 bg-zinc-800" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <Skeleton className="h-8 w-1/2 mb-4 bg-zinc-800" />
            <Skeleton className="h-32 w-full mb-4 bg-zinc-800" />
            <Skeleton className="h-24 w-full bg-zinc-800" />
          </div>
        </div>
      )}

      {/* 3. Master-Detail Layout: Left (50%) List | Right (50%) Evidence Review */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
          {/* Master List (50% = 6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-2.5">
            {filteredFindings.length === 0 ? (
              <div className="h-80 rounded-lg border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center p-6 text-center">
                <SearchX className="h-10 w-10 text-zinc-500 mb-2" />
                <p className="font-semibold text-sm text-zinc-200">Находки не найдены</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                  {isFiltered
                    ? "По заданным фильтрам нет подходящих расхождений."
                    : "В инбоксе пока нет зарегистрированных находок."}
                </p>
                {isFiltered && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="mt-3 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  >
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            ) : (
              filteredFindings.map((finding) => {
                const isSelected = finding.id === activeSelectedId
                return (
                  <div
                    key={finding.id}
                    onClick={() => setSelectedId(finding.id)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all duration-150 flex flex-col gap-2 relative ${
                      isSelected
                        ? "bg-zinc-850 border-indigo-500/70 shadow-md ring-1 ring-indigo-500/30"
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/60"
                    }`}
                  >
                    {/* Top Row: ID, service, badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-zinc-200">
                          {finding.id}
                        </span>
                        <span className="font-mono text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {finding.serviceId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FindingSeverityBadge severity={finding.severity} />
                        <FindingStatusBadge status={finding.status} />
                      </div>
                    </div>

                    {/* Middle: Title */}
                    <h3 className="text-sm font-medium text-zinc-100 line-clamp-2">
                      {finding.title}
                    </h3>

                    {/* Bottom: Evidence snippets & relative info */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/80">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 truncate max-w-[280px]">
                        {finding.evidence.codeFile && (
                          <span className="truncate">
                            {finding.evidence.codeFile}
                          </span>
                        )}
                        {finding.evidence.codeLines && (
                          <span className="text-emerald-400">
                            {finding.evidence.codeLines}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0">
                        <span>
                          {new Date(finding.createdAt).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-transform ${
                            isSelected ? "text-indigo-400 translate-x-0.5" : "text-zinc-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Detail Review Panel (50% = 6 cols) */}
          <div className="lg:col-span-6 flex flex-col">
            {selectedFinding ? (
              <EvidenceReviewPanel
                finding={selectedFinding}
                isMutating={resolveFindingMutation.isPending}
                onConfirmDefect={handleConfirmDefect}
                onAcceptRisk={handleOpenRiskDialog}
                onFalsePositive={handleFalsePositive}
                onToggleFullscreen={() => setIsFullscreenModalOpen(true)}
              />
            ) : (
              <div className="h-full rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 p-8 flex flex-col items-center justify-center text-center text-zinc-500">
                <Inbox className="h-10 w-10 mb-2 text-zinc-600" />
                <p className="text-sm font-medium text-zinc-300">Находка не выбрана</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                  Выберите расхождение из списка слева для изучения доказательств (Evidence Review).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Fullscreen Modal View (Satisfies both Master-Detail & Modal DoD criteria) */}
      {selectedFinding && (
        <Dialog open={isFullscreenModalOpen} onOpenChange={setIsFullscreenModalOpen}>
          <DialogContent className="max-w-5xl h-[85vh] p-0 bg-transparent border-none overflow-hidden [&>button]:hidden">
            <EvidenceReviewPanel
              finding={selectedFinding}
              isMutating={resolveFindingMutation.isPending}
              onConfirmDefect={handleConfirmDefect}
              onAcceptRisk={handleOpenRiskDialog}
              onFalsePositive={handleFalsePositive}
              isFullscreen={true}
              onClose={() => setIsFullscreenModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* 5. Risk Acceptance Dialog */}
      {selectedFinding && (
        <RiskAcceptanceDialog
          open={isRiskDialogOpen}
          findingId={selectedFinding.id}
          findingTitle={selectedFinding.title}
          isSubmitting={resolveFindingMutation.isPending}
          onClose={() => setIsRiskDialogOpen(false)}
          onConfirm={handleConfirmRisk}
        />
      )}
    </div>
  )
}
