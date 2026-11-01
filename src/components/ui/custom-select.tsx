import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  badge?: React.ReactNode
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  labelPrefix?: string
  className?: string
  align?: "start" | "end" | "center"
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  labelPrefix,
  className,
  align = "start",
}: CustomSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value)
  const isCustomValue = value !== "all" && Boolean(value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group h-10 px-3.5 text-xs rounded-md border flex items-center justify-between gap-2.5 transition-all outline-none cursor-pointer",
            isCustomValue
              ? "bg-indigo-500/10 border-indigo-500/60 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/40"
              : "bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-indigo-500/50 hover:bg-zinc-850",
            "focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500",
            className
          )}
        >
          <span className="truncate flex items-center gap-1.5">
            {labelPrefix ? <span className="text-zinc-400">{labelPrefix}:</span> : null}
            <span className={isCustomValue ? "font-semibold text-indigo-200" : ""}>
              {selectedOption ? selectedOption.label : placeholder || "Выберите..."}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="min-w-[190px] bg-zinc-900 border-zinc-800 text-zinc-200 shadow-xl rounded-lg p-1.5 z-50"
      >
        {options.map((opt) => {
          const isSelected = opt.value === value
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center justify-between text-xs px-2.5 py-2 rounded-md cursor-pointer transition-colors outline-none",
                isSelected
                  ? "bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30"
                  : "hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span>{opt.label}</span>
                {opt.badge}
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0 ml-2" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
