import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export const jwtUtils = {
  sign: (payload: any) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }),
  
  verify: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
}