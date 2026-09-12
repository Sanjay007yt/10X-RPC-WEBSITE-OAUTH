// 10X RPC — Initiate Discord OAuth flow
import { NextResponse } from 'next/server'
import { generatePkce, buildAuthorizeUrl } from '@/lib/discord-oauth'
import { CONFIG } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { verifier, challenge } = generatePkce()
  const state = crypto.randomUUID()

  // Use CONFIG.discord.redirectUri (Render backend URL) — NOT CONFIG.app.url (Vercel frontend).
  // Discord redirects back to this URL after the user authorizes, so it MUST be the
  // Render backend where /auth/callback runs, and it MUST match what's registered
  // in the Discord Developer Portal.
  const redirectUri = CONFIG.discord.redirectUri
  const authorizeUrl = buildAuthorizeUrl(state, challenge, redirectUri)

  const res = NextResponse.redirect(authorizeUrl)
  res.cookies.set('10x_pkce_verifier', verifier, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 600,
  })
  res.cookies.set('10x_oauth_state', state, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 600,
  })
  return res
}
