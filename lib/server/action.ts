import 'server-only'
import { z } from 'zod'
import type { Permission } from '@/lib/rbac/catalog'
import { AuthorizationError, requirePermission, type CurrentUser } from './session'

export type ActionResult<T = undefined> = { ok: true; data: T; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

export class UserFacingError extends Error {}

/**
 * Wraps a server action with: session + permission check, Zod input
 * validation, and consistent error shaping. Business logic stays in services.
 */
export function protectedAction<S extends z.ZodType, T>(
  permission: Permission | null,
  schema: S,
  handler: (input: z.infer<S>, current: CurrentUser) => Promise<T>,
) {
  return async (raw: z.input<S>): Promise<ActionResult<T>> => {
    try {
      const current = await requirePermission(permission ?? undefined)
      const parsed = schema.safeParse(raw)
      if (!parsed.success) {
        const flat = z.flattenError(parsed.error)
        return {
          ok: false,
          error: flat.formErrors[0] ?? 'Please correct the highlighted fields.',
          fieldErrors: flat.fieldErrors as Record<string, string[]>,
        }
      }
      const data = await handler(parsed.data, current)
      return { ok: true, data }
    } catch (error) {
      if (error instanceof AuthorizationError || error instanceof UserFacingError) {
        return { ok: false, error: error.message }
      }
      console.error('[action] unexpected error', (error as Error).message)
      return { ok: false, error: 'Something went wrong. Please try again.' }
    }
  }
}
