import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { routeWrapper } from '@/app/api/utils/api'
import { checkAdmin } from '@/app/api/utils/permissions'
import { generateHash } from '@/app/api/utils/hash'
import { generateStrongPassword } from './utils'

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
