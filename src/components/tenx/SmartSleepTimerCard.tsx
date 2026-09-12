// 10X RPC — Smart Sleep Timer card
'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { Card, SectionTitle, TextInput, PrimaryButton } from './ui'

export function SmartSleepTimerCard({ currentEndsAt, onSaved }: { currentEndsAt?: string | null; onSaved?: () => void }) {
  const [hours, setHours] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)
    const h = Number(hours)
    if (!hours || !Number.isFinite(h)) {
      setError('Enter a valid number')
      return
    }
    if (h <= 0) {
      setError('Hours must be greater than 0')
      return
    }
    if (h > 24 * 7) {
      setError('Maximum is 168 hours (1 week)')
      return
    }
    setSaving(true)
    try {
      await api.sleepTimer(h)
      toast.success(`Sleep timer set for ${h} hour${h === 1 ? '' : 's'}`, { duration: 2500 })
      setHours('')
      onSaved?.()
    } catch (e) {
      console.error(e)
      toast.error('Failed to set sleep timer')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    setSaving(true)
    try {
      await api.sleepTimer(null)
      toast.success('Sleep timer cancelled', { duration: 2000 })
      onSaved?.()
    } catch (e) {
      console.error(e)
      toast.error('Failed to cancel timer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <SectionTitle icon={<span className="text-xl">⏰</span>}>Smart Sleep Timer</SectionTitle>
      <p className="text-sm text-white/60 mb-4">
        Automatically turn off your 10X RPC connection after a set amount of time.
      </p>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="text-[11px] uppercase tracking-wider text-purple-400 font-semibold block mb-1.5">Hours</label>
          <TextInput
            type="number"
            step="0.5"
            min="0.5"
            max="168"
            placeholder="ex. 1.5 or 3"
            value={hours}
            onChange={e => { setHours(e.target.value); setError(null) }}
            aria-invalid={!!error}
          />
          {error && (
            <p className="text-xs text-red-400 mt-1.5" role="alert">{error}</p>
          )}
        </div>
        <PrimaryButton onClick={handleSave} disabled={saving || !hours} className="px-6">
          {saving ? '...' : 'SAVE'}
        </PrimaryButton>
      </div>

      {currentEndsAt && (
        <div className="mt-3 flex items-center justify-between glass-card-inner p-3">
          <p className="text-xs text-white/70">
            ⏳ Sleeps in <span className="text-white font-medium tabular-nums">{formatCountdown(new Date(currentEndsAt).getTime() - Date.now())}</span>
          </p>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Cancel
          </button>
        </div>
      )}
    </Card>
  )
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'now'
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
