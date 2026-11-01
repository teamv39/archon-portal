import * as React from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { useDiagram } from "@/hooks/useDiagram"
import type { DiagramNode, DiagramEdge, C4ViewLevel } from "@/types/diagram"
import { C4Node } from "@/components/diagram/C4Node"
import { ServiceDetailsSheet } from "@/components/diagram/ServiceDetailsSheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Network,
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertTriangle,
  Globe,
  Layers,
  Box,
} from "lucide-react"

const nodeTypes = {
  c4Node: C4Node,
}

// MiniMap node color mapper (static to prevent re-allocation on pan/zoom)
const miniMapNodeColor = (node: Node) => {
  if (node.data?.driftStatus === "drift_detected") return "#f43f5e"
  if (node.data?.driftStatus === "in_sync") return "#10b981"
  if (node.data?.type === "database") return "#38bdf8"
  if (node.data?.type === "queue") return "#f59e0b"
  return "#6366f1"
}

// Preset layout coordinates for C4 Containers view with generous spacing for labels
const CONTAINER_POSITIONS: Record<string, { x: number; y: number }> = {
  "auth-service": { x: 540, y: 80 },
  "auth-db": { x: 1080, y: 80 },
  "order-service": { x: 60, y: 380 },
  "billing-service": { x: 540, y: 380 },
  "topic-order-paid": { x: 1080, y: 380 },
  "inventory-service": { x: 60, y: 700 },
  "delivery-service": { x: 540, y: 700 },
  "notification-service": { x: 1080, y: 700 },
}

// Deterministic port routing to prevent edge collisions and label overlaps
const CONTAINER_EDGE_ROUTES: Record<
  string,
  { sourceHandle?: string; targetHandle?: string; offset?: number }
> = {
  // Order -> Billing: straight horizontal in row 2
  "order-service->billing-service": { sourceHandle: "right", targetHandle: "left" },
  // Billing -> Order (defect 1 loop): curves cleanly above both nodes
  "billing-service->order-service": { sourceHandle: "top-source", targetHandle: "top", offset: 35 },

  // Order -> Inventory: straight vertical drop in column 1
  "order-service->inventory-service": { sourceHandle: "bottom", targetHandle: "top" },
  // Order -> Delivery: leaves Order right, bypasses column 1 completely
  "order-service->delivery-service": { sourceHandle: "right", targetHandle: "left" },

  // Order -> Auth: leaves Order top, enters Auth left
  "order-service->auth-service": { sourceHandle: "top-source", targetHandle: "left" },

  // Auth -> auth-db: straight horizontal in row 1
  "auth-service->auth-db": { sourceHandle: "right", targetHandle: "left" },
  // Billing -> auth-db (defect 3): leaves Billing top, enters auth-db bottom
  "billing-service->auth-db": { sourceHandle: "top-source", targetHandle: "bottom-target" },
  // Order -> auth-db (defect 3): loops over top corridor, enters auth-db top
  "order-service->auth-db": { sourceHandle: "top-source", targetHandle: "top", offset: 50 },

  // Kafka & Notification: row 2 right and column 3 down
  "billing-service->topic-order-paid": { sourceHandle: "right", targetHandle: "left" },
  "topic-order-paid->notification-service": { sourceHandle: "bottom", targetHandle: "top" },
}

// Clean and readable string labels for SVG <text> rendering in React Flow
function formatEdgeLabel(label?: string): string | undefined {
  if (!label) return undefined

  return label
    .replace("/api/v1/", "/")
    .replace(" (ДЕФЕКТ 1: ЦИКЛ)", " [ДЕФЕКТ 1: ЦИКЛ]")
    .replace(" (ДЕФЕКТ 3: SHARED DB)", " [ДЕФЕКТ 3: SHARED DB]")
}

