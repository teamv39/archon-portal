import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"

interface RiskAcceptanceDialogProps {
  open: boolean
  findingId: string
  findingTitle: string
  onClose: () => void
  onConfirm: (duration: string, reason: string) => void
  isSubmitting?: boolean
}

const DURATION_OPTIONS = [
  { value: "1 месяц", label: "1 месяц" },
  { value: "3 месяца", label: "3 месяца (квартал)" },
  { value: "6 месяцев", label: "6 месяцев (полугодие)" },
  { value: "1 год", label: "1 год" },
  { value: "До мажорного релиза", label: "До следующего мажорного релиза" },
]

export function RiskAcceptanceDialog({
  open,
  findingId,
  findingTitle,
  onClose,
  onConfirm,
  isSubmitting = false,
}: RiskAcceptanceDialogProps) {
  const [duration, setDuration] = React.useState("3 месяца")
  const [reason, setReason] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return
    onConfirm(duration, reason.trim())
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-zinc-100">
            Принятие архитектурного риска
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            {findingId}: {findingTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">
              Срок действия исключения
            </label>
            <CustomSelect
              value={duration}
              onChange={setDuration}
              options={DURATION_OPTIONS}
              className="w-full bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">
              Обоснование / План устранения (причина) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Например: Запланирован рефакторинг в спринте 44, согласовано с техлидом до миграции на Kafka..."
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !reason.trim()}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isSubmitting ? "Сохранение..." : "Подтвердить принятие риска"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
