export const OPERATIONS = ['add', 'subtract', 'multiply', 'divide'] as const

export type Operation = (typeof OPERATIONS)[number]

export interface CalculateRequest {
  operation: Operation
  a: number
  b: number
}

export interface CalculateResponse {
  result: number
}

export interface ErrorResponse {
  error: string
}
