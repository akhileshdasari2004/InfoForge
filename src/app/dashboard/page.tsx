'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Dashboard } from '@/components/dashboard/dashboard';
import { DataGrid } from '@/components/data-grid/data-grid';
import { RuleBuilder } from '@/components/rules/rule-builder';
import { Prioritization } from '@/components/prioritization/prioritization';
import { ValidationPanel } from '@/components/validation/validation-panel';
import { DataProvider } from '@/contexts/data-context';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'data':
        return <DataGrid />;
      case 'rules':
        return <RuleBuilder />;
      case 'prioritization':
        return <Prioritization />;
      case 'validation':
        return <ValidationPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="flex h-screen bg-background">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}