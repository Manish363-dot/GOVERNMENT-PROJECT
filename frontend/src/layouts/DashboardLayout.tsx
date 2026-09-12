import { Outlet } from 'react-router-dom';
import { TopHeader } from '@/components/TopHeader';

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopHeader />
      <main className="flex-1 w-full p-4 sm:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
