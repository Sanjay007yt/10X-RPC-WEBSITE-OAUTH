// 10X RPC — Platform and status constants

export interface PlatformOption {
  value: string
  label: string
  description: string
  group: string
  emoji: string
}

export const PLATFORMS: PlatformOption[] = [
  { value: 'desktop', label: 'Desktop', description: 'Desktop — no special badge', group: 'Web', emoji: '🖥️' },
  { value: 'web', label: 'Web', description: 'Web browser session', group: 'Web', emoji: '🌐' },
  { value: 'mobile', label: 'Mobile', description: 'Mobile device session', group: 'Web', emoji: '📱' },
  { value: 'console', label: 'Console', description: 'Console session (generic)', group: 'Console', emoji: '🎮' },
  { value: 'xbox', label: 'Xbox', description: 'Xbox integration badge', group: 'Console', emoji: '🎮' },
  { value: 'ps4', label: 'PlayStation 4', description: 'PS4 integration badge', group: 'Console', emoji: '🎮' },
  { value: 'ps5', label: 'PlayStation 5', description: 'PS5 integration badge', group: 'Console', emoji: '🎮' },
  { value: 'samsung', label: 'Samsung', description: 'Samsung Game Launcher — Android', group: 'Mobile', emoji: '📱' },
  { value: 'ios', label: 'iOS', description: 'iOS session', group: 'Mobile', emoji: '📱' },
  { value: 'android', label: 'Android', description: 'Android session', group: 'Mobile', emoji: '📱' },
  { value: 'embedded', label: 'Embedded', description: 'Embedded session', group: 'VR & Embedded', emoji: '🥽' },
  { value: 'meta_quest', label: 'Meta Quest', description: 'Meta Quest VR session — shows VR headset icon', group: 'VR & Embedded', emoji: '🥽' },
]

export const PLATFORM_GROUPS = ['Web', 'Console', 'Mobile', 'VR & Embedded']

export interface ActivityType {
  value: number
  label: string
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { value: 0, label: 'PLAYING' },
  { value: 1, label: 'STREAMING' },
  { value: 2, label: 'LISTENING' },
  { value: 3, label: 'WATCHING' },
  { value: 5, label: 'COMPETING' },
]

export interface DiscordStatus {
  value: string
  label: string
  color: string
  emoji: string
}

export const DISCORD_STATUSES: DiscordStatus[] = [
  { value: 'online', label: 'Online', color: 'bg-green-500', emoji: '🟢' },
  { value: 'idle', label: 'Idle', color: 'bg-yellow-500', emoji: '🟡' },
  { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500', emoji: '🔴' },
  { value: 'invisible', label: 'Invisible', color: 'bg-gray-500', emoji: '⚫' },
]

export function platformByValue(value: string) {
  return PLATFORMS.find(p => p.value === value)
}
