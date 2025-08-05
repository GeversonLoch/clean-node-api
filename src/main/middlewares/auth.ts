import { expressMiddlewareAdapter } from '@main/adapters/express/express-middleware-adapter'
import { makeAuthMiddleware } from '@main/factories/middlewares/auth-middlewares-factory'

export const auth = expressMiddlewareAdapter(makeAuthMiddleware())
export const adminAuth = expressMiddlewareAdapter(makeAuthMiddleware('admin'))
