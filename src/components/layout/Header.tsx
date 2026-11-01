import * as React from "react"
import { Search, LogIn } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
    const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null)
    const [isLoggingIn, setIsLoggingIn] = React.useState(false)

    const handleLogin = React.useCallback(async () => {
        setIsLoggingIn(true)
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: "admin", password: "password123" }),
            })
            if (res.ok) {
                setIsLoggedIn(true)
                window.location.reload()
            }
        } catch {
            // ignore
        } finally {
            setIsLoggingIn(false)
        }
    }, [])

    React.useEffect(() => {
        let mounted = true
        fetch("/api/auth/me")
            .then((res) => {
                if (!mounted) return
                if (res.ok) {
                    setIsLoggedIn(true)
                } else {
                    setIsLoggedIn(false)
                    handleLogin()
                }
            })
            .catch(() => {
                if (mounted) setIsLoggedIn(false)
            })

        return () => {
            mounted = false
        }
    }, [handleLogin])

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
                {isLoggedIn ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-medium text-foreground">Кирилл (admin)</span>
                    </div>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleLogin}
                        disabled={isLoggingIn}
                        className="h-8 text-xs border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10"
                    >
                        <LogIn className="h-3.5 w-3.5 mr-1.5" />
                        {isLoggingIn ? "Вход..." : "Войти как admin"}
                    </Button>
                )}
            </div>
        </header>
    )
}
