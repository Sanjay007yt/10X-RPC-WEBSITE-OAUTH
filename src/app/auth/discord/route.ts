// 10X RPC — Initiate Discord OAuth flow
import { NextResponse } from 'next/server'
import { generatePkce, buildAuthorizeUrl } from '@/lib/discord-oauth'
import { CONFIG } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { verifier, challenge } = generatePkce()
  const state = crypto.randomUUID()

  const redirectUri = `${CONFIG.app.url}/auth/callback`
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
