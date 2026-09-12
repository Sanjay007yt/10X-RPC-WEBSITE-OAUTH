// 10X RPC — Per-game config page (#/games/:slug)
'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, type GamePreset, type GameConfig } from '@/lib/api-client'
import { useRouter } from './useRouter'
import { Card, SectionTitle, Field, TextInput, PrimaryButton, PurpleSwitch, BackButton } from './ui'
import { PLATFORMS, PLATFORM_GROUPS } from '@/lib/constants'

export function GameConfigPage({ slug }: { slug: string }) {
  const { navigate } = useRouter()
  const [preset, setPreset] = useState<GamePreset | null>(null)
  const [cfg, setCfg] = useState<GameConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    api.gameConfig(slug).then(r => {
      setPreset(r.preset)
      if (r.config) {
        setCfg(r.config)
        setEnabled(r.config.enabled)
      } else {
        setCfg({
          enabled: false,
          platform: r.preset.defaultPlatform,
          state: r.preset.defaultState,
          details: r.preset.defaultDetails,
          largeImage: r.preset.largeImage,
          largeText: r.preset.largeText,
          smallImage: null,
          smallText: null,
          button1Label: null,
          button1Url: null,
          button2Label: null,
          button2Url: null,
          partyCurrent: r.preset.defaultPartyCurrent,
          partyMax: r.preset.defaultPartyMax,
          partyId: null,
          partySecret: null,
          startMinsAgo: 0,
          endTotalMins: r.preset.defaultEndTotalMins,
        })
      }
    }).catch(e => {
      console.error(e)
      navigate({ name: 'games' })
    })
  }, [slug, navigate])

  if (!preset || !cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    )
  }

  const set = <K extends keyof GameConfig>(key: K, value: GameConfig[K]) =>
    setCfg(prev => prev ? { ...prev, [key]: value } : prev)

  const handleSave = async () => {
    // Validation
    const errors: string[] = []
    if ((cfg.state || '').length > 128) errors.push('State too long (max 128)')
    if ((cfg.details || '').length > 128) errors.push('Details too long (max 128)')
    if (cfg.button1Label && !cfg.button1Url) errors.push('Button 1 URL required when label is set')
    if (cfg.button2Label && !cfg.button2Url) errors.push('Button 2 URL required when label is set')
    if (cfg.button1Url && !/^https?:\/\//i.test(cfg.button1Url)) errors.push('Button 1 URL must start with http(s)://')
    if (cfg.button2Url && !/^https?:\/\//i.test(cfg.button2Url)) errors.push('Button 2 URL must start with http(s)://')
    if (cfg.partyCurrent > cfg.partyMax) errors.push('Party size cannot exceed party max')
    if (cfg.startMinsAgo < 0) errors.push('Start time cannot be negative')
    if (cfg.endTotalMins != null && cfg.endTotalMins < 1) errors.push('End time must be at least 1 minute')
    if (errors.length > 0) {
      errors.forEach(e => toast.error(e))
      return
    }
    setSaving(true)
    try {
      await api.gameSave(slug, { ...cfg, enabled })
      toast.success(`${preset?.name} config saved`, { duration: 2500 })
      navigate({ name: 'games' })
    } catch (e) {
      console.error(e)
      toast.error('Failed to save config')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <BackButton onClick={() => navigate({ name: 'games' })} />
        <h1 className="text-2xl font-bold text-white">{preset.name}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white hover:bg-white/10"
        >
          {saving ? '...' : 'Save'}
        </button>
      </div>

      <Card>
        <div className="space-y-4">
          {/* Enable RPC toggle + Platform */}
          <div className="flex items-center justify-between glass-card-inner p-3">
            <span className="text-sm font-semibold text-purple-300">Enable RPC</span>
            <PurpleSwitch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <Field label="Device Platform">
            <PlatformSelect value={cfg.platform} onChange={v => set('platform', v)} />
          </Field>

          <Field label="State">
            <TextInput
              value={cfg.state || ''}
              onChange={e => set('state', e.target.value)}
              placeholder="e.g. In a Match"
            />
          </Field>

          <Field label="Details">
            <TextInput
              value={cfg.details || ''}
              onChange={e => set('details', e.target.value)}
              placeholder="e.g. Ranked Mode"
            />
          </Field>

          <Field label="Start Time (mins ago)">
            <TextInput
              type="number" min="0"
              value={String(cfg.startMinsAgo ?? 0)}
              onChange={e => set('startMinsAgo', Number(e.target.value))}
            />
          </Field>

          <Field label="End Time (total mins)">
            <TextInput
              type="number" min="1"
              value={String(cfg.endTotalMins ?? '')}
              onChange={e => set('endTotalMins', e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 30"
            />
          </Field>

          <Field label="Party Size">
            <TextInput
              type="number" min="0"
              value={String(cfg.partyCurrent ?? 1)}
              onChange={e => set('partyCurrent', Number(e.target.value))}
            />
          </Field>

          <Field label="Party Max">
            <TextInput
              type="number" min="1"
              value={String(cfg.partyMax ?? 5)}
              onChange={e => set('partyMax', Number(e.target.value))}
            />
          </Field>

          <Field label="Party ID (Optional)">
            <TextInput
              value={cfg.partyId || ''}
              onChange={e => set('partyId', e.target.value)}
              placeholder="e.g. random-123"
            />
          </Field>

          <Field label="Party Secret (Join)">
            <TextInput
              value={cfg.partySecret || ''}
              onChange={e => set('partySecret', e.target.value)}
              placeholder="e.g. secret-456"
            />
          </Field>

          <Field label="Button 1 Label">
            <TextInput
              value={cfg.button1Label || ''}
              onChange={e => set('button1Label', e.target.value)}
              placeholder="e.g. Join"
            />
          </Field>

          <Field label="Button 1 URL">
            <TextInput
              value={cfg.button1Url || ''}
              onChange={e => set('button1Url', e.target.value)}
              placeholder="https://..."
            />
          </Field>

          <Field label="Button 2 Label">
            <TextInput
              value={cfg.button2Label || ''}
              onChange={e => set('button2Label', e.target.value)}
              placeholder="e.g. Watch"
            />
          </Field>

          <Field label="Button 2 URL">
            <TextInput
              value={cfg.button2Url || ''}
              onChange={e => set('button2Url', e.target.value)}
              placeholder="https://..."
            />
          </Field>

          <div className="pt-2">
            <PrimaryButton onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Configuration'}
            </PrimaryButton>
          </div>
        </div>
      </Card>
    </div>
  )
}

function PlatformSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = PLATFORMS.find(p => p.value === value)
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#13141a] border border-white/8 text-white rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-purple-500/40"
    >
      <option value="desktop" className="bg-[#13141a]">None</option>
      {PLATFORM_GROUPS.map(group => (
        <optgroup key={group} label={group} className="bg-[#13141a]">
          {PLATFORMS.filter(p => p.group === group).map(p => (
            <option key={p.value} value={p.value} className="bg-[#13141a]">
              {p.emoji} {p.label}
            </option>
          ))}
        </optgroup>
      ))}
      {!current && value !== 'desktop' && (
        <option value={value} className="bg-[#13141a]">Custom: {value}</option>
      )}
    </select>
  )
}
