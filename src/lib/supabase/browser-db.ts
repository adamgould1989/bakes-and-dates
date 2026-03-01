/**
 * Browser-side DB helper — safe to import from client components.
 */
import { createClient } from './client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function browserDb(): any {
  return createClient()
}
