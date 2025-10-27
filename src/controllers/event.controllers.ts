import { PrismaClient } from '@prisma/client'
import { notificationControllers } from './notification.controllers.js'

const prisma = new PrismaClient()

export const eventControllers = {
  async getEvents({ user }: { user: any }) {
    try {
      if (!user) {
        return { error: 'Unauthorized' }
      }

      const events = await prisma.event.findMany({
        where: { approved: true },
        include: {
          organizer: {
            select: {
              id: true,
              email: true
            }
          },
          rsvps: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      })

      return { events }
    } catch (error: any) {
      console.error('Get events error:', error)
      return { error: 'Failed to fetch events' }
    }
  },

  async createEvent({ body, user }: { body: any; user: any }) {
    try {
      if (!user) {
        return { error: 'Unauthorized' }
      }

      // Only admins can create events directly
      if (user.role !== 'ADMIN') {
        return { error: 'Only admins can create events. Organizers can suggest events.' }
      }

      const { title, description, date, location, capacity: rawCapacity } = body
      const capacity = rawCapacity && rawCapacity > 0 ? rawCapacity : 100

      const event = await prisma.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          location,
          capacity,
          organizerId: user.id,
          approved: true // Auto-approve for admins
        },
        include: {
          organizer: {
            select: {
              id: true,
              email: true
            }
          }
        }
      })

      // Notify all users about new event
      const allUsers = await prisma.user.findMany()
      for (const user of allUsers) {
        await notificationControllers.createNotification(
          user.id,
          'New Event Created!',
          `A new event "${title}" has been scheduled for ${new Date(date).toLocaleDateString()}`,
          'EVENT_CREATED'
        )
      }

      return {
        message: 'Event created successfully',
        event
      }
    } catch (error: any) {
      console.error('Create event error:', error)
      return { error: 'Failed to create event' }
    }
  },

  async suggestEvent({ body, user }: { body: any; user: any }) {
    try {
      if (!user) {
        return { error: 'Unauthorized' }
      }

      // Organizers can suggest events
      if (user.role !== 'ORGANIZER') {
        return { error: 'Only organizers can suggest events' }
      }

      const { title, description, date, location, capacity: rawCapacity } = body
      const capacity = rawCapacity && rawCapacity > 0 ? rawCapacity : 100

      const event = await prisma.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          location,
          capacity,
          organizerId: user.id,
          approved: false // Needs admin approval
        }
      })

      // Notify admins about event suggestion
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
      for (const admin of admins) {
        await notificationControllers.createNotification(
          admin.id,
          'Event Suggestion',
          `Organizer ${user.email} suggested event: "${title}"`,
          'EVENT_SUGGESTED'
        )
      }

      return { 
        message: 'Event suggested successfully. Waiting for admin approval.', 
        event 
      }
    } catch (error: any) {
      console.error('Suggest event error:', error)
      return { error: 'Failed to suggest event' }
    }
  },

  async approveEvent({ params, user }: { params: { id: string }; user: any }) {
    try {
      if (!user || user.role !== 'ADMIN') {
        return { error: 'Admin access required' }
      }

      const event = await prisma.event.update({
        where: { id: params.id },
        data: { approved: true },
        include: { organizer: true }
      })

      // Notify organizer about approval
      await notificationControllers.createNotification(
        event.organizerId,
        'Event Approved!',
        `Your event "${event.title}" has been approved and is now visible to all users.`,
        'EVENT_APPROVED'
      )

      // Notify all users about the approved event
      const allUsers = await prisma.user.findMany()
      for (const user of allUsers) {
        await notificationControllers.createNotification(
          user.id,
          'New Event Available!',
          `Event "${event.title}" is happening on ${new Date(event.date).toLocaleDateString()} at ${event.location}`,
          'EVENT_APPROVED'
        )
      }

      return { message: 'Event approved successfully', event }
    } catch (error: any) {
      console.error('Approve event error:', error)
      return { error: 'Failed to approve event' }
    }
  },

  async getPendingEvents({ user }: { user: any }) {
    try {
      if (!user || user.role !== 'ADMIN') {
        return { error: 'Admin access required' }
      }

      const events = await prisma.event.findMany({
        where: { approved: false },
        include: {
          organizer: {
            select: {
              id: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return { events }
    } catch (error: any) {
      console.error('Get pending events error:', error)
      return { error: 'Failed to fetch pending events' }
    }
  }
}