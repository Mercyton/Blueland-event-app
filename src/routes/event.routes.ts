import { Elysia } from 'elysia'
import { eventControllers } from '../controllers/event.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.middleware.js'

export default new Elysia()
  .group('/events', (app) => app
    .use(authMiddleware)
    .get('/', (context) => eventControllers.getEvents(context))
    .post('/', (context) => eventControllers.createEvent(context), {
      beforeHandle: [requireRole(['ADMIN'])]
    })
    .post('/suggest', (context) => eventControllers.suggestEvent(context), {
      beforeHandle: [requireRole(['ORGANIZER'])]
    })
    .put('/:id/approve', (context) => eventControllers.approveEvent(context), {
      beforeHandle: [requireRole(['ADMIN'])]
    })
    .get('/pending', (context) => eventControllers.getPendingEvents(context), {
      beforeHandle: [requireRole(['ADMIN'])]
    })
  )