import { cn } from '@/lib/utils'

import type { ConnectionState } from '@/features/staffing/use-staffing'

const label: Record<Exclude<ConnectionState, 'unconfigured'>, string> = {
  live: 'Live',
  reconnecting: 'Reconnecting',
  offline: 'Offline',
}

const tone: Record<Exclude<ConnectionState, 'unconfigured'>, string> = {
  live: 'text-green-400',
  reconnecting: 'text-yellow-400',
  offline: 'text-red-400',
}

const dot: Record<Exclude<ConnectionState, 'unconfigured'>, string> = {
  live: 'bg-green-400',
  reconnecting: 'animate-pulse bg-yellow-400',
  offline: 'bg-red-400',
}

export function ConnectionStatus({ state }: { state: ConnectionState }) {
  if (state === 'unconfigured') return null

  return (
    <p role="status" className={cn('flex items-center gap-1.5 text-xs', tone[state])}>
      <span aria-hidden className={cn('size-2 rounded-full', dot[state])} />
      {label[state]}
    </p>
  )
}
