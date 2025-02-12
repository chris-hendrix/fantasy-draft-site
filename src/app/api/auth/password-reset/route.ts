import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper } from '@/app/api/utils/api'
import { checkAdmin } from '@/app/api/utils/permissions'
import { generateHash } from '@/app/api/utils/hash'

const generateStrongPassword = (length = 16) => {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const specialChars = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/"

  const allChars = upperCase + lowerCase + numbers + specialChars

  // Ensure at least one of each required character type
  let password = ''
  password += upperCase[Math.floor(Math.random() * upperCase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += specialChars[Math.floor(Math.random() * specialChars.length)]

  // Fill the rest of the password with random characters
  for (let i = 3; i < length; i += 1) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export const POST = routeWrapper(async (req: NextRequest) => {
  await checkAdmin()
  const { userId }: any = req.consumedBody
  const password = generateStrongPassword()
  const hash = await generateHash(password)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hash }
  })
  return NextResponse.json({ password })
})
