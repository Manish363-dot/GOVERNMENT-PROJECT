import { Outlet } from 'react-router-dom';
import { TopHeader } from '@/components/TopHeader';

export function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#eef1f6] font-inter">
      <TopHeader />
      <main className="flex-1 w-full p-4 sm:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
