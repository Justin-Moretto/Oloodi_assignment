import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { ManagerPage } from '@/features/manager/manager-page'
import { WorkerPage } from '@/features/worker/worker-page'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/manager" replace />} />
          <Route path="manager" element={<ManagerPage />} />
          <Route path="worker" element={<WorkerPage />} />
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
