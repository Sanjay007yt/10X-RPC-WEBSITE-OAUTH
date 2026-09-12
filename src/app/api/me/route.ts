// 10X RPC — /api/me — current user + session state
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'
import { avatarUrl } from '@/lib/discord-oauth'
import { CONFIG } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) {
    // Return 200 with authenticated:false — the dashboard handles this case gracefully
    return NextResponse.json({ authenticated: false })
  }

  const trial = await db.trial.findUnique({ where: { userId: session.userId } })
  const globalConfig = await db.globalConfig.findUnique({ where: { userId: session.userId } })
  const rpcConfig = await db.rpcConfig.findFirst({ where: { userId: session.userId } })
  const rotatorPresets = await db.rotatorPreset.findMany({
    where: { userId: session.userId },
    orderBy: { order: 'asc' },
  })

  const now = new Date()
  const trialActive = trial?.active && trial.endsAt > now
  const trialMsLeft = trial ? trial.endsAt.getTime() - now.getTime() : 0

  // Check sleep timer
  const sleepTimerActive = session.sleepTimerActive && session.sleepTimerEndsAt && session.sleepTimerEndsAt > now

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.discordId,
      username: session.user.username,
      discriminator: session.user.discriminator,
      avatar: avatarUrl({
        id: session.user.discordId,
        avatar: session.user.avatar,
        discriminator: session.user.discriminator || '0',
      }),
      backgroundUrl: session.user.backgroundUrl,
    },
    session: {
      rpcEnabled: session.rpcEnabled,
      gatewayReady: session.gatewayReady,
      userStatus: session.userStatus,
      customStatus: session.customStatus,
      customStatusEmoji: session.customStatusEmoji,
      vrStatusActive: session.vrStatusActive,
      sleepTimerActive,
      sleepTimerEndsAt: session.sleepTimerEndsAt,
      hasDiscordToken: !!session.discordAccessToken,
      lastPresenceUpdate: session.lastPresenceUpdate,
    },
    trial: {
      active: trialActive,
      endsAt: trial?.endsAt,
      msLeft: trialMsLeft,
      daysLeft: Math.max(0, Math.ceil(trialMsLeft / (24 * 60 * 60 * 1000))),
    },
    globalConfig: globalConfig ? {
      city: globalConfig.city,
      timezone: globalConfig.timezone,
      rotatorEnabled: globalConfig.rotatorEnabled,
      rotatorIntervalMins: globalConfig.rotatorIntervalMins,
    } : null,
    rpcConfig: rpcConfig ? {
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
    rotatorPresets: rotatorPresets.map(p => ({
      id: p.id,
      emoji: p.emoji,
      text: p.text,
      durationMins: p.durationMins,
      enabled: p.enabled,
      order: p.order,
    })),
    rotatorEnabled: globalConfig?.rotatorEnabled ?? false,
    app: {
      name: CONFIG.app.name,
      tagline: CONFIG.app.tagline,
    },
  })
}
