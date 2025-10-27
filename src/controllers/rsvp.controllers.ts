import { PrismaClient } from '@prisma/client'
import { notificationControllers } from './notification.controllers.js'

const prisma = new PrismaClient()

export const rsvpControllers = {
  async createRSVP({ params, body, user }: { params: { id: string }; body: any; user: any }) {
    try {
      if (!user) {
        return { error: 'Unauthorized' }
      }

      const { status = 'GOING' } = body
      const eventId = params.id

      // Check if event exists and is approved
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      })

      if (!event) {
        return { error: 'Event not found' }
      }

      if (!event.approved) {
        return { error: 'Event not approved' }
      }

      // Check for existing RSVP
      const existingRSVP = await prisma.rSVP.findUnique({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: eventId
          }
        }
      })

      if (existingRSVP) {
        return { error: 'Already RSVPed to this event' }
      }

      // Create RSVP
      const rsvp = await prisma.rSVP.create({
        data: {
          userId: user.id,
          eventId: eventId,
          status: status as any
        },
        include: {
          event: true,
          user: {
            select: {
              id: true,
              email: true
            }
          }
        }
      })

      // Notify event organizer about RSVP
      await notificationControllers.createNotification(
        event.organizerId,
        'New RSVP!',
        `User ${user.email} RSVPed to your event "${event.title}"`,
        'RSVP_CONFIRMED'
      )

      return {
        message: 'RSVP created successfully',
        rsvp
      }

    } catch (error: any) {
      console.error('RSVP error:', error)
      return { error: 'Failed to create RSVP' }
    }
  }
}