// 10X RPC — /api/vr-status/enable — toggle VR (Meta Quest) status
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const body = await req.json() as { active?: boolean }
  const active = !!body.active

  await db.session.update({
    where: { id: session.id },
    data: { vrStatusActive: active, userStatus: active ? 'online' : session.userStatus },
  })

  return NextResponse.json({ ok: true, vrStatusActive: active })
}
