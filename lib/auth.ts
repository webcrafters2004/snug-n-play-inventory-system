import 'server-only'
import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { eq, sql } from 'drizzle-orm'
import { db, pool } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { recordAudit } from '@/lib/server/audit-core'

function requestMeta(headers?: Headers | null) {
  return {
    ipAddress: headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headers?.get('x-real-ip') ?? null,
    userAgent: headers?.get('user-agent') ?? null,
  }
}

export const auth = betterAuth({
  database: pool,
  appName: 'Snug N Play Inventory',
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
    modelName: 'rateLimit',
    window: 60,
    max: 100,
    customRules: {
      '/sign-in/email': { window: 60, max: 5 },
      '/change-password': { window: 60, max: 5 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-in/email') return
      const email = String((ctx.body as { email?: string } | undefined)?.email ?? '')
        .trim()
        .toLowerCase()
      if (!email) return
      const [found] = await db
        .select({ id: user.id, name: user.name, status: user.status, deletedAt: user.deletedAt })
        .from(user)
        .where(eq(sql`lower(${user.email})`, email))
        .limit(1)
      if (found && (found.status !== 'active' || found.deletedAt)) {
        await recordAudit({
          action: 'login_failed',
          module: 'auth',
          description: `Blocked sign-in for disabled account ${email}`,
          userId: found.id,
          userName: found.name,
          userEmail: email,
          metadata: { reason: 'account_disabled' },
          ...requestMeta(ctx.headers),
        })
        throw new APIError('FORBIDDEN', { message: 'This account is disabled. Contact your System Admin.' })
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-in/email') return
      const meta = requestMeta(ctx.headers)
      const newSession = ctx.context.newSession
      if (newSession?.user) {
        await db.update(user).set({ lastLoginAt: new Date() }).where(eq(user.id, newSession.user.id))
        await recordAudit({
          action: 'login',
          module: 'auth',
          description: `${newSession.user.name} signed in`,
          userId: newSession.user.id,
          userName: newSession.user.name,
          userEmail: newSession.user.email,
          ...meta,
        })
        return
      }
      if (ctx.context.returned instanceof APIError) {
        const email = String((ctx.body as { email?: string } | undefined)?.email ?? '').slice(0, 200)
        await recordAudit({
          action: 'login_failed',
          module: 'auth',
          description: `Failed sign-in attempt for ${email || 'unknown email'}`,
          userEmail: email || null,
          metadata: { status: ctx.context.returned.status },
          ...meta,
        })
      }
    }),
  },
  plugins: [nextCookies()],
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // Required by the cross-site v0 preview iframe. Without these
          // attributes, login succeeds but the next request appears signed out.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
