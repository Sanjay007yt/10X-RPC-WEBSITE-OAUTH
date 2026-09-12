// 10X RPC — Live Discord RPC Preview card
// Shows what the user's Discord presence will actually look like
'use client'
import { useEffect, useState } from 'react'
import type { RpcConfig } from '@/lib/api-client'

interface PreviewProps {
  config: RpcConfig | null | undefined
  username?: string
  avatarUrl?: string
  platform?: string
  rpcEnabled?: boolean
}

export function DiscordPreview({ config, username, avatarUrl, platform, rpcEnabled }: PreviewProps) {
  const [, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const name = config?.name || '10X RPC'
  const state = config?.state || ''
  const details = config?.details || ''
  const largeImage = config?.largeImage || ''
  const largeText = config?.largeText || name
  const smallImage = config?.smallImage || ''
  const smallText = config?.smallText || ''
  const startMinsAgo = config?.startMinsAgo ?? 0
  const endTotalMins = config?.endTotalMins ?? null
  const partyCurrent = config?.partyCurrent ?? 0
  const partyMax = config?.partyMax ?? 0
  const button1Label = config?.button1Label || ''
  const button2Label = config?.button2Label || ''
  const type = (config?.type || 'PLAYING').toUpperCase()

  // Compute elapsed time string
  const startMs = Date.now() - (startMinsAgo * 60 * 1000)
  const elapsedMs = Date.now() - startMs
  const elapsedStr = formatElapsed(elapsedMs)

  // Compute remaining time if endTotalMins is set
  let remainingStr = ''
  if (endTotalMins) {
    const endMs = startMs + (endTotalMins * 60 * 1000)
    const remainingMs = endMs - Date.now()
    if (remainingMs > 0) {
      remainingStr = formatRemaining(remainingMs)
    }
  }

  return (
    <div className="glass-card-inner p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">Live Preview</span>
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${rpcEnabled ? 'text-green-400' : 'text-white/40'}`}>
          {rpcEnabled ? '● LIVE' : '○ DISABLED'}
        </span>
      </div>

      {/* Discord-style activity card */}
      <div className="bg-[#2b2d31] rounded-lg p-3 space-y-2.5">
        {/* Top row: avatar + username + activity name */}
        <div className="flex items-start gap-3">
          {avatarUrl ? (
             
            <img
              src={avatarUrl}
              alt={username || 'User'}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-500/40 flex items-center justify-center text-sm font-bold text-white">
              {(username || '?').slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white truncate">{username || 'DemoUser'}</span>
              {platform && platform !== 'desktop' && (
                <PlatformBadge platform={platform} />
              )}
            </div>
            <div className="text-xs text-white/60 flex items-center gap-1">
              <span className="text-purple-400 font-semibold">{type}</span>
              <span className="truncate">{name}</span>
              {elapsedStr && <span className="text-white/40 whitespace-nowrap">• {elapsedStr} elapsed</span>}
            </div>
          </div>
        </div>

        {/* Activity detail block */}
        <div className="bg-[#1e1f22] rounded-md p-2.5 flex gap-3">
          {/* Large image */}
          <div className="relative">
            {largeImage ? (
              isUrl(largeImage) ? (
                 
                <img
                  src={largeImage}
                  alt={largeText}
                  title={largeText}
                  className="w-16 h-16 rounded-md object-cover"
                />
              ) : (
                <div
                  title={largeText}
                  className="w-16 h-16 rounded-md purple-gradient flex items-center justify-center text-2xl font-bold text-white"
                >
                  {(largeImage || name).slice(0, 1).toUpperCase()}
                </div>
              )
            ) : (
              <div className="w-16 h-16 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                🎮
              </div>
            )}
            {/* Small image overlay */}
            {smallImage && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#1e1f22] overflow-hidden bg-[#1e1f22] flex items-center justify-center text-xs">
                {isUrl(smallImage) ? (
                   
                  <img src={smallImage} alt={smallText} title={smallText} className="w-full h-full object-cover" />
                ) : (
                  <span title={smallText}>⭐</span>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-0.5">
            {details && <div className="text-xs text-white font-medium truncate">{details}</div>}
            {state && <div className="text-xs text-white/70 truncate">{state}</div>}
            {remainingStr && (
              <div className="text-xs text-white/50 flex items-center gap-1">
                <span>⏳</span> <span>{remainingStr}</span>
              </div>
            )}
            {partyMax > 0 && partyCurrent > 0 && (
              <div className="text-xs text-white/50 flex items-center gap-1">
                <span>👥</span> <span>{partyCurrent} of {partyMax}</span>
              </div>
            )}
            {!details && !state && !remainingStr && (!partyMax || !partyCurrent) && (
              <div className="text-xs text-white/30 italic">No details set</div>
            )}
          </div>
        </div>

        {/* Buttons */}
        {(button1Label || button2Label) && (
          <div className="grid grid-cols-2 gap-2">
            {button1Label ? (
              <button
                type="button"
                className="text-xs text-[#00a8fc] bg-[#1e1f22] hover:bg-[#2b2d31] rounded-md py-1.5 truncate"
                title={button1Label}
              >
                {button1Label}
              </button>
            ) : <div />}
            {button2Label ? (
              <button
                type="button"
                className="text-xs text-[#00a8fc] bg-[#1e1f22] hover:bg-[#2b2d31] rounded-md py-1.5 truncate"
                title={button2Label}
              >
                {button2Label}
              </button>
            ) : <div />}
          </div>
        )}
      </div>
    </div>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  const map: Record<string, { emoji: string; label: string }> = {
    mobile: { emoji: '📱', label: 'Mobile' },
    web: { emoji: '🌐', label: 'Web' },
    xbox: { emoji: '🎮', label: 'Xbox' },
    ps4: { emoji: '🎮', label: 'PS4' },
    ps5: { emoji: '🎮', label: 'PS5' },
    samsung: { emoji: '📱', label: 'Samsung' },
    ios: { emoji: '📱', label: 'iOS' },
    android: { emoji: '📱', label: 'Android' },
    embedded: { emoji: '🥽', label: 'Embedded' },
    meta_quest: { emoji: '🥽', label: 'VR' },
  }
  const p = map[platform]
  if (!p) return null
  return (
    <span className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
      <span>{p.emoji}</span>
      <span>{p.label}</span>
    </span>
  )
}

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s)
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatRemaining(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m left`
  if (m > 0) return `${m}m ${s}s left`
  return `${s}s left`
}
