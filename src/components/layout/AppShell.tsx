import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { DevDesignPanel } from "@/components/dev/DevDesignPanel"

export function AppShell() {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 flex flex-col">
                    <div
                        className="w-full flex-1 transition-[max-width] duration-200"
                        style={{ maxWidth: "var(--dev-layout-width, 100%)", margin: "0 auto" }}
                    >
                        <Outlet />
                    </div>
                </main>
            </div>
            <DevDesignPanel />
        </div>
    )
}