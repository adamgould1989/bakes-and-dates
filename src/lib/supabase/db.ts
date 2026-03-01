/**
 * Server-side DB helper — uses next/headers, only safe in Server Components and Server Actions.
 * Do NOT import this from client components.
 */
import { createClient } from './server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function db(): any {
  return createClient()
}