// Mock System Context View nodes and edges
const CONTEXT_NODES: DiagramNode[] = [
  { id: "customer", title: "Покупатель (Web / Mobile)", type: "service" },
  { id: "archon-platform", title: "Archon E-Commerce Platform", type: "service", tier: 2, driftStatus: "drift_detected" },
  { id: "payment-gateway", title: "Платежный шлюз (Банк)", type: "service" },
  { id: "courier-service", title: "Внешняя курьерская служба", type: "service" },
]

const CONTEXT_EDGES: DiagramEdge[] = [
  { source: "customer", target: "archon-platform", protocol: "HTTPS", isDrift: false, label: "Оформление покупок" },
  { source: "archon-platform", target: "payment-gateway", protocol: "REST", isDrift: false, label: "Проведение платежа" },
  { source: "archon-platform", target: "courier-service", protocol: "REST", isDrift: false, label: "Доставка заказа" },
]

const CONTEXT_POSITIONS: Record<string, { x: number; y: number }> = {
  customer: { x: 80, y: 240 },
  "archon-platform": { x: 520, y: 240 },
  "payment-gateway": { x: 1000, y: 120 },
  "courier-service": { x: 1000, y: 360 },
}

const CONTEXT_EDGE_ROUTES: Record<
  string,
  { sourceHandle?: string; targetHandle?: string; offset?: number }
> = {
  "customer->archon-platform": { sourceHandle: "right", targetHandle: "left" },
  "archon-platform->payment-gateway": { sourceHandle: "right", targetHandle: "left" },
  "archon-platform->courier-service": { sourceHandle: "right", targetHandle: "left" },
}

// Mock Component View (Order Service internals)
const COMPONENT_NODES: DiagramNode[] = [
  { id: "order-controller", title: "OrderController (REST API)", type: "service", tier: 2 },
  { id: "order-service-core", title: "OrderService (Бизнес-логика)", type: "service", tier: 2 },
  { id: "order-repository", title: "OrderRepository (PostgreSQL)", type: "database" },
  { id: "order-client", title: "OrderClient (Внешние вызовы)", type: "service", tier: 2, driftStatus: "drift_detected" },
]

const COMPONENT_EDGES: DiagramEdge[] = [
  { source: "order-controller", target: "order-service-core", protocol: "Internal", isDrift: false, label: "invoke" },
  { source: "order-service-core", target: "order-repository", protocol: "JPA", isDrift: false, label: "save/find" },
  { source: "order-service-core", target: "order-client", protocol: "Internal", isDrift: false, label: "call external" },
  { source: "order-client", target: "order-controller", protocol: "HTTP", isDrift: true, label: "ДЕФЕКТ: Внутренний цикл" },
]

const COMPONENT_POSITIONS: Record<string, { x: number; y: number }> = {
  "order-controller": { x: 120, y: 150 },
  "order-service-core": { x: 620, y: 150 },
  "order-repository": { x: 620, y: 440 },
  "order-client": { x: 120, y: 440 },
}

const COMPONENT_EDGE_ROUTES: Record<
  string,
  { sourceHandle?: string; targetHandle?: string; offset?: number }
> = {
  "order-controller->order-service-core": { sourceHandle: "right", targetHandle: "left" },
  "order-service-core->order-repository": { sourceHandle: "bottom", targetHandle: "top" },
  "order-service-core->order-client": { sourceHandle: "left-source", targetHandle: "right-target" },
  "order-client->order-controller": { sourceHandle: "top-source", targetHandle: "bottom-target" },
}

