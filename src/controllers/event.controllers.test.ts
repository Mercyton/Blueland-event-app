import { describe, it, expect, mock, beforeEach } from 'bun:test'

// Mock Prisma and notifications
const mockPrisma = {
  event: {
    create: mock(() => Promise.resolve({ id: '1' })),
    findMany: mock(() => Promise.resolve([])),
    update: mock(() => Promise.resolve({}))
  },
  user: {
    findMany: mock(() => Promise.resolve([]))
  }
}

mock.module('@prisma/client', () => {
  return {
    PrismaClient: class {
      constructor() {
        return mockPrisma
      }
    }
  }
})

mock.module('./notification.controllers.js', () => ({
  notificationControllers: {
    createNotification: mock(() => Promise.resolve())
  }
}))

describe('eventControllers', () => {
  let eventControllers: any;

  beforeEach(async () => {
    // Reset mocks before each test
    mockPrisma.event.create.mockClear();
    mockPrisma.user.findMany.mockClear();

    // Dynamically import the controllers after mocks are set up
    const module = await import('./event.controllers.js');
    eventControllers = module.eventControllers;
  });

  it('should default to a capacity of 100 if capacity is 0 in createEvent', async () => {
    const body = {
      title: 'Test Event',
      description: 'A test event',
      date: '2025-12-31T23:59:59.999Z',
      location: 'Test Location',
      capacity: 0
    }
    const user = { id: 'admin-id', role: 'ADMIN', email: 'admin@test.com' }

    await eventControllers.createEvent({ body, user })

    expect(mockPrisma.event.create).toHaveBeenCalled();
    const createCall = mockPrisma.event.create.mock.calls[0][0]
    expect(createCall.data.capacity).toBe(100)
  })

  it('should default to a capacity of 100 if capacity is 0 in suggestEvent', async () => {
    const body = {
      title: 'Test Event',
      description: 'A test event',
      date: '2025-12-31T23:59:59.999Z',
      location: 'Test Location',
      capacity: 0
    }
    const user = { id: 'organizer-id', role: 'ORGANIZER', email: 'organizer@test.com' }

    await eventControllers.suggestEvent({ body, user })

    expect(mockPrisma.event.create).toHaveBeenCalled();
    const createCall = mockPrisma.event.create.mock.calls[0][0]
    expect(createCall.data.capacity).toBe(100)
  })
})
