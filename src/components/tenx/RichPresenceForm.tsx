// 10X RPC — Rich Presence form (long scroll, matches Roxy reference)
'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, type RpcConfig } from '@/lib/api-client'
import { Card, SectionTitle, TextInput, Field, PrimaryButton, PurpleSwitch, PillSelect } from './ui'
import { ACTIVITY_TYPES, PLATFORMS, PLATFORM_GROUPS } from '@/lib/constants'

const DEFAULT_CONFIG: RpcConfig = {
  name: '10X RPC',
  type: 'PLAYING',
  platform: 'desktop',
  state: '',
  details: '',
  largeImage: '',
  largeText: '',
  smallImage: '',
  smallText: '',
  button1Label: '',
  button1Url: '',
  button2Label: '',
  button2Url: '',
  partyCurrent: 1,
  partyMax: 5,
  partyId: '',
  partySecret: '',
  startMinsAgo: 0,
  endTotalMins: 30,
  enabled: false,
}

export function RichPresenceForm({
  initial, onSaved, onToggle, onGameRpcClick,
}: {
  initial: RpcConfig | null | undefined
  onSaved?: () => void
  onToggle?: (v: boolean) => void
  onGameRpcClick?: () => void
}) {
  const [cfg, setCfg] = useState<RpcConfig>(initial || DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [enabled, setEnabled] = useState(initial?.enabled ?? false)

  useEffect(() => {
    if (initial) {
      setCfg({ ...DEFAULT_CONFIG, ...initial })
      setEnabled(initial.enabled ?? false)
    }
  }, [initial])

  const set = <K extends keyof RpcConfig>(key: K, value: RpcConfig[K]) =>
    setCfg(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    // Validation
    const errors: string[] = []
    if ((cfg.name || '').length > 128) errors.push('Name too long (max 128)')
    if ((cfg.state || '').length > 128) errors.push('State too long (max 128)')
    if ((cfg.details || '').length > 128) errors.push('Details too long (max 128)')
    if ((cfg.button1Label || '').length > 32) errors.push('Button 1 label too long (max 32)')
    if ((cfg.button2Label || '').length > 32) errors.push('Button 2 label too long (max 32)')
    if (cfg.button1Url && !/^https?:\/\//i.test(cfg.button1Url)) errors.push('Button 1 URL must start with http:// or https://')
    if (cfg.button2Url && !/^https?:\/\//i.test(cfg.button2Url)) errors.push('Button 2 URL must start with http:// or https://')
    if (cfg.button1Label && !cfg.button1Url) errors.push('Button 1 URL required when label is set')
    if (cfg.button2Label && !cfg.button2Url) errors.push('Button 2 URL required when label is set')
    if (cfg.partyCurrent != null && cfg.partyMax != null && cfg.partyCurrent > cfg.partyMax) {
      errors.push('Party size cannot exceed party max')
    }
    if (cfg.startMinsAgo != null && cfg.startMinsAgo < 0) errors.push('Start time cannot be negative')
    if (cfg.endTotalMins != null && cfg.endTotalMins < 1) errors.push('End time must be at least 1 minute')
    if (errors.length > 0) {
      errors.forEach(e => toast.error(e))
      return
    }
    setSaving(true)
    try {
      await api.rpcSave({ ...cfg, enabled })
      toast.success('Rich Presence saved', { duration: 2500 })
      onSaved?.()
    } catch (e) {
      console.error(e)
      toast.error('Failed to save Rich Presence')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (v: boolean) => {
    setEnabled(v)
    onToggle?.(v)
  }

  return (
    <Card>
      <SectionTitle icon={<span className="text-xl">🎮</span>}>Rich Presence</SectionTitle>

      <div className="space-y-4">
        {/* Activity Type */}
        <Field label="Activity Type">
          <PillSelect
            value={cfg.type || 'PLAYING'}
            onValueChange={(v) => set('type', v)}
            options={ACTIVITY_TYPES.map(t => ({ value: t.label, label: t.label }))}
          />
        </Field>

        {/* Platform */}
        <Field label="RPC Device / Platform">
          <PlatformSelect value={cfg.platform || 'desktop'} onChange={(v) => set('platform', v)} />
        </Field>

        {/* Name */}
        <Field label="Name">
          <TextInput
            value={cfg.name || ''}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Visual Studio Code"
          />
        </Field>

        {/* State */}
        <Field label="State">
          <TextInput
            value={cfg.state || ''}
            onChange={e => set('state', e.target.value)}
            placeholder="e.g. Editing page.tsx"
          />
        </Field>

        {/* Details */}
        <Field label="Details">
          <TextInput
            value={cfg.details || ''}
            onChange={e => set('details', e.target.value)}
            placeholder="e.g. Workspace: Project"
          />
        </Field>

        {/* Large Image */}
        <Field label="Large Image (URL or ID)">
          <TextInput
            value={cfg.largeImage || ''}
            onChange={e => set('largeImage', e.target.value)}
            placeholder="https://... or ID"
          />
        </Field>

        <Field label="Large Image Text">
          <TextInput
            value={cfg.largeText || ''}
            onChange={e => set('largeText', e.target.value)}
            placeholder="Hover text"
          />
        </Field>

        {/* Small Image */}
        <Field label="Small Image (URL or ID)">
          <TextInput
            value={cfg.smallImage || ''}
            onChange={e => set('smallImage', e.target.value)}
            placeholder="https://... or ID"
          />
        </Field>

        <Field label="Small Image Text">
          <TextInput
            value={cfg.smallText || ''}
            onChange={e => set('smallText', e.target.value)}
            placeholder="Hover text"
          />
        </Field>

        {/* Buttons */}
        <Field label="Button 1 Label">
          <TextInput
            value={cfg.button1Label || ''}
            onChange={e => set('button1Label', e.target.value)}
            placeholder="e.g. View Repo"
          />
        </Field>
        <Field label="Button 1 URL">
          <TextInput
            value={cfg.button1Url || ''}
            onChange={e => set('button1Url', e.target.value)}
            placeholder="https://github.com/..."
          />
        </Field>

        <Field label="Button 2 Label">
          <TextInput
            value={cfg.button2Label || ''}
            onChange={e => set('button2Label', e.target.value)}
            placeholder="e.g. Join Server"
          />
        </Field>
        <Field label="Button 2 URL">
          <TextInput
            value={cfg.button2Url || ''}
            onChange={e => set('button2Url', e.target.value)}
            placeholder="https://discord.gg/..."
          />
        </Field>

        {/* Party */}
        <Field label="Party Size">
          <TextInput
            type="number" min="0"
            value={String(cfg.partyCurrent ?? 0)}
            onChange={e => set('partyCurrent', Number(e.target.value))}
            placeholder="e.g. 1"
          />
        </Field>
        <Field label="Party Max">
          <TextInput
            type="number" min="1"
            value={String(cfg.partyMax ?? 0)}
            onChange={e => set('partyMax', Number(e.target.value))}
            placeholder="e.g. 8"
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

        {/* Timing */}
        <Field label="Start Time (Mins Ago)">
          <TextInput
            type="number" min="0"
            value={String(cfg.startMinsAgo ?? 0)}
            onChange={e => set('startMinsAgo', Number(e.target.value))}
            placeholder="0"
          />
        </Field>
        <Field label="End Time (Total Mins From Start)">
          <TextInput
            type="number" min="1"
            value={String(cfg.endTotalMins ?? '')}
            onChange={e => set('endTotalMins', e.target.value ? Number(e.target.value) : null)}
            placeholder="e.g. 34"
          />
        </Field>

        {/* Enable RPC toggle + UPDATE */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <PurpleSwitch checked={enabled} onCheckedChange={handleToggle} />
            <span className="text-sm font-semibold text-purple-300">ENABLE RPC</span>
          </div>
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'UPDATE'}
          </PrimaryButton>
        </div>
      </div>

      {/* Game RPC promo */}
      {onGameRpcClick && (
        <div className="mt-8 text-center">
          <p className="text-2xl text-white/80 font-bold mb-1">want something cool</p>
          <p className="text-3xl mb-2 text-purple-400">?</p>
          <div className="text-purple-400 text-2xl mb-4 animate-bounce">vv</div>
          <button
            onClick={onGameRpcClick}
            className="w-full purple-gradient text-white font-bold py-4 rounded-2xl text-lg shadow-xl purple-glow"
          >
            TRY GAME RPC NOW
          </button>
        </div>
      )}
    </Card>
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
