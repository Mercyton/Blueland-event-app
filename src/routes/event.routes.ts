import { Elysia } from 'elysia'
import { eventControllers } from '../controllers/event.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

export default new Elysia()
  .use(authMiddleware)
  .get('/events', (context) => eventControllers.getEvents(context))
  .post('/events', (context) => eventControllers.createEvent(context), {
    beforeHandle: [requireRole(['ADMIN'])]
  })
  .post('/events/suggest', (context) => eventControllers.suggestEvent(context), {
    beforeHandle: [requireRole(['ORGANIZER'])]
  })
  .put('/events/:id/approve', (context) => eventControllers.approveEvent(context), {
    beforeHandle: [requireRole(['ADMIN'])]
  })
  .get('/events/pending', (context) => eventControllers.getPendingEvents(context), {
    beforeHandle: [requireRole(['ADMIN'])]
  })