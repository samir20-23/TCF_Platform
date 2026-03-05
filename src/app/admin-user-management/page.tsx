'use client';

import AdminHeader from '@/components/common/AdminHeader';
import AdminSidebar from '@/components/common/AdminSidebar';
import UserManagementInteractive from './components/UserManagementInteractive';

export default function AdminUserManagementPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header nav bar */}
      <AdminHeader />

      <div className="flex flex-1">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6"> 
            {/* User management interactive component */}
            <UserManagementInteractive />
          </div>
        </main>
      </div>
    </div>
  );
}