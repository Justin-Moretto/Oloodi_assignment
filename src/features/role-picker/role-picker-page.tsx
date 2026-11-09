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

import type { StaffingData } from '@/features/staffing/api'
import { StaffingGate } from '@/features/staffing/staffing-gate'

export function RolePickerPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
      <StaffingGate>{(data) => <RolePicker data={data} />}</StaffingGate>
    </div>
  )
}

function RolePicker({ data }: { data: StaffingData }) {
  const navigate = useNavigate()
  const [workerId, setWorkerId] = useState<string>()
  const [flash, setFlash] = useState(0)
  const selected = data.assignments.find((assignment) => assignment.worker_id === workerId)

  function openWorkerView() {
    if (!selected) {
      setFlash(0)
      requestAnimationFrame(() => setFlash((count) => count + 1))
      return
    }
    navigate(`/worker?worker=${selected.worker_id}`)
  }

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
          <Select value={selected?.worker_id} onValueChange={setWorkerId}>
            <SelectTrigger
              className={`w-full border-zinc-300 bg-white ${flash > 0 ? 'worker-select-flash' : ''}`}
              data-flash={flash}
              aria-label="Worker"
            >
              <SelectValue placeholder="Choose a worker" />
            </SelectTrigger>
            <SelectContent>
              {data.assignments.map((assignment) => (
                <SelectItem key={assignment.worker_id} value={assignment.worker_id}>
                  {assignment.workerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="w-full bg-blue-700 text-white hover:bg-blue-800"
            onClick={openWorkerView}
          >
            Worker
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
