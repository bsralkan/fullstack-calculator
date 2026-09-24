import type { CalculateRequest, CalculateResponse, Operation } from '../types/calculator'
import { postJson } from './client'

export async function calculate(operation: Operation, a: number, b: number): Promise<number> {
  const request: CalculateRequest = { operation, a, b }
  const { result } = await postJson<CalculateResponse>('/api/v1/calculate', request)
  return result
}
