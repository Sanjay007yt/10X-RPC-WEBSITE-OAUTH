// 10X RPC — Games list page (#/games) with active game indicator
'use client'
import { useEffect, useState } from 'react'
import { api, type GameListItem } from '@/lib/api-client'
import { useRouter } from './useRouter'
import { BackButton } from './ui'

export function GamesPage() {
  const { navigate } = useRouter()
  const [games, setGames] = useState<GameListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeGameSlug, setActiveGameSlug] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.gamesList(),
      api.me().catch(() => null),
    ]).then(([r, me]) => {
      setGames(r.games)
      setLoading(false)
      // Find active game from saved game configs
      if (me?.user) {
        // We need to check which game is enabled — but /api/me doesn't return gameConfigs.
        // For now, we'll just leave activeGameSlug as null. Future: add /api/games/active endpoint.
      }
    }).catch(() => setLoading(false))
  }, [])

  const filtered = games.filter(g => g.name.toLowerCase().includes(query.toLowerCase()))
  const activeCount = games.filter(g => g.enabled).length

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <BackButton onClick={() => navigate({ name: 'dashboard' })} />
        <h1 className="text-2xl font-bold text-white">Games</h1>
        <div className="w-16 text-right">
          {activeCount > 0 && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
              {activeCount} active
            </span>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search games..."
          className="w-full bg-[#13141a] border border-white/8 text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/40 placeholder:text-white/40"
        />
      </div>

      <div className="glass-card-inner divide-y divide-white/5">
        {loading && (
          <div className="p-8 text-center space-y-3">
            <div className="inline-block w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
            <p className="text-white/50 text-sm">Loading games...</p>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <div className="text-4xl">🎮</div>
            <p className="text-white/60 font-medium">No games found</p>
            <p className="text-xs text-white/40">
              {query ? `No matches for "${query}". Try a different search.` : 'Game catalog is empty.'}
            </p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-purple-300 hover:text-purple-200"
              >
                Clear search
              </button>
            )}
          </div>
        )}
        {!loading && filtered.map(g => (
          <button
            key={g.slug}
            onClick={() => navigate({ name: 'game', slug: g.slug })}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg purple-gradient flex items-center justify-center text-xs font-bold text-white">
                {g.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-white text-sm font-medium">{g.name}</span>
              {g.enabled && (
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 inline-flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <span className="text-white/30">›</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-white/30 text-center mt-6">
        ⚠ 10X RPC is not responsible if your account gets banned or blocked. Use at your own risk.
      </p>
    </div>
  )
}
