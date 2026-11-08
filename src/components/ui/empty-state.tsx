import * as React from "react"
import { type LucideIcon, SearchX, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: LucideIcon
  variant?: "default" | "success"
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  variant = "default",
  className,
  children,
  ...props
}: EmptyStateProps) {
  const ResolvedIcon = Icon || (variant === "success" ? CheckCircle2 : SearchX)

  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-full border",
          variant === "success"
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            : "border-zinc-800 bg-zinc-900 text-zinc-400"
        )}
      >
        <ResolvedIcon className="h-7 w-7" />
      </div>

      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-md text-sm text-zinc-400 leading-relaxed">
          {description}
        </p>
      )}

      {children}

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onAction}>
            {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
