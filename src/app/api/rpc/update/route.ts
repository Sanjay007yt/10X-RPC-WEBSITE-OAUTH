// 10X RPC — /api/rpc/update — UPDATE button: apply current RPC config
// In production this would push the activity via gateway op-3 or REST API.
// For sandbox, we just persist and reflect the state.
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  // Mark RPC as enabled and ready (mock for sandbox — real gateway connection happens in production)
  await db.session.update({
    where: { id: session.id },
    data: { rpcEnabled: true, gatewayReady: true },
  })

  return NextResponse.json({ ok: true, message: 'RPC presence applied' })
}
