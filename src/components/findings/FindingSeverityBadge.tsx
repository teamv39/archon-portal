import { Badge } from "@/components/ui/badge"
import type { Severity } from "@/types/findings"
import { DesignTokens } from "@/config/designTokens"

const severityConfig: Record<Severity, { label: string; className: string }> = {
  CRITICAL: {
    label: "Critical",
    className: DesignTokens.badges.severity.CRITICAL,
  },
  HIGH: {
    label: "High",
    className: DesignTokens.badges.severity.HIGH,
  },
  MEDIUM: {
    label: "Medium",
    className: DesignTokens.badges.severity.MEDIUM,
  },
  LOW: {
    label: "Low",
    className: DesignTokens.badges.severity.LOW,
  },
}

export function FindingSeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity] || severityConfig.LOW
  return (
    <Badge variant="outline" className={`${config.className} inline-flex items-center gap-1.5`}>
      <span className={DesignTokens.badges.dotCurrent} />
      {config.label}
    </Badge>
  )
}
