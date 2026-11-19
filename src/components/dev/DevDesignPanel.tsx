import * as React from "react"
import { useLocation } from "react-router-dom"
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Monitor,
  Type,
  Box,
  Network,
  Check,
  FileText,
  Table,
  Inbox,
  Globe,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const STORAGE_KEY = "archon_dev_design_tokens_v2"

type ActiveTab = "global" | "passport" | "catalog" | "inbox" | "c4"

interface DevTokenSettings {
  // Global
  layoutWidth: string
  fontSize: string
  radius: string
  borderContrast: string

  // Passport
  passportHeroPadding: string
  passportMetricPadding: string
  passportMetricValueSize: string
  passportFindingPadding: string

  // Catalog
  catalogRowPadding: string
  catalogTextSize: string

  // Inbox
  inboxCodeSize: string
  inboxCardPadding: string

  // C4 Map
  c4NodeWidth: string
  c4NodeRadius: string
  c4DriftGlow: "none" | "normal" | "bright"
}

const DEFAULT_SETTINGS: DevTokenSettings = {
  // Global
  layoutWidth: "100%",
  fontSize: "14px",
  radius: "0.75rem",
  borderContrast: "#27272a",

  // Passport
  passportHeroPadding: "1.5rem",
  passportMetricPadding: "1rem",
  passportMetricValueSize: "1.5rem",
  passportFindingPadding: "0.875rem",

  // Catalog
  catalogRowPadding: "0.5rem",
  catalogTextSize: "13px",

  // Inbox
  inboxCodeSize: "12px",
  inboxCardPadding: "0.875rem",

  // C4 Map
  c4NodeWidth: "240px",
  c4NodeRadius: "0.75rem",
  c4DriftGlow: "normal",
}

