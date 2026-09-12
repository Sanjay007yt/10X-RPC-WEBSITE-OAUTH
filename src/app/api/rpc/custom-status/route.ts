// 10X RPC — /api/rpc/custom-status — set custom Discord status (emoji + text)
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const body = await req.json() as { emoji?: string | null; text?: string | null }
  const emoji = body.emoji?.trim() || null
  const text = body.text?.trim() || null

  // Persist to session — in production this would also call Discord's REST API
  // PATCH /api/v9/users/@me/settings with { custom_status: { text, emoji_name } }
  await db.session.update({
    where: { id: session.id },
    data: {
      customStatus: text,
      customStatusEmoji: emoji,
    },
  })

  return NextResponse.json({ ok: true, customStatus: { emoji, text } })
}
