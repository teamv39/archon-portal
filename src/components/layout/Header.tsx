import { useAuth } from "@/hooks/useAuth"
import { Search, LogOut, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
    const { user, logout } = useAuth()

    return (
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between">
            <div className="relative w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск по сервисам..."
                    className="pl-9 h-9 bg-background/50"
                />
            </div>
            <div className="flex items-center gap-4">
                {user && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="flex items-center gap-1.5 font-mono text-zinc-300">
                                <User className="w-3.5 h-3.5 text-zinc-500" />
                                <span className="font-semibold text-foreground">{user.username}</span>
                                <span className="text-[10px] text-zinc-500">({user.role})</span>
                            </div>
                        </div>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => logout()}
                            title="Выйти из системы"
                            className="h-8 px-2 text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                            <LogOut className="h-3.5 w-3.5 mr-1.5" />
                            <span>Выйти</span>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    )
}
