import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { StaffingDashboard } from '@/features/staffing/api'
import { StaffingGate } from '@/features/staffing/staffing-gate'

export function LoginPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
      <StaffingGate>{(dashboard) => <LoginForm dashboard={dashboard} />}</StaffingGate>
    </div>
  )
}

function LoginForm({ dashboard }: { dashboard: StaffingDashboard }) {
  const navigate = useNavigate()
  const [workerId, setWorkerId] = useState<string>()
  const selected = dashboard.assignments.find((assignment) => assignment.worker_id === workerId)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manager</CardTitle>
          <CardDescription>Invite workers and watch the shift.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => navigate('/manager')}>
            Manager
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Worker</CardTitle>
          <CardDescription>Choose your name. This list is not authentication.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full bg-blue-700 text-white hover:bg-blue-800"
            disabled={!selected}
            onClick={() => {
              if (!selected) return
              navigate(`/worker?worker=${selected.worker_id}`)
            }}
          >
            Worker
          </Button>
          <Select value={selected?.worker_id} onValueChange={setWorkerId}>
            <SelectTrigger className="w-full" aria-label="Worker">
              <SelectValue placeholder="Choose a worker" />
            </SelectTrigger>
            <SelectContent>
              {dashboard.assignments.map((assignment) => (
                <SelectItem key={assignment.worker_id} value={assignment.worker_id}>
                  {assignment.workerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </>
  )
}
