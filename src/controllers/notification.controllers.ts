import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const notificationControllers = {
  async createNotification(userId: string, title: string, message: string, type: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type
        }
      })
    } catch (error) {
      console.error('Notification creation error:', error)
    }
  },

  async getUserNotifications({ user }: { user: any }) {
    try {
      if (!user) return { error: 'Unauthorized' }

      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

      return { notifications }
    } catch (error: any) {
      console.error('Get notifications error:', error)
      return { error: 'Failed to fetch notifications' }
    }
  },

  async markAsRead({ params, user }: { params: { id: string }; user: any }) {
    try {
      if (!user) return { error: 'Unauthorized' }

      await prisma.notification.update({
        where: { id: params.id, userId: user.id },
        data: { read: true }
      })

      return { message: 'Notification marked as read' }
    } catch (error: any) {
      console.error('Mark as read error:', error)
      return { error: 'Failed to update notification' }
    }
  }
}