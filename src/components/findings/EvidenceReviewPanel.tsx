import type { Finding } from "@/types/findings"
import { FindingSeverityBadge } from "./FindingSeverityBadge"
import { FindingStatusBadge } from "./FindingStatusBadge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Code2,
  ShieldAlert,
  CheckCircle,
  AlertOctagon,
  ShieldCheck,
  Maximize2,
  Minimize2,
  X,
  Clock,
} from "lucide-react"

interface EvidenceReviewPanelProps {
  finding: Finding
  onClose?: () => void
  onConfirmDefect: (id: string) => void
  onAcceptRisk: (id: string) => void
  onFalsePositive: (id: string) => void
  isMutating?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function EvidenceReviewPanel({
  finding,
  onClose,
  onConfirmDefect,
  onAcceptRisk,
  onFalsePositive,
  isMutating = false,
  isFullscreen = false,
  onToggleFullscreen,
}: EvidenceReviewPanelProps) {
  const { evidence } = finding

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-md">
      {/* Panel Top Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-900/80 backdrop-blur">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              {finding.id}
            </span>
            <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {finding.serviceId}
            </span>
            <FindingSeverityBadge severity={finding.severity} />
            <FindingStatusBadge status={finding.status} />
          </div>
          <h2 className="text-base font-semibold text-zinc-100 leading-snug">
            {finding.title}
          </h2>
          <div className="flex items-center gap-3 text-xs text-zinc-400 pt-0.5">
            <span className="font-mono text-[11px] text-zinc-500">
              Категория: {finding.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-500" />
              {new Date(finding.createdAt).toLocaleString("ru-RU", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1 text-zinc-400">
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              onClick={onToggleFullscreen}
              title={isFullscreen ? "Свернуть" : "Развернуть на весь экран"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              onClick={onClose}
              title="Закрыть панель"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Review Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        {/* Risk Acceptance Notice if active */}
        {finding.status === "RISK_ACCEPTED" && (
          <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 space-y-1">
            <div className="flex items-center gap-2 font-medium text-xs">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Архитектурный риск согласован</span>
              {finding.riskAcceptedUntil && (
                <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[11px] font-mono">
                  Срок: {finding.riskAcceptedUntil}
                </span>
              )}
            </div>
            {finding.riskReason && (
              <p className="text-xs text-amber-200/90 pl-6">
                Обоснование: {finding.riskReason}
              </p>
            )}
          </div>
        )}

        {/* Evidence Comparison: Docs vs Code AST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <span>Доказательства расхождения (Evidence)</span>
            <span className="text-zinc-500 font-normal normal-case">
              Документация vs Код (AST)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Documentation Column */}
            <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-200">
                    Документация
                  </span>
                </div>
                {evidence.docFile && (
                  <div
                    title={evidence.docFile}
                    className="font-mono text-[11px] text-zinc-400 bg-zinc-800/90 px-2 py-0.5 rounded border border-zinc-700/80 truncate"
                  >
                    {evidence.docFile}
                  </div>
                )}
              </div>

              <div className="p-3.5 flex-1 text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap bg-zinc-950/40 border-l-2 border-indigo-500/50">
                {evidence.docQuote ? (
                  evidence.docQuote
                ) : (
                  <span className="text-zinc-500 italic">
                    Цитата из документации отсутствует
                  </span>
                )}
              </div>
            </div>

            {/* Code AST Column */}
            <div className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-950/60 overflow-hidden">
              <div className="px-3.5 py-2.5 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Code2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      Код (AST)
                    </span>
                  </div>
                  {evidence.codeLines && (
                    <span className="font-mono text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25 shrink-0 whitespace-nowrap">
                      {evidence.codeLines}
                    </span>
                  )}
                </div>
                {evidence.codeFile && (
                  <div
                    title={evidence.codeFile}
                    className="font-mono text-[11px] text-zinc-400 bg-zinc-800/90 px-2 py-0.5 rounded border border-zinc-700/80 truncate"
                  >
                    {evidence.codeFile}
                  </div>
                )}
              </div>

              <div className="p-3.5 flex-1 bg-zinc-950 overflow-x-auto border-l-2 border-emerald-500/50 font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre">
                {evidence.codeSnippet ? (
                  evidence.codeSnippet
                ) : (
                  <span className="text-zinc-500 italic font-sans">
                    Фрагмент кода отсутствует
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Analyzer Verdict */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>Заключение анализатора</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed pl-6">
            {evidence.verdict}
          </p>
        </div>
      </div>

      {/* Human-in-the-Loop Action Bar */}
      <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-zinc-400">
          Принятие решения (Human-in-the-Loop)
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isMutating || finding.status === "FALSE_POSITIVE"}
            onClick={() => onFalsePositive(finding.id)}
            className="h-8 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Ложная тревога
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={isMutating || finding.status === "RISK_ACCEPTED"}
            onClick={() => onAcceptRisk(finding.id)}
            className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
            Принять риск
          </Button>

          <Button
            size="sm"
            disabled={isMutating || finding.status === "CONFIRMED"}
            onClick={() => onConfirmDefect(finding.id)}
            className="h-8 text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-sm"
          >
            <AlertOctagon className="h-3.5 w-3.5 mr-1.5" />
            Подтвердить дефект
          </Button>
        </div>
      </div>
    </div>
  )
}
