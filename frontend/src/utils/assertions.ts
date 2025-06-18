import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export function assertNotNull<T>(value: T): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error("Value mustn't be null or undefined")
  }
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error
}

export function isErrorMessage(error: unknown): error is { data: { message: string } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as any).data === 'object' &&
    (error as any).data !== null &&
    'message' in (error as any).data &&
    typeof (error as any).data.message === 'string'
  )
}

export function isErrorWithStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error && typeof (error as any).status === 'number'
}
