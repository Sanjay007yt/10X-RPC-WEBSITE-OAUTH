// 10X RPC — /api/rpc/clear — clear custom status
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  await db.session.update({
    where: { id: session.id },
    data: { customStatus: null, customStatusEmoji: null },
  })

  return NextResponse.json({ ok: true })
}
