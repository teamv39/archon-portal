export interface ProblemDetails {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
}

export class CoreServiceError extends Error {
  public readonly status: number
  public readonly detail: string
  public readonly title: string

  constructor(status: number, detail: string, title = 'Core Service Error') {
    super(detail)
    this.name = 'CoreServiceError'
    this.status = status
    this.detail = detail
    this.title = title
  }
}