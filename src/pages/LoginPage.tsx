import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export function LoginPage() {
  const { user, login, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Исходный маршрут для возврата после логина
  const fromLocation = (location.state as { from?: Location })?.from
  const returnPath = fromLocation?.pathname ? `${fromLocation.pathname}${fromLocation.search || ""}` : "/services"

  // Если уже авторизован — редирект на целевой экран
  React.useEffect(() => {
    if (!isAuthLoading && user) {
      navigate(returnPath, { replace: true })
    }
  }, [user, isAuthLoading, navigate, returnPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setHasError(true)
      setErrorMessage("Неверный email или пароль")
      return
    }

    setIsSubmitting(true)
    setHasError(false)
    setErrorMessage(null)

    try {
      await login({ username: username.trim(), password })
      navigate(returnPath, { replace: true })
    } catch {
      // Согласно макету Error.svg выводим единый текст ошибки
      setHasError(true)
      setErrorMessage("Неверный email или пароль")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoCredentials = () => {
    setUsername("admin")
    setPassword("password123")
    setHasError(false)
    setErrorMessage(null)
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      {/* Центрированная карточка авторизации точно по макетам screens/Login */}
      <div className="w-full max-w-[400px] bg-[#18181B] border border-[#27272A] rounded-xl p-8 shadow-2xl relative">
        {/* Логотип Archon: белый прямоугольник со скруглением и буквой 'A' */}
        <div className="w-10 h-10 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-zinc-950 font-bold text-lg mb-6 shadow-sm select-none">
          A
        </div>

        {/* Заголовок и подзаголовок */}
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          Вход в Archon
        </h1>
        <p className="text-xs text-zinc-400 mt-1 mb-6">
          Войдите, чтобы продолжить
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поле Email */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (hasError) {
                  setHasError(false)
                  setErrorMessage(null)
                }
              }}
              placeholder="name@company.com"
              autoComplete="username"
              className="w-full h-9 px-3 rounded-[6px] bg-[#09090B] text-xs text-zinc-100 placeholder:text-zinc-600 border border-[#27272A] focus:border-zinc-500 transition-colors outline-none"
            />
          </div>

          {/* Поле Пароль */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (hasError) {
                  setHasError(false)
                  setErrorMessage(null)
                }
              }}
              placeholder="Введите пароль"
              autoComplete="current-password"
              className={`w-full h-9 px-3 rounded-[6px] bg-[#09090B] text-xs text-zinc-100 placeholder:text-zinc-600 border transition-colors outline-none ${
                hasError
                  ? "border-[#F43F5E] focus:border-[#F43F5E]"
                  : "border-[#27272A] focus:border-zinc-500"
              }`}
            />

            {/* Ошибка под инпутом пароля в точности как на макете Error.svg */}
            {hasError && errorMessage && (
              <p className="text-xs text-[#F43F5E] mt-1.5 font-normal animate-in fade-in duration-150">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Ссылка "Забыли пароль?" */}
          <div>
            <button
              type="button"
              onClick={() => alert("Для восстановления пароля обратитесь к администратору (mock).")}
              className="text-xs text-[#6366F1] hover:underline transition-colors block text-left"
            >
              Забыли пароль?
            </button>
          </div>

          {/* Кнопка "Войти" — компактная, выровнена по левому краю по макету */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-8 bg-[#F4F4F5] hover:bg-white text-zinc-950 font-medium text-xs rounded-[6px] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  <span>Вход...</span>
                </>
              ) : (
                <span>Войти</span>
              )}
            </button>
          </div>
        </form>

        {/* Быстрое демо-заполнение (admin / password123) */}
        <div className="mt-6 pt-3 border-t border-[#27272A]/40 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div>
            Демо: <span className="text-zinc-300">admin</span> / <span className="text-zinc-300">password123</span>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-indigo-400 hover:text-indigo-300 hover:underline font-sans"
          >
            Вставить
          </button>
        </div>

        {/* Кнопка входа через GitHub (ARCH-59) */}
        <div className="mt-4">
          <button
            type="button"
            disabled
            title="Интеграция с GitHub OAuth будет доступна в задаче ARCH-59"
            className="w-full h-9 border border-[#27272A] bg-zinc-900/40 rounded-md text-xs text-zinc-400 font-medium flex items-center justify-center gap-2 hover:bg-zinc-800/40 transition-colors opacity-70 cursor-not-allowed"
          >
            <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Войти через GitHub</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 ml-1">Скоро</span>
          </button>
        </div>
      </div>
    </div>
  )
}
