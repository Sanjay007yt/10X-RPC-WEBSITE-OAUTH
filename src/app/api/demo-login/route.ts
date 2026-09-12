// 10X RPC — /api/demo-login — create a demo user + session for preview
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { setSessionCookie } from '@/lib/session'
import { CONFIG } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function POST() {
  // Check if demo user already exists
  const demoDiscordId = 'demo-user-10x'
  let user = await db.user.findUnique({ where: { discordId: demoDiscordId } })
  if (!user) {
    user = await db.user.create({
      data: {
        discordId: demoDiscordId,
        username: 'DemoUser',
        discriminator: '0001',
        avatar: null,
        backgroundUrl: 'https://images.unsplash.com/photo-1614850523060-8da1d56ae167?w=1200&q=80',
      },
    })
    // Create trial
    await db.trial.create({
      data: {
        userId: user.id,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + CONFIG.app.trialDays * 24 * 60 * 60 * 1000),
      },
    })
    // Create global config
    await db.globalConfig.create({
      data: { userId: user.id, city: 'Mumbai', timezone: 'Asia/Calcutta' }
    })
    // Create a default RPC config
    await db.rpcConfig.create({
      data: {
        userId: user.id,
        name: 'Visual Studio Code',
        type: 'PLAYING',
        platform: 'desktop',
        state: 'Editing page.tsx',
        details: 'Workspace: 10X RPC',
        largeImage: 'vscode',
        largeText: 'VS Code',
        enabled: false,
        partyCurrent: 1,
        partyMax: 5,
        startMinsAgo: 0,
        endTotalMins: 30,
      },
    })
    // Seed a couple of rotator presets
    await db.rotatorPreset.createMany({
      data: [
        { userId: user.id, emoji: '🎮', text: 'Playing something', durationMins: 5, order: 0 },
        { userId: user.id, emoji: '💻', text: 'Coding the future', durationMins: 5, order: 1 },
        { userId: user.id, emoji: '☕', text: 'Coffee break', durationMins: 5, order: 2 },
      ],
    })
  }

  await setSessionCookie(user.id)
  return NextResponse.json({ ok: true, demo: true })
}
