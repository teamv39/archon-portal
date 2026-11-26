import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppShell } from "@/components/layout/AppShell"
import { LoginPage } from "@/pages/LoginPage"
import { ServicesPage } from "@/pages/ServicePage"
import { ServicePassportPage } from "@/pages/ServicePassportPage"
import { InboxPage } from "@/pages/InboxPage"
import { ArchitecturePage } from "@/pages/ArchitecturePage"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Публичный экран входа */}
          <Route path="/login" element={<LoginPage />} />

          {/* Защищенные экраны платформы */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/services" replace />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServicePassportPage />} />
              <Route path="/findings" element={<InboxPage />} />
              <Route path="/architecture" element={<ArchitecturePage />} />
            </Route>
          </Route>

          {/* Fallback для неизвестных маршрутов */}
          <Route path="*" element={<Navigate to="/services" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
