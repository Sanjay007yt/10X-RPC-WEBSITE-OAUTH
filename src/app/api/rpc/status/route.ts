// 10X RPC — /api/rpc/status — set user status (online/idle/dnd/invisible)
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const body = await req.json() as { status?: string }
  const status = body.status || 'online'
  if (!['online', 'idle', 'dnd', 'invisible'].includes(status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
  }

  await db.session.update({
    where: { id: session.id },
    data: { userStatus: status },
  })

  return NextResponse.json({ ok: true, status })
}
