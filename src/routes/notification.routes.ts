import { Elysia } from 'elysia'
import { notificationControllers } from '../controllers/notification.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export default new Elysia()
  .group('/notifications', (app) => app
    .use(authMiddleware)
    .get('/', (context) => notificationControllers.getUserNotifications(context))
    .put('/:id/read', (context) => notificationControllers.markAsRead(context))
  )