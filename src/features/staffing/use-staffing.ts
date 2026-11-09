import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { queryClient } from '@/app/query-client'
import { isSupabaseConfigured } from '@/lib/env'
import { supabase } from '@/lib/supabase/client'

import { fetchStaffing, runAssignmentAction, type AssignmentAction } from '@/features/staffing/api'
import {
  deriveConnectionState,
  shouldCatchUp,
  type ConnectionState,
} from '@/features/staffing/connection-state'

export const staffingQueryKey = ['staffing'] as const

export type { ConnectionState }

function refreshStaffing() {
  void queryClient.invalidateQueries({ queryKey: staffingQueryKey })
}

export function useStaffingQuery() {
  return useQuery({
    queryKey: staffingQueryKey,
    queryFn: fetchStaffing,
    enabled: isSupabaseConfigured,
  })
}

export function useAssignmentAction() {
  return useMutation({
    mutationFn: (action: AssignmentAction) => runAssignmentAction(action),
    onSuccess: (result) => {
      if (result.ok) toast.success(result.message)
      else toast.error(result.message)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
    onSettled: refreshStaffing,
  })
}

export function useAssignmentRealtime(): ConnectionState {
  const [channelStatus, setChannelStatus] = useState('CLOSED')
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let connectedBefore = false
    const channel = supabase
      .channel(`staffing-assignments-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments' },
        () => {
          // The event is only a signal. The next read loads the authoritative rows.
          refreshStaffing()
        },
      )
      .subscribe((status) => {
        setChannelStatus(status)
        if (shouldCatchUp(connectedBefore, status)) refreshStaffing()
        if (status === 'SUBSCRIBED') connectedBefore = true
      })

    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      void supabase.removeChannel(channel)
    }
  }, [])

  return deriveConnectionState(isSupabaseConfigured, online, channelStatus)
}
