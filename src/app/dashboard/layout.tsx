import dynamic from 'next/dynamic';

const DynamicSidebar = dynamic(() => import('@/components/sidebar'), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row h-screen bg-background">
      <DynamicSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="container mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
