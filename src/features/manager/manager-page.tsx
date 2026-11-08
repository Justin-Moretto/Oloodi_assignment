import { SetupNotice } from '@/components/setup-notice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { label: 'Filled', hint: 'Accepted workers' },
  { label: 'Remaining', hint: 'Open positions' },
  { label: 'Checked in', hint: 'On site now' },
  { label: 'Checked out', hint: 'Finished' },
] as const

export function ManagerPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Manager dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Invite workers and watch participation and attendance update live.
        </p>
      </div>

      <SetupNotice />

      <Card>
        <CardHeader>
          <CardTitle>Shift</CardTitle>
          <CardDescription>Title, schedule, and location load from the database.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">No shift loaded yet.</CardContent>
      </Card>

      <section aria-label="Staffing summary" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">—</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{stat.hint}</CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Workers</CardTitle>
          <CardDescription>Three seeded workers, initially uninvited.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Assignment actions connect after the database functions are in place.
        </CardContent>
      </Card>
    </div>
  )
}
