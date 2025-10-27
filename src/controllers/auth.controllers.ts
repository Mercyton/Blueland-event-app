import { jwtUtils } from '../utils/jwt.utils.js'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authControllers = {
  async signup({ body }: { body: { email: string; password: string; role?: string } }) {
    try {
      console.log('Signup attempt:', body)

      const { email, password, role = 'ATTENDEE' } = body

      const userCount = await prisma.user.count()
      let assignedRole = role

      if (userCount === 0) {
        assignedRole = 'ADMIN'
      } else if (role === 'ADMIN') {
        return { error: 'Cannot register as an admin. Please choose another role.' }
      }

      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        console.log('User already exists:', email)
        return { error: 'User already exists' }
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      console.log('Password hashed successfully')

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: assignedRole as any
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true
        }
      })

      console.log('User created:', user)

      // Generate JWT token
      const token = jwtUtils.sign({
        id: user.id,
        email: user.email,
        role: user.role
      })

      console.log('Token generated')

      return {
        message: 'User created successfully',
        token,
        user
      }

    } catch (error: any) {
      console.error('Signup error:', error)
      return { error: 'Internal server error: ' + error.message }
    }
  },

  async login({ body }: { body: { email: string; password: string } }) {
    try {
      console.log('Login attempt:', body.email)
      
      const { email, password } = body

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        console.log('User not found:', email)
        return { error: 'Invalid credentials' }
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        console.log('Invalid password for:', email)
        return { error: 'Invalid credentials' }
      }

      // Generate JWT token
      const token = jwtUtils.sign({
        id: user.id,
        email: user.email,
        role: user.role
      })

      console.log('Login successful:', email)

      return {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }

    } catch (error: any) {
      console.error('Login error:', error)
      return { error: 'Internal server error: ' + error.message }
    }
  },

  async getStats({ user }: { user: any }) {
    try {
      if (user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
      }

      const userCount = await prisma.user.count()

      return {
        userCount
      }
    } catch (error: any) {
      console.error('Get stats error:', error)
      return { error: 'Internal server error: ' + error.message }
    }
  },

  async getAllUsers({ user }: { user: any }) {
    try {
      if (user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true
        }
      })

      return {
        users
      }
    } catch (error: any) {
      console.error('Get all users error:', error)
      return { error: 'Internal server error: ' + error.message }
    }
  },

  async updateUserRole({ user, params, body }: { user: any, params: { id: string }, body: { role: string } }) {
    try {
      if (user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
      }

      const { id } = params
      const { role } = body

      await prisma.user.update({
        where: { id },
        data: { role: role as any }
      })

      return {
        success: true
      }
    } catch (error: any) {
      console.error('Update user role error:', error)
      return { error: 'Internal server error: ' + error.message }
    }
  }
}