import { cn } from '@/lib/utils'

import type { ConnectionState } from '@/features/staffing/connection-state'

const display: Record<Exclude<ConnectionState, 'unconfigured'>, { label: string; text: string; dot: string }> = {
  live: { label: 'Live', text: 'text-green-400', dot: 'bg-green-400' },
  reconnecting: { label: 'Reconnecting', text: 'text-yellow-400', dot: 'animate-pulse bg-yellow-400' },
  offline: { label: 'Offline', text: 'text-red-400', dot: 'bg-red-400' },
}

export function ConnectionStatus({ state }: { state: ConnectionState }) {
  if (state === 'unconfigured') return null
  const { label, text, dot } = display[state]

  return (
    <p role="status" className={cn('flex items-center gap-1.5 text-xs', text)}>
      <span aria-hidden className={cn('size-2 rounded-full', dot)} />
      {label}
    </p>
  )
}
