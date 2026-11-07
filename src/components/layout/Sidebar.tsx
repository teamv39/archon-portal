import { NavLink } from "react-router-dom"
import { Layers, Inbox, Network } from "lucide-react"
import { useFindings } from "@/hooks/useFindings"

const navItems = [
    { to: "/services", label: "Каталог сервисов", icon: Layers },
    { to: "/findings", label: "Инбокс находок", icon: Inbox },
    { to: "/architecture", label: "Архитектурная карта", icon: Network },
]

export function Sidebar() {
    const { data: findings = [] } = useFindings()
    const newFindingsCount = findings.filter((f) => f.status === "NEW").length

    return (
        <aside className="w-64 border-r border-border bg-card flex flex-col h-screen">
            <div className="h-14 px-4 border-b border-border flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-primary" />
                <span className="font-bold text-lg tracking-tight">Archon Portal</span>
            </div>
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            }`
                        }
                    >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.label}</span>
                        {item.to === "/findings" && newFindingsCount > 0 && (
                            <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                {newFindingsCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}
