import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { ServicesPage } from "@/pages/ServicePage"
import { ServicePassportPage } from "@/pages/ServicePassportPage"
import { InboxPage } from "@/pages/InboxPage"
import { ArchitecturePage } from "@/pages/ArchitecturePage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/services" replace />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServicePassportPage />} />
          <Route path="/findings" element={<InboxPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App