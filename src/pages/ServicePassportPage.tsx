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
import { DesignTokens } from "@/config/designTokens"
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
    <div className={DesignTokens.layout.container}>
      <div className={DesignTokens.layout.breadcrumbs}>
        <button
          onClick={() => navigate("/services")}
          className={DesignTokens.layout.breadcrumbLink}
        >
          <ArrowLeft className={DesignTokens.layout.breadcrumbIcon} />
          Каталог сервисов
        </button>
        <ChevronRight className={DesignTokens.layout.breadcrumbChevron} />
        <span className={DesignTokens.layout.breadcrumbCurrent}>{service.id || service.name}</span>
      </div>

      <div className={DesignTokens.hero.card} style={{ padding: "var(--passport-hero-padding, 1.5rem)" }}>
        <div className={DesignTokens.hero.contentCol}>
          <h1 className={DesignTokens.hero.title}>
            {service.id || service.name}
          </h1>

          <div className={DesignTokens.hero.badgesRow}>
            {isDriftDetected ? (
              <Badge className={DesignTokens.badges.drift}>
                <span className={DesignTokens.badges.dotDrift} />
                Drift Detected
              </Badge>
            ) : (
              <Badge className={DesignTokens.badges.sync}>
                <span className={DesignTokens.badges.dotSync} />
                In Sync
              </Badge>
            )}

            <Badge className={DesignTokens.badges.tier}>
              Tier-{service.tier ?? 1}
            </Badge>

            <span className={DesignTokens.badges.teamTag}>
              @{service.owner ? service.owner.toLowerCase() : "payments"}
            </span>

            <span className={DesignTokens.badges.stackTag}>
              {service.stack}
            </span>
          </div>
        </div>

        <div className={DesignTokens.hero.actionsRow}>
          {service.repoUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className={DesignTokens.hero.actionButton}
            >
              <a
                href={service.repoUrl.startsWith("http") ? service.repoUrl : `https://${service.repoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Репозиторий
                <ExternalLink className={DesignTokens.hero.actionIcon} />
              </a>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            asChild
            className={DesignTokens.hero.actionButton}
          >
            <Link to="/architecture">
              <Network className={DesignTokens.hero.actionIconLeft} />
              C4 Карта
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className={DesignTokens.tabs.container}>
        <TabsList className={DesignTokens.tabs.list}>
          <TabsTrigger
            value="overview"
            className={DesignTokens.tabs.trigger}
          >
            Обзор
          </TabsTrigger>
          <TabsTrigger
            value="dependencies"
            className={DesignTokens.tabs.trigger}
          >
            Зависимости ({outgoingCalls.length})
          </TabsTrigger>
          <TabsTrigger
            value="contracts"
            className={DesignTokens.tabs.trigger}
          >
            Контракты ({contracts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className={DesignTokens.tabs.content}>
          <div className={DesignTokens.metrics.grid}>
            <div className={DesignTokens.metrics.card} style={{ padding: "var(--passport-metric-padding, 1rem)" }}>
              <span className={DesignTokens.metrics.label}>Эндпоинты</span>
              <div className={DesignTokens.metrics.value} style={{ fontSize: "var(--passport-metric-value-size, 1.5rem)" }}>
                {contracts.length}
              </div>
              <span className={DesignTokens.metrics.subtext}>в контрактах API</span>
            </div>

            <div className={DesignTokens.metrics.card} style={{ padding: "var(--passport-metric-padding, 1rem)" }}>
              <span className={DesignTokens.metrics.label}>Входящие потребители</span>
              <div className={DesignTokens.metrics.value} style={{ fontSize: "var(--passport-metric-value-size, 1.5rem)" }}>
                3 сервиса
              </div>
              <span className={DesignTokens.metrics.subtext}>вызывают этот сервис</span>
            </div>

            <div className={DesignTokens.metrics.card} style={{ padding: "var(--passport-metric-padding, 1rem)" }}>
              <span className={DesignTokens.metrics.label}>Исходящие зависимости</span>
              <div className={DesignTokens.metrics.value} style={{ fontSize: "var(--passport-metric-value-size, 1.5rem)" }}>
                {outgoingCalls.length} сервисов{databases.length > 0 ? `, ${databases.length} БД` : ""}
              </div>
              <span className={DesignTokens.metrics.subtext}>вызывает этот сервис</span>
            </div>

            <div className={DesignTokens.metrics.card} style={{ padding: "var(--passport-metric-padding, 1rem)" }}>
              <span className={DesignTokens.metrics.label}>Первое появление</span>
              <div className={DesignTokens.metrics.valueMono} style={{ fontSize: "var(--passport-metric-value-size, 1.5rem)" }}>
                03.03.2026
              </div>
              <span className={DesignTokens.metrics.subtext}>дата в графе знаний</span>
            </div>
          </div>

          <div className={DesignTokens.description.card}>
            <div className={DesignTokens.description.headerCol}>
              <h3 className={DesignTokens.description.title}>Описание сервиса</h3>
              <p className={DesignTokens.description.subtitle}>
                Назначение и зона ответственности в доменной архитектуре
              </p>
            </div>
            <p className={DesignTokens.description.body}>
              {service.description ||
                "Формирование инвойсов, процессинг платежей и публикация событий в брокер сообщений Kafka."}
            </p>

            {isDriftDetected && (
              <div className={DesignTokens.description.alertBox}>
                <AlertCircle className={DesignTokens.description.alertIcon} />
                <div>
                  <h4 className={DesignTokens.description.alertTitle}>
                    Обнаружено расхождение документации и кода
                  </h4>
                  <p className={DesignTokens.description.alertText}>
                    Найдено расхождений: {activeFindings.length || 2}. Откройте инбокс, чтобы сверить документацию с кодом и принять решение.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={DesignTokens.findings.container}>
            <div className={DesignTokens.findings.headerRow}>
              <h4 className={DesignTokens.findings.headerTitle}>
                АКТИВНЫЕ РАСХОЖДЕНИЯ ({activeFindings.length})
              </h4>
              <Link
                to={`/findings?serviceId=${service.id}`}
                className={DesignTokens.findings.headerLink}
              >
                Перейти к разбору в Инбокс
                <ArrowRight className={DesignTokens.findings.arrowIcon} />
              </Link>
            </div>

            <div className={DesignTokens.findings.list}>
              {activeFindings.length > 0 ? (
                activeFindings.map((finding) => (
                  <div
                    key={finding.id}
                    onClick={() => navigate(`/findings?serviceId=${service.id}&findingId=${finding.id}`)}
                    className={DesignTokens.findings.row}
                    style={{ padding: "var(--passport-finding-padding, 0.875rem)" }}
                  >
                    <div className={DesignTokens.findings.leftCol}>
                      <FindingSeverityBadge severity={finding.severity} />
                      <span className={DesignTokens.findings.id}>{finding.id}</span>
                      <span className={DesignTokens.findings.title}>{finding.title}</span>
                    </div>
                    <span className={DesignTokens.findings.timeAgo}>
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
