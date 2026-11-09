import { describe, expect, it } from 'vitest'

import { deriveConnectionState, shouldCatchUp } from '@/features/staffing/connection-state'

describe('deriveConnectionState', () => {
  it('stays hidden when the database is not configured', () => {
    expect(deriveConnectionState(false, true, 'SUBSCRIBED')).toBe('unconfigured')
  })

  it('reports offline even if the channel still says it is subscribed', () => {
    expect(deriveConnectionState(true, false, 'SUBSCRIBED')).toBe('offline')
  })

  it('reports live only while the browser is online and the channel is subscribed', () => {
    expect(deriveConnectionState(true, true, 'SUBSCRIBED')).toBe('live')
  })

  it('reports reconnecting while online but the channel is down', () => {
    for (const status of ['CLOSED', 'CHANNEL_ERROR', 'TIMED_OUT']) {
      expect(deriveConnectionState(true, true, status)).toBe('reconnecting')
    }
  })
})

describe('shouldCatchUp', () => {
  it('does not refetch on the first subscribe', () => {
    expect(shouldCatchUp(false, 'SUBSCRIBED')).toBe(false)
  })

  it('refetches when a channel that had connected subscribes again', () => {
    expect(shouldCatchUp(true, 'SUBSCRIBED')).toBe(true)
  })

  it('does not refetch on a drop itself', () => {
    expect(shouldCatchUp(true, 'CHANNEL_ERROR')).toBe(false)
    expect(shouldCatchUp(true, 'CLOSED')).toBe(false)
  })
})
