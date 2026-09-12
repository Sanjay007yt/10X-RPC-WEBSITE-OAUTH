// 10X RPC — /api/rpc/toggle — enable/disable RPC
// When enabling: same as /api/rpc/update (sends presence to Discord)
// When disabling: clears presence from Discord + disables RPC config
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { applyPresence, clearPresence } from '@/lib/rpc-manager'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'not_authenticated' },
      { status: 401 }
    )
  }

  const body = await req.json() as { enabled?: boolean }
  const enabled = !!body.enabled

  if (enabled) {
    // Enable: send presence to Discord
    const rpcConfig = await db.rpcConfig.findFirst({ where: { userId: session.userId } })
    const globalConfig = await db.globalConfig.findUnique({ where: { userId: session.userId } })

    const placeholderCtx = {
      timezone: globalConfig?.timezone || 'UTC',
      city: globalConfig?.city || undefined,
      rpcStartedAt: session.createdAt.getTime(),
    }

    const result = await applyPresence(
      {
        id: session.id,
        userId: session.userId,
        discordAccessToken: session.discordAccessToken,
        discordRefreshToken: session.discordRefreshToken,
        discordTokenExpiresAt: session.discordTokenExpiresAt,
        userStatus: session.userStatus,
        customStatus: session.customStatus,
        customStatusEmoji: session.customStatusEmoji,
      },
      rpcConfig ? {
        id: rpcConfig.id,
        name: rpcConfig.name,
        type: rpcConfig.type,
        platform: rpcConfig.platform,
        state: rpcConfig.state,
        details: rpcConfig.details,
        largeImage: rpcConfig.largeImage,
        largeText: rpcConfig.largeText,
        smallImage: rpcConfig.smallImage,
        smallText: rpcConfig.smallText,
        button1Label: rpcConfig.button1Label,
        button1Url: rpcConfig.button1Url,
        button2Label: rpcConfig.button2Label,
        button2Url: rpcConfig.button2Url,
        partyCurrent: rpcConfig.partyCurrent,
        partyMax: rpcConfig.partyMax,
        partyId: rpcConfig.partyId,
        partySecret: rpcConfig.partySecret,
        startMinsAgo: rpcConfig.startMinsAgo,
        endTotalMins: rpcConfig.endTotalMins,
        enabled: true,
      } : null,
      placeholderCtx
    )

    if (rpcConfig) {
      await db.rpcConfig.update({
        where: { id: rpcConfig.id },
        data: { enabled: result.ok },
      })
    }

    return NextResponse.json({
      ok: result.ok,
      enabled: result.ok,
      message: result.message,
    })
  } else {
    // Disable: clear presence from Discord
    const result = await clearPresence({
      id: session.id,
      discordAccessToken: session.discordAccessToken,
      discordRefreshToken: session.discordRefreshToken,
      discordTokenExpiresAt: session.discordTokenExpiresAt,
    })

    // Also disable the RPC config
    const rpcConfig = await db.rpcConfig.findFirst({ where: { userId: session.userId } })
    if (rpcConfig) {
      await db.rpcConfig.update({
        where: { id: rpcConfig.id },
        data: { enabled: false },
      })
    }

    return NextResponse.json({
      ok: true,
      enabled: false,
      message: result.ok ? 'RPC disabled and presence cleared' : 'RPC disabled (clear failed)',
    })
  }
}
