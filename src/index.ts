import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/auth.routes.js'
import eventRoutes from './routes/event.routes.js'
import rsvpRoutes from './routes/rsvp.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import { readFile } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

const app = new Elysia()
  .use(cors())
  
  // Serve frontend files
  .get('/', async () => {
    try {
      const html = await readFile(join(process.cwd(), 'event-frontend', 'index.html'), 'utf-8')
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      })
    } catch (error) {
      return new Response('Frontend not found', { status: 404 })
    }
  })
  .get('/styles.css', async () => {
    try {
      const css = await readFile(join(process.cwd(), 'event-frontend', 'styles.css'), 'utf-8')
      return new Response(css, {
        headers: { 'Content-Type': 'text/css' }
      })
    } catch (error) {
      return new Response('CSS not found', { status: 404 })
    }
  })
  .get('/app.js', async () => {
    try {
      const js = await readFile(join(process.cwd(), 'event-frontend', 'app.js'), 'utf-8')
      return new Response(js, {
        headers: { 'Content-Type': 'application/javascript' }
      })
    } catch (error) {
      return new Response('JS not found', { status: 404 })
    }
  })
  
  // API routes
  .use(authRoutes)
  .use(eventRoutes)
  .use(rsvpRoutes)
  .use(notificationRoutes)
  
  .get('/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { 
        status: 'OK', 
        database: 'Connected',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return { status: 'Error', database: 'Disconnected' }
    }
  })
  
  // API documentation endpoint (simple version)
  .get('/docs', () => {
    return `
      <html>
        <body>
          <h1>Event Management API Documentation</h1>
          <h2>Endpoints:</h2>
          <ul>
            <li><strong>POST /signup</strong> - User registration</li>
            <li><strong>POST /login</strong> - User login</li>
            <li><strong>GET /events</strong> - Get all events (auth required)</li>
            <li><strong>POST /events</strong> - Create event (admin only)</li>
            <li><strong>POST /events/suggest</strong> - Suggest event (organizer only)</li>
            <li><strong>PUT /events/:id/approve</strong> - Approve event (admin only)</li>
            <li><strong>GET /events/pending</strong> - Get pending events (admin only)</li>
            <li><strong>POST /events/:id/rsvp</strong> - RSVP to event (auth required)</li>
            <li><strong>GET /notifications</strong> - Get user notifications</li>
            <li><strong>PUT /notifications/:id/read</strong> - Mark notification as read</li>
          </ul>
        </body>
      </html>
    `
  })
  .listen(3000)

console.log('=========================================')
console.log('🚀 Event Management App - FULL STACK READY!')
console.log('📍 Frontend: http://localhost:3000')
console.log('📚 API Docs: http://localhost:3000/docs')
console.log('❤️  Health: http://localhost:3000/health')
console.log('')
console.log('✅ FEATURES:')
console.log('   🔐 Authentication & JWT')
console.log('   📅 Event Management (Admin/Organizer/Attendee)')
console.log('   ✅ RSVP System')
console.log('   🔔 Real-time Notifications')
console.log('   🎨 Modern Frontend UI')
console.log('=========================================')