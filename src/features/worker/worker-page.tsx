import { SetupNotice } from '@/components/setup-notice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function WorkerPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Worker</h1>
        <p className="text-sm text-muted-foreground">
          Choose a worker to respond to an invitation, then check in and out.
          This selector is a demo convenience, not authentication.
        </p>
      </div>

      <SetupNotice />

      <Card>
        <CardHeader>
          <CardTitle>Your assignment</CardTitle>
          <CardDescription>Invitation and attendance appear here.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No worker selected. The worker list loads from the database.
        </CardContent>
      </Card>
    </div>
  )
}
