import { Elysia } from 'elysia'
import { rsvpControllers } from '../controllers/rsvp.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export default new Elysia()
  .use(authMiddleware)
  .post('/events/:id/rsvp', (context) => rsvpControllers.createRSVP(context))