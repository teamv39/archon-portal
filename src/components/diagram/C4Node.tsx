import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import {
  Server,
  Database,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Globe,
} from "lucide-react"
import type { DiagramNodeType, DriftStatus } from "@/types/diagram"
import { DesignTokens } from "@/config/designTokens"

export interface C4NodeData {
  title: string
  type: DiagramNodeType | "system" | "component"
  tier?: number
  driftStatus?: DriftStatus
  description?: string
  incomingCount?: number
  outgoingCount?: number
}

function C4NodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as C4NodeData
  const { title, type, tier, driftStatus } = nodeData

  const isDrift = driftStatus === "drift_detected"
  const isSync = driftStatus === "in_sync"

  const getNodeIcon = () => {
    switch (type) {
      case "database":
        return <Database className={`h-4 w-4 ${DesignTokens.c4.typeColors.database}`} />
      case "queue":
        return <Radio className={`h-4 w-4 ${DesignTokens.c4.typeColors.queue}`} />
      case "system":
        return <Globe className={`h-4 w-4 ${DesignTokens.c4.typeColors.system}`} />
      case "component":
        return <Layers className={`h-4 w-4 ${DesignTokens.c4.typeColors.component}`} />
      case "service":
      default:
        return <Server className={`h-4 w-4 ${DesignTokens.c4.typeColors.service}`} />
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case "database":
        return "База данных"
      case "queue":
        return "Очередь сообщений"
      case "system":
        return "Системный контекст"
      case "component":
        return "Компонент"
      case "service":
      default:
        return "Микросервис"
    }
  }

  const stateStyle = selected
    ? DesignTokens.c4.node.selected
    : isDrift
    ? DesignTokens.c4.node.drift
    : isSync
    ? DesignTokens.c4.node.sync
    : DesignTokens.c4.node.default

  return (
    <div
      className={`${DesignTokens.c4.node.base} ${DesignTokens.c4.node.dimensions} ${stateStyle}`}
      style={{
        width: "var(--dev-c4-width, 240px)",
        boxShadow: isDrift ? "var(--dev-drift-glow, 0 0 15px rgba(244,63,94,0.2))" : undefined,
      }}
    >
      {/* Invisible anchor handles on all 4 sides for collision-free edge routing */}
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        isConnectable={false}
        className="!opacity-0 !pointer-events-none !w-0 !h-0 !border-none"
      />
      <Handle
        type="source"
        id="top-source"
        position={Position.Top}
        isConnectable={false}
        className="!opacity-0 !pointer-events-none !w-0 !h-0 !border-none"
      />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        isConnectable={false}
        className="!opacity-0 !pointer-events-none !w-0 !h-0 !border-none"
      />
      <Handle
        type="target"
        id="bottom-target"
        position={Position.Bottom}
        isConnectable={false}
        className="!opacity-0 !pointer-events-none !w-0 !h-0 !border-none"
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        isConnectable={false}
        className="!opacity-0 !pointer-events-none !w-0 !h-0 !border-none"
      />
      <Handle
        type="source"
        id="left-source"
        position={Position.Left}
        isConnectable={false}
        className="!opacity-0 !pointer-events-none !w-0 !h-0 !border-none"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        isConnectable={false}
        className="!opacity-0 !pointer-events-none !w-0 !h-0 !border-none"
      />
      <Handle
        type="target"
        id="right-target"
        position={Position.Right}
        isConnectable={false}
        className="!opacity-0 !pointer-events-none !w-0 !h-0 !border-none"
      />

      {/* Top Meta: Type & Tier */}
      <div className={DesignTokens.c4.meta.row}>
        <div className={DesignTokens.c4.meta.typeLabel}>
          {getNodeIcon()}
          <span>{getTypeLabel()}</span>
        </div>

        {tier !== undefined && (
          <span className={DesignTokens.c4.meta.tierBadge}>
            Tier {tier}
          </span>
        )}
      </div>

      {/* Node Title */}
      <div className={DesignTokens.c4.title.text}>
        {title}
      </div>

      {/* Status Bar */}
      <div className={DesignTokens.c4.footer.row}>
        {isDrift ? (
          <div className={DesignTokens.c4.footer.drift}>
            <AlertTriangle className={DesignTokens.c4.footer.icon} />
            <span>Дрейф обнаружен</span>
          </div>
        ) : isSync ? (
          <div className={DesignTokens.c4.footer.sync}>
            <CheckCircle2 className={DesignTokens.c4.footer.icon} />
            <span>В актуале</span>
          </div>
        ) : (
          <span className={DesignTokens.c4.footer.infra}>{nodeData.description || "Инфраструктура"}</span>
        )}

        <span className={DesignTokens.c4.footer.counter}>
          {nodeData.incomingCount !== undefined && nodeData.outgoingCount !== undefined
            ? `↓${nodeData.incomingCount} ↑${nodeData.outgoingCount}`
            : ""}
        </span>
      </div>
    </div>
  )
}

export const C4Node = memo(C4NodeComponent)
