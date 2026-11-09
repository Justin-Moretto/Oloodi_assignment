import { BrowserRouter, Navigate, Route, Routes } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { RolePickerPage } from '@/features/role-picker/role-picker-page'
import { ManagerPage } from '@/features/manager/manager-page'
import { WorkerPage } from '@/features/worker/worker-page'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export function AppRouter() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<RolePickerPage />} />
          <Route path="manager" element={<ManagerPage />} />
          <Route path="worker" element={<WorkerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
