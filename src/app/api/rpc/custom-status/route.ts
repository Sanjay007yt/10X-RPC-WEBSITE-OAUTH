// 10X RPC — /api/rpc/custom-status — set custom Discord status via REST API
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { setCustomStatusViaRest } from '@/lib/rpc-manager'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })
  }

  const body = await req.json() as { emoji?: string | null; text?: string | null }
  const emoji = body.emoji?.trim() || null
  const text = body.text?.trim() || null

  // Persist to session
  await db.session.update({
    where: { id: session.id },
    data: {
      customStatus: text,
      customStatusEmoji: emoji,
    },
  })

  // If we have a Discord access token, push to Discord via REST API
  if (session.discordAccessToken) {
    const result = await setCustomStatusViaRest(session.discordAccessToken, emoji, text)
    return NextResponse.json({
      ok: result.ok,
      customStatus: { emoji, text },
      message: result.message,
    })
  }

  // Demo mode — just persisted to DB
  return NextResponse.json({
    ok: true,
    customStatus: { emoji, text },
    message: 'Saved (demo mode — sign in with Discord to apply to Discord)',
  })
}
