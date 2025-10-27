export const requireAuth = (request: any) => {
  if (!request.user) {
    throw new Error('Unauthorized - Please login')
  }
}

export const requireRole = (roles: string[]) => (request: any) => {
  requireAuth(request)
  
  if (!roles.includes(request.user.role)) {
    throw new Error(`Insufficient permissions. Required roles: ${roles.join(', ')}`)
  }
}