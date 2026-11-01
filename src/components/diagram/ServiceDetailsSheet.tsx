import { Link } from "react-router-dom"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Server,
  Database,
  Radio,
  ExternalLink,
  AlertTriangle,
  GitFork,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"
import type { DiagramNode, DiagramEdge } from "@/types/diagram"

interface ServiceDetailsSheetProps {
  node: DiagramNode | null
  edges: DiagramEdge[]
  allNodes: DiagramNode[]
  open: boolean
  onClose: () => void
}

export function ServiceDetailsSheet({
  node,
  edges,
  allNodes,
  open,
  onClose,
}: ServiceDetailsSheetProps) {
  if (!node) return null

  const isDrift = node.driftStatus === "drift_detected"
  const isSync = node.driftStatus === "in_sync"

  // Outgoing calls from this node
  const outgoing = edges.filter((e) => e.source === node.id)
  // Incoming calls to this node
  const incoming = edges.filter((e) => e.target === node.id)

  const getNodeTitle = (id: string) => {
    return allNodes.find((n) => n.id === id)?.title || id
  }

  const hasAnyDriftInEdges = outgoing.some((e) => e.isDrift) || incoming.some((e) => e.isDrift)

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100 p-6 overflow-y-auto">
        <SheetHeader className="text-left space-y-2 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              {node.id}
            </span>
            {node.tier !== undefined && (
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Tier {node.tier}
              </span>
            )}
            {isDrift && (
              <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-xs">
                Дрейф обнаружен
              </Badge>
            )}
            {isSync && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                В актуале
              </Badge>
            )}
          </div>

          <SheetTitle className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            {node.type === "database" ? (
              <Database className="h-5 w-5 text-sky-400 shrink-0" />
            ) : node.type === "queue" ? (
              <Radio className="h-5 w-5 text-amber-400 shrink-0" />
            ) : (
              <Server className="h-5 w-5 text-indigo-400 shrink-0" />
            )}
            <span>{node.title}</span>
          </SheetTitle>

          <SheetDescription className="text-xs text-zinc-400">
            Тип узла: {node.type === "service" ? "Микросервис" : node.type === "database" ? "База данных" : "Очередь сообщений"}
          </SheetDescription>
        </SheetHeader>

        {/* Action Button: To Service Passport */}
        <div className="pt-4 pb-2">
          {node.type === "service" ? (
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs h-9">
              <Link to={`/services/${node.id}`}>
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                Открыть паспорт сервиса
              </Link>
            </Button>
          ) : (
            <div className="text-xs text-zinc-500 italic">
              Инфраструктурный ресурс архитектуры
            </div>
          )}
        </div>

        {/* Warning if drift exists */}
        {(isDrift || hasAnyDriftInEdges) && (
          <div className="my-3 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
              <span>Зафиксированы архитектурные аномалии</span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Сервис имеет несогласованные синхронные вызовы или обращения к чужой базе данных.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
            >
              <Link to="/findings">
                Перейти в Инбокс находок
              </Link>
            </Button>
          </div>
        )}

        {/* Outgoing Connections */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <span>Исходящие связи ({outgoing.length})</span>
            <GitFork className="h-3.5 w-3.5 text-zinc-500" />
          </div>

          {outgoing.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Нет исходящих вызовов</p>
          ) : (
            <div className="space-y-2">
              {outgoing.map((edge, idx) => (
                <div
                  key={`out-${idx}`}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 ${
                    edge.isDrift
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-200"
                      : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                      <ArrowRight className="h-3 w-3 text-zinc-400" />
                      {getNodeTitle(edge.target)}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                      {edge.protocol}
                    </span>
                  </div>
                  {edge.label && (
                    <span className="font-mono text-[11px] text-zinc-400 truncate">
                      {edge.label}
                    </span>
                  )}
                  {edge.isDrift && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 pt-0.5">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>Архитектурный дрейф</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Connections */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <span>Входящие связи ({incoming.length})</span>
            <GitFork className="h-3.5 w-3.5 text-zinc-500 rotate-180" />
          </div>

          {incoming.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Нет входящих вызовов</p>
          ) : (
            <div className="space-y-2">
              {incoming.map((edge, idx) => (
                <div
                  key={`in-${idx}`}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 ${
                    edge.isDrift
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-200"
                      : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                      <ArrowRight className="h-3 w-3 text-zinc-400" />
                      От: {getNodeTitle(edge.source)}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                      {edge.protocol}
                    </span>
                  </div>
                  {edge.label && (
                    <span className="font-mono text-[11px] text-zinc-400 truncate">
                      {edge.label}
                    </span>
                  )}
                  {edge.isDrift && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 pt-0.5">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>Архитектурный дрейф</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
