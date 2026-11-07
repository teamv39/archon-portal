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
        return <Database className="h-4 w-4 text-sky-400" />
      case "queue":
        return <Radio className="h-4 w-4 text-amber-400" />
      case "system":
        return <Globe className="h-4 w-4 text-indigo-400" />
      case "component":
        return <Layers className="h-4 w-4 text-violet-400" />
      case "service":
      default:
        return <Server className="h-4 w-4 text-indigo-400" />
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

  return (
    <div
      className={`relative min-w-[220px] max-w-[260px] rounded-xl border bg-zinc-900 p-3.5 shadow-lg select-none cursor-pointer will-change-transform transition-[border-color,box-shadow] duration-150 ${
        selected
          ? "ring-2 ring-indigo-500 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.35)]"
          : isDrift
          ? "border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:border-rose-400"
          : isSync
          ? "border-zinc-800 hover:border-emerald-500/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          : "border-zinc-800 hover:border-zinc-700"
      }`}
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
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
          {getNodeIcon()}
          <span>{getTypeLabel()}</span>
        </div>

        {tier !== undefined && (
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Tier {tier}
          </span>
        )}
      </div>

      {/* Node Title */}
      <div className="font-semibold text-sm text-zinc-100 leading-tight truncate mb-2">
        {title}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px]">
        {isDrift ? (
          <div className="flex items-center gap-1 font-medium text-rose-400">
            <AlertTriangle className="h-3 w-3" />
            <span>Дрейф обнаружен</span>
          </div>
        ) : isSync ? (
          <div className="flex items-center gap-1 font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>В актуале</span>
          </div>
        ) : (
          <span className="text-zinc-500 font-mono text-[10px]">{nodeData.description || "Инфраструктура"}</span>
        )}

        <span className="text-zinc-500 font-mono text-[10px]">
          {nodeData.incomingCount !== undefined && nodeData.outgoingCount !== undefined
            ? `↓${nodeData.incomingCount} ↑${nodeData.outgoingCount}`
            : ""}
        </span>
      </div>
    </div>
  )
}

export const C4Node = memo(C4NodeComponent)
