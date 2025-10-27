import { Elysia } from 'elysia'
import { jwtUtils } from '../utils/jwt.utils.js'

export const authMiddleware = new Elysia()
  .derive({ as: 'global' }, async (request: any) => {
    const authHeader = request.headers.authorization
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null }
    }

    const token = authHeader.slice(7)
    
    try {
      const decoded = jwtUtils.verify(token) as any
      return { user: decoded }
    } catch {
      return { user: null }
    }
  })