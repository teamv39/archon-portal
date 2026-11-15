import { EmptyState } from "@/components/ui/empty-state"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useService } from "@/hooks/useService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorState } from "@/components/ui/error-state"
import { PassportSkeleton } from "@/components/ui/screen-skeletons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  CheckCircle2,
  AlertTriangle,
  Layers,
  Users,
  Cpu,
  GitFork,
  FileCode,
  Radio,
  Database,
  ExternalLink,
  BookOpen,
  Code2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"

export function ServicePassportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: service, isLoading, isError, error, refetch } = useService(id)

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

  const isDriftDetected = service.driftStatus === 'drift_detected'
  const outgoingCalls = service.outgoingCalls || []
  const contracts = service.contracts || []
  const databases = service.databases || []
  const brokerTopics = service.brokerTopics || []

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/services')}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Назад в каталог сервисов
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{service.name}</h1>
              {isDriftDetected ? (
                <Badge variant="destructive" className="flex items-center gap-1.5 px-2.5 py-0.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Обнаружен дрейф
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1.5 px-2.5 py-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Актуально
                </Badge>
              )}
              {service.tier !== undefined && (
                <Badge variant="outline" className="font-mono text-xs">
                  Tier {service.tier}
                </Badge>
              )}
            </div>
            <p className="text-sm font-mono text-muted-foreground mt-1">ID: {service.id}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/architecture">
                <Layers className="h-4 w-4 mr-1.5" />
                На архитектурной карте
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="overview" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="gap-2">
            <GitFork className="h-4 w-4" />
            Зависимости ({outgoingCalls.length})
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileCode className="h-4 w-4" />
            Контракты ({contracts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Владелец
                </CardDescription>
                <CardTitle className="text-base font-medium">{service.owner}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Команда разработки
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" /> Стек
                </CardDescription>
                <CardTitle className="text-base font-medium">{service.stack}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Язык и фреймворк
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Code2 className="h-4 w-4" /> Репозиторий
                </CardDescription>
                <CardTitle className="text-sm font-mono truncate" title={service.repoUrl}>
                  {service.repoUrl ? (
                    <a
                      href={`https://${service.repoUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {service.repoUrl.replace('github.com/', '')}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    'Не указан'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Исходный код
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> Документация
                </CardDescription>
                <CardTitle className="text-sm font-medium">
                  {service.docsUrl ? (
                    <a
                      href={service.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Archon Docs
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    'Отсутствует'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Docs-as-code спецификация
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Описание сервиса</CardTitle>
              <CardDescription>
                Назначение и зона ответственности в доменной архитектуре
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">
                {service.description || "Описание для этого сервиса пока не заполнено."}
              </p>

              <div className="border-t pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Статус архитектурного соответствия
                </h4>
                {isDriftDetected ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm flex items-start gap-3 text-destructive">
                    <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Обнаружено нарушение архитектурной политики No-Cycles</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Один или несколько исходящих вызовов создают циклическую зависимость в графе вызовов.
                        Необходимо перевести синхронный REST вызов на асинхронные события брокера.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm flex items-start gap-3 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Архитектурный дрейф отсутствует</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Все сетевые связи и контракты сервиса строго соответствуют архитектурному Source of Truth.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Исходящие вызовы (Сервисы-партнеры)</CardTitle>
              <CardDescription>
                Сетевые зависимости сервиса, протоколы вызова и контракты
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outgoingCalls.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Сервис-партнер</TableHead>
                        <TableHead>Протокол</TableHead>
                        <TableHead>Контракт / Топик</TableHead>
                        <TableHead>Статус связи</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outgoingCalls.map((call, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-foreground">
                            {call.target}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {call.protocol}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {call.contract && <span>контракт: {call.contract}</span>}
                            {call.topic && <span>топик: {call.topic}</span>}
                            {!call.contract && !call.topic && '—'}
                          </TableCell>
                          <TableCell>
                            {call.is_defect_cycle ? (
                              <Badge variant="destructive" className="gap-1 text-xs">
                                <AlertTriangle className="h-3 w-3" />
                                Дефект: цикл
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/10 text-xs">
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
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Подключенные базы данных
                </CardTitle>
                <CardDescription>
                  Хранилища данных, СУБД и распределенные кэши
                </CardDescription>
              </CardHeader>
              <CardContent>
                {databases.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {databases.map((db, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card text-xs font-medium"
                      >
                        <Database className="h-3.5 w-3.5 text-muted-foreground" />
                        {db}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Нет подключенных СУБД.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" />
                  Топики брокеров сообщений
                </CardTitle>
                <CardDescription>
                  События Kafka / брокера, публикуемые или потребляемые сервисом
                </CardDescription>
              </CardHeader>
              <CardContent>
                {brokerTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {brokerTopics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card text-xs font-mono text-muted-foreground"
                      >
                        <Radio className="h-3.5 w-3.5 text-primary" />
                        {topic}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Нет связанных топиков брокера.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Опубликованные API-эндпоинты</CardTitle>
              <CardDescription>
                Перечень зарегистрированных контрактов сервиса и статус их документированности
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length > 0 ? (
                <div className="space-y-3">
                  {contracts.map((contract, idx) => (
                    <div key={idx} className="p-4 rounded-lg border bg-card space-y-2">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Badge variant="outline" className="font-mono font-bold bg-primary/10 text-primary border-primary/30">
                            {contract.method}
                          </Badge>
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {contract.endpoint}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {contract.protocol}
                          </Badge>
                        </div>

                        <div>
                          {contract.docStatus === 'DOCUMENTED' && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                              Задокументирован
                            </Badge>
                          )}
                          {contract.docStatus === 'NEEDS_UPDATE' && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                              Требует обновления
                            </Badge>
                          )}
                          {contract.docStatus === 'UNDOCUMENTED' && (
                            <Badge variant="secondary" className="text-xs">
                              Не задокументирован
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">{contract.description}</p>

                      {contract.architectural_constraints && contract.architectural_constraints.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-border/70 text-xs">
                          <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[13px] block mb-1">
                            Архитектурные ограничения:
                          </span>
                          <ul className="list-disc list-inside text-muted-foreground space-y-0.5 pl-1">
                            {contract.architectural_constraints.map((c, cIdx) => (
                              <li key={cIdx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
