import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SetupNotice() {
  return (
    <Alert>
      <AlertTitle>Database not configured</AlertTitle>
      <AlertDescription>
        Copy <code>.env.example</code> to <code>.env</code>, set{' '}
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>,
        then restart the dev server. Use the anon key only. Do not put the
        service-role key in the frontend.
      </AlertDescription>
    </Alert>
  )
}
