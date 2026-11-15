import * as React from "react"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSafeErrorMessage } from "@/lib/api-client"
import { cn } from "@/lib/utils"

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: unknown
  title?: string
  description?: string
  onRetry?: () => void
  onBack?: () => void
  backLabel?: string
  compact?: boolean
}

export function ErrorState({
  error,
  title: overrideTitle,
  description: overrideDesc,
  onRetry,
  onBack,
  backLabel = "Назад",
  compact = false,
  className,
  ...props
}: ErrorStateProps) {
  const safe = React.useMemo(() => getSafeErrorMessage(error), [error])
  const title = overrideTitle || safe.title
  const description = overrideDesc || safe.description

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-left",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
            <p className="text-xs text-zinc-400">{description}</p>
          </div>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-4 shrink-0">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Повторить
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/[0.02] p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-sm">
        <AlertTriangle className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-zinc-400">{description}</p>

      {(safe.status || safe.instance || safe.type) && (
        <div className="mt-5 w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-left">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <span className="text-xs text-zinc-500">Диагностика запроса</span>
            {safe.status ? (
              <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs">
                HTTP {safe.status}
              </Badge>
            ) : null}
          </div>

          <div className="mt-2 space-y-1 font-mono text-xs">
            {safe.instance && (
              <div className="flex items-start justify-between gap-2 text-zinc-400">
                <span className="text-zinc-500">Ресурс:</span>
                <span className="truncate">{safe.instance}</span>
              </div>
            )}
            {safe.type && safe.type !== "about:blank" && (
              <div className="flex items-start justify-between gap-2 text-zinc-400">
                <span className="text-zinc-500">Тип ошибки:</span>
                <span className="truncate">{safe.type}</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-[10px] text-zinc-600">
            Внутренний трейс скрыт политикой безопасности платформы.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Повторить попытку
          </Button>
        )}
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