export function ArchitecturePage() {
  const { data: diagramData, isLoading, isError, refetch } = useDiagram()

  const [viewLevel, setViewLevel] = React.useState<C4ViewLevel>("container")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Current view nodes and edges
  const activeNodesData: DiagramNode[] = React.useMemo(() => {
    if (viewLevel === "context") return CONTEXT_NODES
    if (viewLevel === "component") return COMPONENT_NODES
    return diagramData?.nodes || []
  }, [viewLevel, diagramData])

  const activeEdgesData: DiagramEdge[] = React.useMemo(() => {
    if (viewLevel === "context") return CONTEXT_EDGES
    if (viewLevel === "component") return COMPONENT_EDGES
    return diagramData?.edges || []
  }, [viewLevel, diagramData])

  const activePositions = React.useMemo(() => {
    if (viewLevel === "context") return CONTEXT_POSITIONS
    if (viewLevel === "component") return COMPONENT_POSITIONS
    return CONTAINER_POSITIONS
  }, [viewLevel])

  // Convert to ReactFlow Nodes
  const initialNodes: Node[] = React.useMemo(() => {
    return activeNodesData.map((node) => {
      const pos = activePositions[node.id] || { x: 200, y: 200 }
      const incomingCount = activeEdgesData.filter((e) => e.target === node.id).length
      const outgoingCount = activeEdgesData.filter((e) => e.source === node.id).length

      const isMatchingSearch =
        searchQuery.trim() !== "" &&
        (node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.id.toLowerCase().includes(searchQuery.toLowerCase()))

      return {
        id: node.id,
        type: "c4Node",
        position: pos,
        data: {
          title: node.title,
          type: node.type,
          tier: node.tier,
          driftStatus: node.driftStatus,
          incomingCount,
          outgoingCount,
        },
        selected: node.id === selectedNodeId || isMatchingSearch,
      }
    })
  }, [activeNodesData, activeEdgesData, activePositions, selectedNodeId, searchQuery])

  // Convert to ReactFlow Edges
  const initialEdges: Edge[] = React.useMemo(() => {
    return activeEdgesData.map((edge, index) => {
      const isRelatedToSelected =
        Boolean(selectedNodeId) && (edge.source === selectedNodeId || edge.target === selectedNodeId)

      const route =
        viewLevel === "container"
          ? CONTAINER_EDGE_ROUTES[`${edge.source}->${edge.target}`]
          : viewLevel === "component"
          ? COMPONENT_EDGE_ROUTES[`${edge.source}->${edge.target}`]
          : CONTEXT_EDGE_ROUTES[`${edge.source}->${edge.target}`]

      return {
        id: `e-${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: route?.sourceHandle,
        targetHandle: route?.targetHandle,
        animated: edge.isDrift,
        type: "smoothstep",
        pathOptions: route?.offset ? { offset: route.offset, borderRadius: 16 } : { borderRadius: 16 },
        label: formatEdgeLabel(edge.label || edge.protocol),
        labelStyle: {
          fill: edge.isDrift ? "#f43f5e" : "#e4e4e7",
          fontSize: 11,
          fontFamily: "ui-monospace, monospace",
          fontWeight: 600,
        },
        style: {
          stroke: edge.isDrift
            ? "#f43f5e"
            : isRelatedToSelected
            ? "#6366f1"
            : "#52525b",
          strokeWidth: edge.isDrift ? 2.5 : isRelatedToSelected ? 2 : 1.5,
          strokeDasharray: edge.isDrift ? "5 5" : undefined,
        },
        labelBgStyle: {
          fill: "#18181b",
          fillOpacity: 0.95,
          stroke: edge.isDrift ? "#f43f5e" : "#27272a",
          strokeWidth: 1.5,
          rx: 6,
          ry: 6,
        },
        labelBgPadding: [8, 5] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edge.isDrift ? "#f43f5e" : isRelatedToSelected ? "#6366f1" : "#52525b",
          width: 14,
          height: 14,
        },
      }
    })
  }, [activeEdgesData, selectedNodeId, viewLevel])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Keep state synchronized with memoized items
  React.useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  React.useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  // Handle click on node: select and open Sheet
  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
    setIsSheetOpen(true)
  }

  // Handle click on canvas background: close Sheet
  const handlePaneClick = () => {
    setSelectedNodeId(null)
  }

  const selectedNodeObject = React.useMemo(() => {
    return activeNodesData.find((n) => n.id === selectedNodeId) || null
  }, [activeNodesData, selectedNodeId])

  return (
    <div
      className={`flex flex-col space-y-4 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-zinc-950 p-6 overflow-hidden"
          : "h-[calc(100vh-6rem)]"
      }`}
    >
      {/* 1. Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Network className="h-6 w-6 text-indigo-400" />
            Интерактивная карта LikeC4
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Граф архитектурных сервисов, зависимостей и контроль дефектов дрейфа в реальном времени.
          </p>
        </div>

        {/* C4 View Level Navigation Buttons */}
        <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900 p-1 text-xs shadow-sm">
          <button
            onClick={() => {
              setViewLevel("context")
              setSelectedNodeId(null)
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              viewLevel === "context"
                ? "bg-indigo-600 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            1. System Context
          </button>
          <button
            onClick={() => {
              setViewLevel("container")
              setSelectedNodeId(null)
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              viewLevel === "container"
                ? "bg-indigo-600 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            2. Containers (Сервисы)
          </button>
          <button
            onClick={() => {
              setViewLevel("component")
              setSelectedNodeId(null)
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              viewLevel === "component"
                ? "bg-indigo-600 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            3. Components
          </button>
        </div>
      </div>

      {/* 2. Toolbar & Legend */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        {/* Search by node title or ID */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Подсветить узел на карте..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
          />
        </div>

        {/* Legend & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Legend Items */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              В актуале
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              Дрейф (аномалия)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-rose-500" />
              Запрещенная связь
            </span>
          </div>

          {/* Fullscreen Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-9 px-3 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5 mr-1.5" />
                Свернуть
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                Во весь экран
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 3. Main Interactive Diagram Canvas */}
      <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/90 overflow-hidden relative shadow-inner">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm space-y-3">
            <Skeleton className="h-10 w-10 rounded-full bg-zinc-800 animate-spin" />
            <p className="text-xs text-zinc-400">Загрузка архитектурной модели C4...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90">
            <AlertTriangle className="h-10 w-10 text-rose-500 mb-2" />
            <h3 className="text-base font-semibold text-zinc-100">Не удалось загрузить схему</h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
              Убедитесь, что сервер BFF работает и возвращает данные по роуту /api/diagrams/c4.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Повторить попытку
            </Button>
          </div>
        )}

        {/* Interactive ReactFlow View */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesConnectable={false}
          onlyRenderVisibleElements={false}
          elevateNodesOnSelect={false}
          elevateEdgesOnSelect={false}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
          proOptions={{ hideAttribution: true }}
          className="bg-zinc-950"
        >
          {/* Subtle dark grid background with optimized dot density */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="#27272a"
          />

          {/* Navigation controls (Zoom + Pan) */}
          <Controls
            position="bottom-left"
            className="!bg-zinc-900 !border-zinc-800 !rounded-lg !shadow-lg [&>button]:!border-zinc-800 [&>button]:!text-zinc-300 [&>button]:hover:!bg-zinc-800"
            showInteractive={false}
          />

          {/* MiniMap in bottom right with static color mapping */}
          <MiniMap
            position="bottom-right"
            className="!bg-zinc-900/95 !border-zinc-800 !rounded-lg shadow-lg hidden md:block"
            nodeColor={miniMapNodeColor}
            maskColor="rgba(9, 9, 11, 0.75)"
          />
        </ReactFlow>

        {/* View Hint Footer - centered at the bottom to avoid overlapping Controls (bottom-left) and MiniMap (bottom-right) */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] text-zinc-400 bg-zinc-900/95 px-3 py-1 rounded-md border border-zinc-800 shadow-lg hidden sm:block whitespace-nowrap z-10 select-none">
          Кликните по узлу сервиса, чтобы открыть панель паспорта и связей. Перетаскивание — панорамирование, колесо мыши — зум.
        </div>
      </div>

      {/* 4. Slide-out Service Details Sheet */}
      <ServiceDetailsSheet
        node={selectedNodeObject}
        edges={activeEdgesData}
        allNodes={activeNodesData}
        open={isSheetOpen && Boolean(selectedNodeObject)}
        onClose={() => {
          setIsSheetOpen(false)
          setSelectedNodeId(null)
        }}
      />
    </div>
  )
}
