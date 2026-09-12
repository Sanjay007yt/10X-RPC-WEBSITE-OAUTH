// 10X RPC — /api/rpc/toggle — enable/disable RPC for current session
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const body = await req.json() as { enabled?: boolean }
  const enabled = !!body.enabled

  await db.session.update({
    where: { id: session.id },
    data: { rpcEnabled: enabled, gatewayReady: enabled },
  })

  // Also update the RPC config enabled flag
  const existing = await db.rpcConfig.findFirst({ where: { userId: session.userId } })
  if (existing) {
    await db.rpcConfig.update({ where: { id: existing.id }, data: { enabled } })
  }

  return NextResponse.json({ ok: true, enabled })
}
