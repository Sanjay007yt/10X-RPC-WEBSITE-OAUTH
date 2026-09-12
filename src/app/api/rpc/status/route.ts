// 10X RPC — /api/rpc/status — set user status (online/idle/dnd/invisible) via REST API
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { setStatusViaRest } from '@/lib/rpc-manager'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })
  }

  const body = await req.json() as { status?: string }
  const status = body.status || 'online'

  if (!['online', 'idle', 'dnd', 'invisible'].includes(status)) {
    return NextResponse.json(
      { ok: false, error: 'invalid_status', message: 'Must be: online, idle, dnd, or invisible' },
      { status: 400 }
    )
  }

  // Persist to session
  await db.session.update({
    where: { id: session.id },
    data: { userStatus: status },
  })

  // If we have a Discord access token, push via REST API
  if (session.discordAccessToken) {
    const result = await setStatusViaRest(session.discordAccessToken, status)
    return NextResponse.json({
      ok: result.ok,
      status,
      message: result.message,
    })
  }

  return NextResponse.json({
    ok: true,
    status,
    message: 'Saved (demo mode — sign in with Discord to apply to Discord)',
  })
}
