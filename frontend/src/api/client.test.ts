import { afterEach, describe, expect, it, vi } from 'vitest'
import { postJson } from './client'

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

vi.stubGlobal('fetch', fetchMock)

afterEach(() => {
  fetchMock.mockReset()
})

describe('postJson', () => {
  it('sends the body as JSON and returns the parsed response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ result: 5 }, 200))

    const data = await postJson('/api/v1/calculate', { operation: 'add', a: 2, b: 3 })

    expect(data).toEqual({ result: 5 })
    const [path, init] = fetchMock.mock.calls[0]
    expect(path).toBe('/api/v1/calculate')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"operation":"add","a":2,"b":3}')
  })

  it('uses the backend error message for error responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: 'division by zero' }, 400))

    await expect(postJson('/api/v1/calculate', {})).rejects.toMatchObject({
      name: 'ApiError',
      message: 'division by zero',
      status: 400,
    })
  })

  it('reports a network failure with status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(postJson('/api/v1/calculate', {})).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Unable to reach the server',
      status: 0,
    })
  })

  it('falls back to the status code when an error response is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('Internal Server Error', { status: 500 }))

    await expect(postJson('/api/v1/calculate', {})).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Request failed with status 500',
      status: 500,
    })
  })
})
