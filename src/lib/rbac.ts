// =============================================================================
// Thiora RBAC Middleware — Role-Based Access Control for API routes
// Provides a simple requireRole() function that checks authenticated user roles
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, type AuthPayload } from './auth-middleware'

type Role = 'admin' | 'seller' | 'buyer' | 'both'

interface RbacResult {
  authorized: boolean
  auth: AuthPayload | null
  response?: NextResponse
}

/**
 * Create a role-checking middleware that validates the authenticated user has
 * one of the required roles.
 *
 * Usage:
 * ```ts
 * import { requireRole } from '@/lib/rbac'
 *
 * export async function GET(request: NextRequest) {
 *   const { authorized, auth, response } = await requireRole('admin')(request)
 *   if (!authorized) return response!
 *   // auth is guaranteed to be non-null here
 *   ...
 * }
 * ```
 *
 * @param roles - One or more roles that are allowed to access the resource
 * @returns A function that takes a request and returns an RbacResult
 */
export function requireRole(...roles: Role[]) {
  return async (request: NextRequest): Promise<RbacResult> => {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return {
        authorized: false,
        auth: null,
        response: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        ),
      }
    }

    // Check if the user's role is in the allowed list
    // 'both' role should match both 'seller' and 'buyer' checks
    const userRole = auth.role as Role
    const isAuthorized =
      roles.includes(userRole) ||
      (userRole === 'both' && (roles.includes('seller') || roles.includes('buyer'))) ||
      (userRole === 'admin' && roles.includes('admin'))

    if (!isAuthorized) {
      return {
        authorized: false,
        auth,
        response: NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        ),
      }
    }

    return { authorized: true, auth }
  }
}

/**
 * Convenience wrapper that combines RBAC check with a handler function.
 * If the user is not authorized, the error response is returned automatically.
 *
 * Usage:
 * ```ts
 * import { withRole } from '@/lib/rbac'
 *
 * export const GET = withRole('admin', async (request, auth) => {
 *   // auth is guaranteed to be the AuthPayload
 *   return NextResponse.json({ data: 'admin only' })
 * })
 * ```
 */
export function withRole(
  ...args: [...roles: Role[], handler: (request: NextRequest, auth: AuthPayload) => Promise<NextResponse>]
) {
  const handler = args[args.length - 1] as (request: NextRequest, auth: AuthPayload) => Promise<NextResponse>
  const roles = args.slice(0, -1) as Role[]

  return async (request: NextRequest): Promise<NextResponse> => {
    const result = await requireRole(...roles)(request)
    if (!result.authorized) {
      return result.response!
    }
    return handler(request, result.auth!)
  }
}