export function DevDesignPanel() {
  const [isOpen, setIsOpen] = React.useState(false)
  const location = useLocation()

  // Определяем рекомендуемую вкладку по текущему маршруту
  const currentScreenTab = React.useMemo((): ActiveTab => {
    const path = location.pathname
    if (path.startsWith("/services/")) return "passport"
    if (path === "/services") return "catalog"
    if (path === "/findings") return "inbox"
    if (path === "/architecture") return "c4"
    return "global"
  }, [location.pathname])

  const [activeTab, setActiveTab] = React.useState<ActiveTab>("global")

  const [settings, setSettings] = React.useState<DevTokenSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  // Применяем все параметры к DOM через CSS-переменные
  React.useEffect(() => {
    const root = document.documentElement

    // 1. Global
    root.style.setProperty("--dev-layout-width", settings.layoutWidth)
    root.style.fontSize = settings.fontSize
    root.style.setProperty("--radius", settings.radius)
    root.style.setProperty("--dev-border-color", settings.borderContrast)

    // 2. Passport
    root.style.setProperty("--passport-hero-padding", settings.passportHeroPadding)
    root.style.setProperty("--passport-metric-padding", settings.passportMetricPadding)
    root.style.setProperty("--passport-metric-value-size", settings.passportMetricValueSize)
    root.style.setProperty("--passport-finding-padding", settings.passportFindingPadding)

    // 3. Catalog
    root.style.setProperty("--catalog-row-padding", settings.catalogRowPadding)
    root.style.setProperty("--catalog-text-size", settings.catalogTextSize)

    // 4. Inbox
    root.style.setProperty("--inbox-code-size", settings.inboxCodeSize)
    root.style.setProperty("--inbox-card-padding", settings.inboxCardPadding)

    // 5. C4 Map
    root.style.setProperty("--c4-node-width", settings.c4NodeWidth)
    root.style.setProperty("--c4-node-radius", settings.c4NodeRadius)

    const glowMap = {
      none: "none",
      normal: "0 0 16px rgba(244,63,94,0.25)",
      bright: "0 0 24px rgba(244,63,94,0.5), 0 0 8px rgba(244,63,94,0.8)",
    }
    root.style.setProperty("--c4-drift-glow", glowMap[settings.c4DriftGlow])

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings])

  const updateSetting = <K extends keyof DevTokenSettings>(key: K, value: DevTokenSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem(STORAGE_KEY)
  }

  const getPageTitle = () => {
    switch (currentScreenTab) {
      case "passport":
        return "Паспорт сервиса"
      case "catalog":
        return "Каталог сервисов"
      case "inbox":
        return "Инбокс находок"
      case "c4":
        return "Архитектурная карта"
      default:
        return "Главная"
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Кнопка открытия панели */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full shadow-2xl border border-zinc-700 bg-zinc-900/95 hover:bg-zinc-800 text-zinc-100 flex items-center gap-2 px-4 py-2.5 backdrop-blur transition-all hover:scale-105 active:scale-95"
        >
          <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold">Токены UI</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </Button>
      )}

      {/* Панель управления */}
      {isOpen && (
        <div className="w-[390px] rounded-2xl border border-zinc-800 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-md space-y-4 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              <span className="font-semibold text-sm">Управление токенами UI</span>
              <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-mono">
                Dev Panel
              </Badge>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-100 p-1 rounded-md hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Вкладки: Общие vs Страницы */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950/80 rounded-lg border border-zinc-800 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab("global")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                activeTab === "global"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Globe className="h-3.5 w-3.5 text-indigo-400" />
              Общие
            </button>

            <button
              onClick={() => setActiveTab("passport")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                activeTab === "passport"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              Паспорт
            </button>

            <button
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                activeTab === "catalog"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Table className="h-3.5 w-3.5 text-sky-400" />
              Каталог
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                activeTab === "inbox"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Inbox className="h-3.5 w-3.5 text-violet-400" />
              Инбокс
            </button>

            <button
              onClick={() => setActiveTab("c4")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                activeTab === "c4"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Network className="h-3.5 w-3.5 text-emerald-400" />
              Карта C4
            </button>
          </div>

          {/* Содержимое вкладок */}
          <div className="space-y-3.5 text-xs min-h-[220px]">
            {/* ================= 1. ОБЩИЕ ПАРАМЕТРЫ ================= */}
            {activeTab === "global" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Monitor className="h-3.5 w-3.5 text-zinc-500" />
                      Ширина рабочей области
                    </span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.layoutWidth}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "100%", value: "100%" },
                      { label: "1600px", value: "1600px" },
                      { label: "1440px", value: "1440px" },
                      { label: "1280px", value: "1280px" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("layoutWidth", opt.value)}
                        className={`py-1.5 px-2 rounded-md font-mono text-[11px] border transition-colors ${
                          settings.layoutWidth === opt.value
                            ? "bg-indigo-600 border-indigo-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Type className="h-3.5 w-3.5 text-zinc-500" />
                      Базовый кегль (все экраны)
                    </span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.fontSize}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "13px (Компакт)", value: "13px" },
                      { label: "14px (Спека)", value: "14px" },
                      { label: "15px (Крупный)", value: "15px" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("fontSize", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.fontSize === opt.value
                            ? "bg-indigo-600 border-indigo-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Box className="h-3.5 w-3.5 text-zinc-500" />
                      Базовое скругление углов
                    </span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.radius}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "8px (md)", value: "0.5rem" },
                      { label: "12px (xl)", value: "0.75rem" },
                      { label: "16px (2xl)", value: "1rem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("radius", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.radius === opt.value
                            ? "bg-indigo-600 border-indigo-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
                      Контраст границ блоков
                    </span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.borderContrast}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Мягкий", value: "#1e1e24" },
                      { label: "Стандарт", value: "#27272a" },
                      { label: "Четкий", value: "#3f3f46" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("borderContrast", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.borderContrast === opt.value
                            ? "bg-indigo-600 border-indigo-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 2. ПАСПОРТ СЕРВИСА ================= */}
            {activeTab === "passport" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Отступы Hero-карточки</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.passportHeroPadding}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "16px (p-4)", value: "1rem" },
                      { label: "24px (p-6)", value: "1.5rem" },
                      { label: "32px (p-8)", value: "2rem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("passportHeroPadding", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.passportHeroPadding === opt.value
                            ? "bg-amber-600 border-amber-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Плотность 4 карточек метрик</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.passportMetricPadding}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "12px (p-3)", value: "0.75rem" },
                      { label: "16px (p-4)", value: "1rem" },
                      { label: "24px (p-6)", value: "1.5rem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("passportMetricPadding", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.passportMetricPadding === opt.value
                            ? "bg-amber-600 border-amber-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Размер цифр метрик</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.passportMetricValueSize}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "20px (sm)", value: "1.25rem" },
                      { label: "24px (md)", value: "1.5rem" },
                      { label: "28px (lg)", value: "1.75rem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("passportMetricValueSize", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.passportMetricValueSize === opt.value
                            ? "bg-amber-600 border-amber-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Плотность строк находок</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.passportFindingPadding}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "10px", value: "0.625rem" },
                      { label: "14px (Стандарт)", value: "0.875rem" },
                      { label: "18px", value: "1.125rem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("passportFindingPadding", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.passportFindingPadding === opt.value
                            ? "bg-amber-600 border-amber-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 3. КАТАЛОГ СЕРВИСОВ ================= */}
            {activeTab === "catalog" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Высота строк таблицы</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.catalogRowPadding}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "38px (Компакт)", value: "0.35rem" },
                      { label: "46px (Стандарт)", value: "0.5rem" },
                      { label: "54px (Свободно)", value: "0.75rem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("catalogRowPadding", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.catalogRowPadding === opt.value
                            ? "bg-sky-600 border-sky-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Размер шрифта ячеек</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.catalogTextSize}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "12px", value: "12px" },
                      { label: "13px (Стандарт)", value: "13px" },
                      { label: "14px", value: "14px" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("catalogTextSize", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.catalogTextSize === opt.value
                            ? "bg-sky-600 border-sky-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. ИНБОКС НАХОДОК ================= */}
            {activeTab === "inbox" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Кегль сниппетов AST кода</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.inboxCodeSize}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "11px (Плотный)", value: "11px" },
                      { label: "12px (Стандарт)", value: "12px" },
                      { label: "13px (Крупный)", value: "13px" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("inboxCodeSize", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] font-mono border transition-colors ${
                          settings.inboxCodeSize === opt.value
                            ? "bg-violet-600 border-violet-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Отступы карточек находок</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.inboxCardPadding}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "10px", value: "0.625rem" },
                      { label: "14px (Стандарт)", value: "0.875rem" },
                      { label: "18px", value: "1.125rem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("inboxCardPadding", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.inboxCardPadding === opt.value
                            ? "bg-violet-600 border-violet-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 5. КАРТА C4 ================= */}
            {activeTab === "c4" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Ширина узлов графа</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.c4NodeWidth}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "210px", value: "210px" },
                      { label: "240px", value: "240px" },
                      { label: "270px", value: "270px" },
                      { label: "300px", value: "300px" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("c4NodeWidth", opt.value)}
                        className={`py-1.5 px-1.5 rounded-md text-[11px] font-mono border transition-colors ${
                          settings.c4NodeWidth === opt.value
                            ? "bg-emerald-600 border-emerald-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Скругление узлов</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.c4NodeRadius}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "8px (md)", value: "0.5rem" },
                      { label: "12px (xl)", value: "0.75rem" },
                      { label: "16px (2xl)", value: "1rem" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("c4NodeRadius", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.c4NodeRadius === opt.value
                            ? "bg-emerald-600 border-emerald-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Неоновое свечение дрейфа</span>
                    <span className="font-mono text-[11px] text-zinc-300">{settings.c4DriftGlow}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Выкл", value: "none" as const },
                      { label: "Стандарт", value: "normal" as const },
                      { label: "Яркое", value: "bright" as const },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateSetting("c4DriftGlow", opt.value)}
                        className={`py-1.5 px-2 rounded-md text-[11px] border transition-colors ${
                          settings.c4DriftGlow === opt.value
                            ? "bg-rose-600 border-rose-500 text-white font-semibold"
                            : "bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer: Сброс и статус */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Сбросить к дефолту
            </button>
            <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
              <span className="text-zinc-400 font-medium">Экран:</span>
              <span className="text-zinc-300">{getPageTitle()}</span>
              <Check className="h-3 w-3 text-emerald-400 ml-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
