import { Elysia } from 'elysia'
import { rsvpControllers } from '../controllers/rsvp.controllers.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

export default new Elysia()
  .group('/events/:id/rsvp', (app) => app
    .use(authMiddleware)
    .post('/', (context) => rsvpControllers.createRSVP(context))
  )