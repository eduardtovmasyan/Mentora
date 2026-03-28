export abstract class BaseApiClient {
  protected baseUrl: string

  protected constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  protected async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)
    if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.status}`)
    return await response.json() as Promise<T>
  }

  protected async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`POST ${endpoint} failed: ${response.status}`)
    return await response.json() as Promise<T>
  }

  protected async patch<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`PATCH ${endpoint} failed: ${response.status}`)
    return await response.json() as Promise<T>
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed: ${response.status}`)
    return await response.json() as Promise<T>
  }
}
