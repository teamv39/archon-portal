
//DesignTokens — единый мастер-класс токенов интерфейса Archon Portal.
//Содержит все визуальные параметры, размеры, типографику, сетки, стили карточек
//и цветовые схемы состояний (Single Source of Truth).
//Изменение значений в этом классе централизованно обновляет внешний вид компонентов.

export class DesignTokens {

  // Общие параметры типографики (по дизайн-спецификации: Inter 13-14px, JetBrains Mono для кода/ID)
  static readonly typography = {
    fontSans: "font-sans",
    fontMono: "font-mono",
    textHero: "text-3xl font-mono font-bold tracking-tight text-zinc-100",
    textTitle: "text-2xl font-bold tracking-tight text-zinc-100",
    textSection: "text-base font-semibold text-zinc-100",
    textBody: "text-sm text-zinc-300 leading-relaxed",
    textTag: "text-[13px] font-mono",
    textCaption: "text-xs text-zinc-400",
    textMuted: "text-xs text-zinc-500",
  } as const

  // Базовая разметка страницы и отступы
  static readonly layout = {
    container: "space-y-6 w-full",
    sectionGap: "space-y-6",
    itemGap: "space-y-3",
    cardGap: "gap-4",
    pagePadding: "p-6",
    breadcrumbs: "flex items-center gap-2 text-sm text-zinc-400",
    breadcrumbLink: "flex items-center gap-1.5 hover:text-zinc-100 transition-colors",
    breadcrumbCurrent: "font-mono text-zinc-100",
    breadcrumbIcon: "h-4 w-4",
    breadcrumbChevron: "h-3.5 w-3.5 text-zinc-600",
  } as const

  // Главная карточка сервиса (Hero Card)
  static readonly hero = {
    card: "rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm",
    contentCol: "space-y-3",
    title: "text-3xl font-mono font-bold tracking-tight text-zinc-100",
    badgesRow: "flex items-center gap-2.5 flex-wrap",
    actionsRow: "flex items-center gap-2.5 shrink-0",
    actionButton: "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200",
    actionIcon: "h-3.5 w-3.5 ml-1.5",
    actionIconLeft: "h-3.5 w-3.5 mr-1.5 text-zinc-400",
  } as const

  // Сетка и карточки ключевых метрик
  static readonly metrics = {
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
    card: "rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between",
    label: "text-xs font-medium text-zinc-400",
    value: "my-2 text-2xl font-bold tracking-tight text-zinc-100",
    valueMono: "my-2 text-2xl font-mono font-bold tracking-tight text-zinc-100",
    subtext: "text-xs text-zinc-500",
  } as const

  // Карточка описания сервиса и внутренний алерт дрейфа
  static readonly description = {
    card: "rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4",
    headerCol: "space-y-0.5",
    title: "text-base font-semibold text-zinc-100",
    subtitle: "text-xs text-zinc-400",
    body: "text-sm text-zinc-300 leading-relaxed",
    alertBox: "rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 flex items-start gap-3",
    alertIcon: "h-5 w-5 mt-0.5 shrink-0 text-rose-500",
    alertTitle: "text-sm font-semibold text-rose-400",
    alertText: "text-xs text-zinc-400 mt-1",
  } as const

  // Секция активных расхождений (находок)
  static readonly findings = {
    container: "space-y-3",
    headerRow: "flex items-center justify-between",
    headerTitle: "text-xs font-semibold uppercase tracking-wider text-zinc-400",
    headerLink: "text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors",
    list: "space-y-2",
    row: "rounded-lg border border-zinc-800 bg-zinc-900/70 p-3.5 flex items-center justify-between gap-4 hover:border-zinc-700 hover:bg-zinc-800/40 cursor-pointer transition-colors",
    leftCol: "flex items-center gap-3 min-w-0",
    id: "font-mono text-xs text-zinc-400 shrink-0",
    title: "text-sm text-zinc-200 truncate",
    timeAgo: "text-xs text-zinc-500 shrink-0",
    arrowIcon: "h-3.5 w-3.5",
  } as const

  // Бейджи критичности, статусов и тегов
  static readonly badges = {
    drift: "bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center gap-1.5 px-2.5 py-0.5 font-medium",
    sync: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 px-2.5 py-0.5 font-medium",
    tier: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-medium",
    teamTag: "px-2.5 py-0.5 rounded-md text-xs font-mono bg-zinc-800 text-zinc-300",
    stackTag: "px-2 py-0.5 text-xs text-zinc-400 font-mono",
    dot: "h-1.5 w-1.5 rounded-full shrink-0",
    dotDrift: "h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0",
    dotSync: "h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0",
    dotCurrent: "h-1.5 w-1.5 rounded-full bg-current shrink-0",

    severity: {
      CRITICAL: "bg-rose-500/10 text-rose-500 border-rose-500/30 font-medium",
      HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/30 font-medium",
      MEDIUM: "bg-amber-500/10 text-amber-500 border-amber-500/30 font-medium",
      LOW: "bg-blue-500/10 text-blue-400 border-blue-500/30 font-medium",
    },
  } as const

  // Табы и переключатели страниц
  static readonly tabs = {
    container: "space-y-6",
    list: "bg-zinc-900/80 border border-zinc-800 p-1 rounded-lg",
    trigger: "data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400",
    content: "space-y-6 mt-0",
  } as const

  // Стили таблиц (зависимости, контракты, каталог)
  static readonly table = {
    container: "rounded-md border border-zinc-800 overflow-hidden",
    header: "bg-zinc-900",
    headerRow: "border-zinc-800",
    headerCell: "text-zinc-400",
    row: "border-zinc-800 hover:bg-zinc-800/40",
    cellText: "text-sm text-zinc-300",
    cellMono: "font-mono font-medium text-zinc-100",
  } as const
}
