import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, routeWrapper, getParsedParams } from '@/app/api/utils/api'
import { checkDraftCommissioner } from '@/app/api/utils/permissions'

export const GET = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    const queryParams: any = getParsedParams(req.nextUrl) || {}
    if (!id) throw new ApiError('League id required', 400)
    const draft = await prisma.draft.findUnique({ ...queryParams, where: { id } })
    return NextResponse.json(draft)
  }
)

export const PUT = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Draft id required', 400)
    await checkDraftCommissioner(id)
    const data: any = req.consumedBody
    const updatedDraft = await prisma.draft.update({ where: { id }, data })
    return NextResponse.json(updatedDraft)
  }
)

export const DELETE = routeWrapper(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    if (!id) throw new ApiError('Draft id required', 400)
    await checkDraftCommissioner(id) // commissioner only
    const deletedDraft = await prisma.draft.delete({ where: { id } })
    return NextResponse.json(deletedDraft)
  }
)
