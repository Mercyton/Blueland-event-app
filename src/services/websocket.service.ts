import type { WSContext } from 'elysia'

export class WebSocketService {
  private connections: Set<WSContext> = new Set()

  addConnection(ws: WSContext) {
    this.connections.add(ws)
  }

  removeConnection(ws: WSContext) {
    this.connections.delete(ws)
  }

  broadcast(eventType: string, data: any) {
    const message = JSON.stringify({ type: eventType, data, timestamp: new Date().toISOString() })
    
    this.connections.forEach(ws => {
      if (ws.readyState === 1) { // OPEN
        ws.send(message)
      }
    })
  }

  // Specific event broadcasts
  broadcastEventCreated(event: any) {
    this.broadcast('EVENT_CREATED', event)
  }

  broadcastEventUpdated(event: any) {
    this.broadcast('EVENT_UPDATED', event)
  }

  broadcastEventDeleted(eventId: string) {
    this.broadcast('EVENT_DELETED', { eventId })
  }

  broadcastEventApproved(event: any) {
    this.broadcast('EVENT_APPROVED', event)
  }

  broadcastRSVPUpdated(rsvp: any) {
    this.broadcast('RSVP_UPDATED', rsvp)
  }
}