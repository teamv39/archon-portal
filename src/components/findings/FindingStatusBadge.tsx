import { Badge } from "@/components/ui/badge"
import type { FindingStatus } from "@/types/findings"

const statusConfig: Record<FindingStatus, { label: string; className: string }> = {
  NEW: {
    label: "Новая",
    className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-medium",
  },
  CONFIRMED: {
    label: "Подтвержден",
    className: "bg-rose-500/10 text-rose-500 border-rose-500/30 font-medium",
  },
  RISK_ACCEPTED: {
    label: "Риск принят",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/30 font-medium",
  },
  FALSE_POSITIVE: {
    label: "Ложная тревога",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-medium",
  },
}

export function FindingStatusBadge({ status }: { status: FindingStatus }) {
  const config = statusConfig[status] || statusConfig.NEW
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
