import { Badge } from "@/components/ui/badge"
import type { Severity } from "@/types/findings"

const severityConfig: Record<Severity, { label: string; className: string }> = {
  CRITICAL: {
    label: "Critical",
    className: "bg-rose-500/10 text-rose-500 border-rose-500/30 font-medium",
  },
  HIGH: {
    label: "High",
    className: "bg-orange-500/10 text-orange-500 border-orange-500/30 font-medium",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/30 font-medium",
  },
  LOW: {
    label: "Low",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30 font-medium",
  },
}

export function FindingSeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity] || severityConfig.LOW
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
