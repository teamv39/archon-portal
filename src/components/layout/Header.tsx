import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Header() {
    return (
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between">
            <div className="relative w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск по сервисам..."
                    className="pl-9 h-9 bg-background/50"
                />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Кирилл</span>
            </div>
        </header>
    )
}