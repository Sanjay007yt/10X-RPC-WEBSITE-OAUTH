// 10X RPC — OAuth callback handler
import { NextResponse } from 'next/server'
import { exchangeCode, fetchDiscordUser, avatarUrl } from '@/lib/discord-oauth'
import { CONFIG } from '@/lib/config'
import { db } from '@/lib/db'
import { setSessionCookie } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${CONFIG.app.url}/#/?error=${encodeURIComponent(error)}`)
  }
  if (!code || !state) {
    return NextResponse.redirect(`${CONFIG.app.url}/#/?error=missing_code`)
  }

  // Pull verifier + state from cookies
  const cookieHeader = req.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const idx = c.indexOf('=')
      return [c.slice(0, idx), c.slice(idx + 1)]
    })
  )
  const verifier = cookies['10x_pkce_verifier']
  const savedState = cookies['10x_oauth_state']
  if (!verifier || savedState !== state) {
    return NextResponse.redirect(`${CONFIG.app.url}/#/?error=invalid_state`)
  }

  try {
    const redirectUri = `${CONFIG.app.url}/auth/callback`
    const tokens = await exchangeCode(code, verifier, redirectUri)
    const discordUser = await fetchDiscordUser(tokens.access_token)

    // Upsert the user
    const user = await db.user.upsert({
      where: { discordId: discordUser.id },
      create: {
        discordId: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
      },
      update: {
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
      },
    })

    // Create trial if not present
    if (!await db.trial.findUnique({ where: { userId: user.id } })) {
      await db.trial.create({
        data: {
          userId: user.id,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + CONFIG.app.trialDays * 24 * 60 * 60 * 1000),
        },
      })
    }

    // Create default GlobalConfig if not present
    if (!await db.globalConfig.findUnique({ where: { userId: user.id } })) {
      await db.globalConfig.create({ data: { userId: user.id } })
    }

    // Create the session and get the token back
    // setSessionCookie() returns the session token we just created
    const sessionToken = await setSessionCookie(user.id)

    // Now store the Discord OAuth tokens in that session
    // BUG FIX: Previously was trying to read the cookie from req.headers (request headers)
    // but the cookie was set on the RESPONSE, not the request. Now we use the returned token directly.
    if (sessionToken) {
      await db.session.update({
        where: { token: sessionToken },
        data: {
          discordAccessToken: tokens.access_token,
          discordRefreshToken: tokens.refresh_token,
          discordTokenExpiresAt: new Date(Date.now() + (tokens.expires_in || 604800) * 1000),
        },
      })
    }

    const res = NextResponse.redirect(`${CONFIG.app.url}/#/dashboard`)
    res.cookies.delete('10x_pkce_verifier')
    res.cookies.delete('10x_oauth_state')
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown_error'
    return NextResponse.redirect(`${CONFIG.app.url}/#/?error=${encodeURIComponent(msg)}`)
  }
}
