import type { ErrorResponse } from '../types/calculator'

export class ApiError extends Error {
  // 0 means the request never reached the server.
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Unable to reach the server', 0)
  }

  const data = await readJson(response)

  if (!response.ok) {
    const message = isErrorResponse(data)
      ? data.error
      : `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }
  if (data === undefined) {
    throw new ApiError('Invalid response from server', response.status)
  }
  return data as TResponse
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return undefined
  }
}

function isErrorResponse(data: unknown): data is ErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as Record<string, unknown>).error === 'string'
  )
}
