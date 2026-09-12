// 10X RPC — /api/rpc/update — UPDATE button: actually send presence to Discord
// This endpoint:
//   1. Loads the user's session + RPC config + global config
//   2. Resolves dynamic placeholders in state/details
//   3. Connects to Discord's Gaming SDK gateway
//   4. Sends PRESENCE_UPDATE (op-3) with the activity payload
//   5. Also sets custom status + user status via REST API
//   6. Returns the result
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { applyPresence } from '@/lib/rpc-manager'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Allow up to 30s for gateway connection

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { ok: false, error: 'not_authenticated' },
      { status: 401 }
    )
  }

  // Check trial
  const trial = await db.trial.findUnique({ where: { userId: session.userId } })
  if (!trial || !trial.active || trial.endsAt < new Date()) {
    return NextResponse.json(
      { ok: false, error: 'trial_expired', message: 'Your 3-day trial has expired.' },
      { status: 403 }
    )
  }

  // Load the RPC config + global config
  const rpcConfig = await db.rpcConfig.findFirst({ where: { userId: session.userId } })
  const globalConfig = await db.globalConfig.findUnique({ where: { userId: session.userId } })

  // Build the placeholder context
  const placeholderCtx = {
    timezone: globalConfig?.timezone || 'UTC',
    city: globalConfig?.city || undefined,
    rpcStartedAt: session.createdAt.getTime(),
  }

  // Apply the presence via the RPC manager
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
      enabled: rpcConfig.enabled,
    } : null,
    placeholderCtx
  )

  // Also mark the RPC config as enabled
  if (rpcConfig) {
    await db.rpcConfig.update({
      where: { id: rpcConfig.id },
      data: { enabled: true },
    })
  }

  return NextResponse.json({
    ok: result.ok,
    method: result.method,
    message: result.message,
    rpcEnabled: result.ok,
    gatewayReady: result.ok,
  })
}
