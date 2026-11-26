export interface ProblemDetails {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
}

const STATUS_TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
}
export class CoreServiceError extends Error {
  public readonly status: number
  public readonly detail: string
  public readonly title: string
  constructor(status: number, detail: string, title?: string) {
    super(detail)
    this.name = 'CoreServiceError'
    this.status = status
    this.detail = detail
    this.title = title ?? STATUS_TITLES[status] ?? 'HTTP Error'
  }
}