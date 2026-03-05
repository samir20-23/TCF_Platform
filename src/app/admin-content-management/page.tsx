'use client';

import { Suspense } from 'react';

import AdminHeader from '@/components/common/AdminHeader';
import AdminSidebar from '@/components/common/AdminSidebar';
import AdminTestsManagementInteractive from './components/AdminTestsManagementInteractive';

export default function AdminContentManagementPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <AdminHeader />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
              <AdminTestsManagementInteractive />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}