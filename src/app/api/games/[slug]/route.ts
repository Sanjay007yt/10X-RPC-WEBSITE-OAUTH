// 10X RPC — /api/games/[slug] — GET/POST per-game RPC config
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { findGame } from '@/lib/games'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const preset = findGame(slug)
  if (!preset) return NextResponse.json({ error: 'game_not_found' }, { status: 404 })

  const session = await getSession()
  const userId = session?.userId
  const saved = userId
    ? await db.gameConfig.findUnique({ where: { userId_gameSlug: { userId, gameSlug: slug } } })
    : null

  return NextResponse.json({
    preset,
    config: saved ?? null,
  })
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const preset = findGame(slug)
  if (!preset) return NextResponse.json({ error: 'game_not_found' }, { status: 404 })

  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const body = await req.json()
  const data = {
    gameName: preset.name,
    enabled: body.enabled ?? false,
    platform: body.platform ?? preset.defaultPlatform,
    state: body.state ?? null,
    details: body.details ?? null,
    largeImage: body.largeImage ?? preset.largeImage,
    largeText: body.largeText ?? preset.largeText,
    smallImage: body.smallImage ?? null,
    smallText: body.smallText ?? null,
    button1Label: body.button1Label ?? null,
    button1Url: body.button1Url ?? null,
    button2Label: body.button2Label ?? null,
    button2Url: body.button2Url ?? null,
    partyCurrent: typeof body.partyCurrent === 'number' ? body.partyCurrent : preset.defaultPartyCurrent,
    partyMax: typeof body.partyMax === 'number' ? body.partyMax : preset.defaultPartyMax,
    partyId: body.partyId ?? null,
    partySecret: body.partySecret ?? null,
    startMinsAgo: typeof body.startMinsAgo === 'number' ? body.startMinsAgo : 0,
    endTotalMins: typeof body.endTotalMins === 'number' ? body.endTotalMins : null,
  }

  const updated = await db.gameConfig.upsert({
    where: { userId_gameSlug: { userId: session.userId, gameSlug: slug } },
    create: { userId: session.userId, gameSlug: slug, ...data },
    update: data,
  })

  return NextResponse.json({ ok: true, config: updated })
}
