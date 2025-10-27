import { Elysia } from 'elysia'
import { notificationControllers } from '../controllers/notification.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export default new Elysia()
  .use(authMiddleware)
  .get('/notifications', (context) => notificationControllers.getUserNotifications(context))
  .put('/notifications/:id/read', (context) => notificationControllers.markAsRead(context))