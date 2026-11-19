import { EmptyState } from "@/components/ui/empty-state"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useService } from "@/hooks/useService"
import { useFindings } from "@/hooks/useFindings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ErrorState } from "@/components/ui/error-state"
import { PassportSkeleton } from "@/components/ui/screen-skeletons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FindingSeverityBadge } from "@/components/findings/FindingSeverityBadge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Network,
  ExternalLink,
  Database,
  Radio,
} from "lucide-react"

function formatTimeAgo(dateStr?: string, fallback = "5 дней назад"): string {
  if (!dateStr) return fallback
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return fallback
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "сегодня"
  if (diffDays === 1) return "1 день назад"
  if (diffDays >= 2 && diffDays <= 4) return `${diffDays} дня назад`
  if (diffDays >= 5 && diffDays <= 20) return `${diffDays} дней назад`
  return date.toLocaleDateString("ru-RU")
}

export function ServicePassportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: service, isLoading, isError, error, refetch } = useService(id)
  const { data: allFindings = [] } = useFindings({ serviceId: id })

  if (isLoading) {
    return <PassportSkeleton />
  }

  if (isError || !service) {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <ErrorState
          error={error}
          title={!service && !isError ? "Сервис не найден" : undefined}
          description={!service && !isError ? `Сервис «${id}» не найден в графе знаний платформы.` : undefined}
          onRetry={() => refetch()}
          onBack={() => navigate("/services")}
          backLabel="Вернуться в каталог"
        />
      </div>
    )
  }

  const isDriftDetected = service.driftStatus === "drift_detected"
  const outgoingCalls = service.outgoingCalls || []
  const contracts = service.contracts || []
  const databases = service.databases || []
  const brokerTopics = service.brokerTopics || []

  const activeFindings = allFindings.filter(
    (f) => f.status === "NEW" || f.status === "CONFIRMED"
  )

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <button
          onClick={() => navigate("/services")}
          className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Каталог сервисов
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
        <span className="font-mono text-zinc-100">{service.id || service.name}</span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-3">
          <h1 className="text-3xl font-mono font-bold tracking-tight text-zinc-100">
            {service.id || service.name}
          </h1>

          <div className="flex items-center gap-2.5 flex-wrap">
            {isDriftDetected ? (
              <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center gap-1.5 px-2.5 py-0.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Drift Detected
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 px-2.5 py-0.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                In Sync
              </Badge>
            )}

            <Badge className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-medium">
              Tier-{service.tier ?? 1}
            </Badge>

            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-zinc-800 text-zinc-300">
              @{service.owner ? service.owner.toLowerCase() : "payments"}
            </span>

            <span className="px-2 py-0.5 text-xs text-zinc-400 font-mono">
              {service.stack}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {service.repoUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
            >
              <a
                href={service.repoUrl.startsWith("http") ? service.repoUrl : `https://${service.repoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Репозиторий
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200"
          >
            <Link to="/architecture">
              <Network className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
              C4 Карта
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-zinc-900/80 border border-zinc-800 p-1 rounded-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
          >
            Обзор
          </TabsTrigger>
          <TabsTrigger
            value="dependencies"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
          >
            Зависимости ({outgoingCalls.length})
          </TabsTrigger>
          <TabsTrigger
            value="contracts"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
          >
            Контракты ({contracts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-zinc-400">Эндпоинты</span>
              <div className="my-2 text-2xl font-bold tracking-tight text-zinc-100">
                {contracts.length}
              </div>
              <span className="text-xs text-zinc-500">в контрактах API</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-zinc-400">Входящие потребители</span>
              <div className="my-2 text-2xl font-bold tracking-tight text-zinc-100">
                3 сервиса
              </div>
              <span className="text-xs text-zinc-500">вызывают этот сервис</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-zinc-400">Исходящие зависимости</span>
              <div className="my-2 text-2xl font-bold tracking-tight text-zinc-100">
                {outgoingCalls.length} сервисов{databases.length > 0 ? `, ${databases.length} БД` : ""}
              </div>
              <span className="text-xs text-zinc-500">вызывает этот сервис</span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-zinc-400">Первое появление</span>
              <div className="my-2 text-2xl font-mono font-bold tracking-tight text-zinc-100">
                03.03.2026
              </div>
              <span className="text-xs text-zinc-500">дата в графе знаний</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Описание сервиса</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Назначение и зона ответственности в доменной архитектуре
              </p>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {service.description ||
                "Формирование инвойсов, процессинг платежей и публикация событий в брокер сообщений Kafka."}
            </p>

            {isDriftDetected && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-rose-500" />
                <div>
                  <h4 className="text-sm font-semibold text-rose-400">
                    Обнаружено расхождение документации и кода
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Найдено расхождений: {activeFindings.length || 2}. Откройте инбокс, чтобы сверить документацию с кодом и принять решение.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                АКТИВНЫЕ РАСХОЖДЕНИЯ ({activeFindings.length})
              </h4>
              <Link
                to={`/findings?serviceId=${service.id}`}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                Перейти к разбору в Инбокс
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {activeFindings.length > 0 ? (
                activeFindings.map((finding) => (
                  <div
                    key={finding.id}
                    onClick={() => navigate(`/findings?serviceId=${service.id}&findingId=${finding.id}`)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3.5 flex items-center justify-between gap-4 hover:border-zinc-700 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FindingSeverityBadge severity={finding.severity} />
                      <span className="font-mono text-xs text-zinc-400 shrink-0">{finding.id}</span>
                      <span className="text-sm text-zinc-200 truncate">{finding.title}</span>
                    </div>
                    <span className="text-xs text-zinc-500 shrink-0">
                      {formatTimeAgo(finding.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState
                  variant="success"
                  title="Расхождений не обнаружено"
                  description="Архитектурная документация сервиса полностью соответствует коду."
                  className="min-h-[140px] py-4"
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-4 mt-0">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Исходящие вызовы и зависимости</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Сетевые взаимодействия, зафиксированные в AST и манифестах архитектуры
              </p>
            </div>

            {outgoingCalls.length > 0 ? (
              <div className="rounded-md border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-900">
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-400">Целевой сервис / Компонент</TableHead>
                      <TableHead className="text-zinc-400">Протокол</TableHead>
                      <TableHead className="text-zinc-400">Контракт / Топик</TableHead>
                      <TableHead className="text-zinc-400 text-right">Статус связи</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outgoingCalls.map((call, idx) => (
                      <TableRow key={idx} className="border-zinc-800 hover:bg-zinc-800/40">
                        <TableCell className="font-mono font-medium text-zinc-100">
                          {call.target}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-300 text-xs">
                            {call.protocol}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-zinc-400">
                          {call.contract || call.topic || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {call.is_defect_cycle ? (
                            <Badge variant="destructive" className="flex w-fit ml-auto items-center gap-1 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              Дефект: цикл
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-xs">
                              Валидно
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                title="Нет исходящих зависимостей"
                description="У этого сервиса нет зарегистрированных исходящих вызовов."
                className="min-h-[160px] py-6"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
                <Database className="h-4 w-4 text-indigo-400" />
                Подключенные базы данных
              </div>
              <p className="text-xs text-zinc-400">
                Хранилища данных, СУБД и распределенные кэши
              </p>
              {databases.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {databases.map((db, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300"
                    >
                      <Database className="h-3.5 w-3.5 text-zinc-500" />
                      {db}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 pt-2">Нет подключенных СУБД.</p>
              )}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
                <Radio className="h-4 w-4 text-indigo-400" />
                Топики брокеров сообщений
              </div>
              <p className="text-xs text-zinc-400">
                События Kafka / брокера, публикуемые или потребляемые сервисом
              </p>
              {brokerTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {brokerTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-300"
                    >
                      <Radio className="h-3.5 w-3.5 text-indigo-400" />
                      {topic}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 pt-2">Нет связанных топиков брокера.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4 mt-0">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Опубликованные API-эндпоинты</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Перечень зарегистрированных контрактов сервиса и статус их документированности
              </p>
            </div>

            {contracts.length > 0 ? (
              <div className="space-y-3">
                {contracts.map((contract, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900 space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Badge variant="outline" className="font-mono font-bold bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                          {contract.method}
                        </Badge>
                        <span className="font-mono text-sm font-semibold text-zinc-100">
                          {contract.endpoint}
                        </span>
                        <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400">
                          {contract.protocol}
                        </Badge>
                      </div>

                      <div>
                        {contract.docStatus === "DOCUMENTED" && (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs">
                            Задокументирован
                          </Badge>
                        )}
                        {contract.docStatus === "NEEDS_UPDATE" && (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
                            Требует обновления
                          </Badge>
                        )}
                        {contract.docStatus === "UNDOCUMENTED" && (
                          <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-400">
                            Не задокументирован
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400">{contract.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Нет публичных контрактов"
                description="Сервис не экспортирует публичных HTTP-контрактов (фоновый обработчик)."
                className="min-h-[160px] py-6"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
