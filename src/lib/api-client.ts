export interface ProblemDetails {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
}

export class ApiError extends Error {
  public readonly status: number
  public readonly problem: ProblemDetails

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title)
    this.name = 'ApiError'
    this.status = problem.status
    this.problem = problem
  }
}

export type ApiFetchOptions = RequestInit & {
  skipUnauthorizedNotify?: boolean
}

type UnauthorizedHandler = () => void
const unauthorizedListeners = new Set<UnauthorizedHandler>()

export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedListeners.add(handler)
  return () => {
    unauthorizedListeners.delete(handler)
  }
}

export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((handler) => {
    try {
      handler()
    } catch {
      // ignore handler errors
    }
  })
}

const STATUS_MESSAGES: Record<number, { title: string; description: string }> = {
  400: { title: 'Некорректный запрос', description: 'Сервер не смог обработать переданные параметры.' },
  401: { title: 'Требуется авторизация', description: 'Срок действия сессии истек или вы не авторизованы.' },
  403: { title: 'Доступ ограничен', description: 'У вас нет прав для доступа к запрашиваемому ресурсу.' },
  404: { title: 'Ресурс не найден', description: 'Запрашиваемый сервис или страница не существует.' },
  429: { title: 'Слишком много запросов', description: 'Превышен лимит обращений. Повторите попытку позже.' },
  500: { title: 'Внутренняя ошибка сервера', description: 'На сервере произошел сбой при обработке данных.' },
  502: { title: 'Сервис недоступен', description: 'BFF или ядро платформы временно не отвечают.' },
  503: { title: 'Сервис перегружен', description: 'Сервер временно не может обработать запрос.' },
  504: { title: 'Время ожидания истекло', description: 'Ответ от сервиса ядра не был получен вовремя.' },
}

const LEAKY_PATTERNS = /(?:sql|database|table|column|syntax|nullpointer|at\s+\S+\s+\(|fastify|node_modules)/i

export function getSafeErrorMessage(error: unknown): {
  title: string
  description: string
  status?: number
  instance?: string
  type?: string
} {
  if (error instanceof ApiError) {
    const fallback = STATUS_MESSAGES[error.status] || {
      title: 'Ошибка запроса',
      description: 'Не удалось выполнить операцию.',
    }
    const isLeaky = error.problem.detail && LEAKY_PATTERNS.test(error.problem.detail)
    return {
      title: error.problem.title || fallback.title,
      description: isLeaky || !error.problem.detail ? fallback.description : error.problem.detail,
      status: error.status,
      instance: error.problem.instance,
      type: error.problem.type,
    }
  }

  return {
    title: 'Ошибка подключения',
    description: 'Не удалось связаться с сервером. Проверьте сеть или статус BFF.',
  }
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: ApiFetchOptions): Promise<T> {
  let response: Response
  try {
    response = await fetch(input, {
      credentials: 'include',
      ...init,
    })
  } catch {
    throw new ApiError({
      type: 'about:blank',
      title: 'Сетевая ошибка',
      status: 0,
      detail: 'Сетевой сбой при обращении к серверу.',
      instance: typeof input === 'string' ? input : undefined,
    })
  }

  if (!response.ok) {
    if (response.status === 401 && !init?.skipUnauthorizedNotify) {
      notifyUnauthorized()
    }

    let problem: ProblemDetails
    try {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('json')) {
        const body = await response.json()
        let detail = body.detail || ''
        if (!detail && typeof body.error === 'string') {
          detail = body.error
        }
        if (!detail && Array.isArray(body.errors) && body.errors.length > 0) {
          detail = body.errors[0]?.message || 'Некорректные параметры запроса'
        }
        if (!detail && typeof body.message === 'string') {
          detail = body.message
        }

        problem = {
          type: body.type || 'about:blank',
          title: body.title || response.statusText,
          status: body.status || response.status,
          detail,
          instance: body.instance || (typeof input === 'string' ? input : undefined),
        }
      } else {
        problem = {
          type: 'about:blank',
          title: response.statusText || 'HTTP Error',
          status: response.status,
          detail: '',
          instance: typeof input === 'string' ? input : undefined,
        }
      }
    } catch {
      problem = {
        type: 'about:blank',
        title: response.statusText || 'HTTP Error',
        status: response.status,
        detail: '',
        instance: typeof input === 'string' ? input : undefined,
      }
    }
    throw new ApiError(problem)
  }

  return (await response.json()) as T
}
