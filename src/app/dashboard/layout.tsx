import dynamic from 'next/dynamic';

const DynamicSidebar = dynamic(() => import('@/components/sidebar'), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <DynamicSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="container mx-auto">{children}</div>
      </main>
    </div>
  );
}
