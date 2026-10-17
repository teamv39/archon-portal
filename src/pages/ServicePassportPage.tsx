import { useParams, useNavigate, Link } from "react-router-dom"
import { useService } from "@/hooks/useService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Users,
  Cpu,
  GitFork,
  RefreshCw,
  Code2,
  Radio,
  FileCode,
  ShieldAlert,
} from "lucide-react"

export function ServicePassportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: service, isLoading, isError, refetch } = useService(id)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (isError || !service) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card max-w-2xl mx-auto mt-8">
        <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
        <h2 className="text-xl font-semibold mb-2">Сервис не найден</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Не удалось загрузить данные паспорта сервиса &laquo;{id}&raquo;. Возможно, сервис был удален или сервер недоступен.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/services')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            В каталог сервисов
          </Button>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  const isDriftDetected = service.driftStatus === 'drift_detected'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Navigation & Header */}
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
                На карте LikeC4
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Владелец
            </CardDescription>
            <CardTitle className="text-base font-medium">{service.owner}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Ответственная команда
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4" /> Стек технологий
            </CardDescription>
            <CardTitle className="text-base font-medium">{service.stack}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Базовый рантайм
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <GitFork className="h-4 w-4" /> Исходящие связи
            </CardDescription>
            <CardTitle className="text-base font-medium">{service.dependenciesCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Зависимости в графе
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Code2 className="h-4 w-4" /> Репозиторий
            </CardDescription>
            <CardTitle className="text-sm font-mono truncate" title={service.repoUrl}>
              {service.repoUrl ? service.repoUrl.replace('github.com/', '') : 'Не указан'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Git репозиторий кода
          </CardContent>
        </Card>
      </div>

      {/* Description & Passport details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Паспорт сервиса</CardTitle>
          <CardDescription>
            Сводная информация из docs-as-code модели и архитектурного Source of Truth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Назначение и описание
            </h4>
            <p className="text-sm leading-relaxed">
              {service.description || "Описание для этого сервиса пока не заполнено в архитектурном манифесте."}
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Статус архитектурного соответствия
            </h4>
            {isDriftDetected ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3.5 text-sm flex items-start gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Обнаружено расхождение с архитектурной политикой No-Cycles</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Сервис содержит исходящие вызовы, создающие циклическую зависимость (цикл L=2).
                    Рекомендуется использовать асинхронные события брокера сообщений.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm flex items-start gap-3 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Полное соответствие Source of Truth</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Архитектурная модель в репозитории полностью синхронизирована с фактическим состоянием рантайма.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contracts & Endpoints */}
      {service.contracts && service.contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              API Эндпоинты и Контракты
            </CardTitle>
            <CardDescription>
              Задекларированные публичные интерфейсы сервиса согласно Golden Dataset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.contracts.map((contract) => (
              <div key={contract.endpoint} className="p-4 rounded-lg border bg-muted/30 space-y-2">
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
                <p className="text-xs text-muted-foreground">{contract.description}</p>

                {contract.architectural_constraints && contract.architectural_constraints.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/60">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-amber-500" />
                      Архитектурные ограничения:
                    </div>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5 pl-1">
                      {contract.architectural_constraints.map((constraint, idx) => (
                        <li key={idx}>{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Outgoing Calls / Dependencies */}
      {service.outgoingCalls && service.outgoingCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Исходящие интеграции ({service.outgoingCalls.length})
            </CardTitle>
            <CardDescription>
              Сетевые вызовы и публикации в брокеры согласно архитектурному манифесту
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {service.outgoingCalls.map((call, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-md border text-sm flex items-start justify-between gap-3 ${
                    call.is_defect_cycle
                      ? 'border-destructive/40 bg-destructive/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{call.target}</span>
                      {call.is_defect_cycle && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          Дефект (Цикл)
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {call.contract && <span>Контракт: <code className="font-mono">{call.contract}</code></span>}
                      {call.topic && <span>Топик Kafka: <code className="font-mono">{call.topic}</code></span>}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                    {call.protocol}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
