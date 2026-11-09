export type ConnectionState = 'unconfigured' | 'offline' | 'reconnecting' | 'live'

export function deriveConnectionState(
  configured: boolean,
  online: boolean,
  channelStatus: string,
): ConnectionState {
  if (!configured) return 'unconfigured'
  if (!online) return 'offline'
  if (channelStatus === 'SUBSCRIBED') return 'live'
  return 'reconnecting'
}

// The first subscribe is startup, not a recovery. A later subscribe means the
// channel dropped and came back, so the screen should reload authoritative rows.
export function shouldCatchUp(connectedBefore: boolean, status: string): boolean {
  return connectedBefore && status === 'SUBSCRIBED'
}
