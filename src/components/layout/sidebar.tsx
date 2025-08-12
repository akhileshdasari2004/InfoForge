'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Grid3X3, 
  Settings, 
  AlertTriangle,
  Crown
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: Grid3X3 },
  { id: 'data', label: 'Data Grid', icon: Database },
  { id: 'rules', label: 'Rules', icon: Settings },
  { id: 'prioritization', label: 'Prioritization', icon: Crown },
  { id: 'validation', label: 'Validation', icon: AlertTriangle },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 bg-black border-r border-white/10 text-white flex flex-col">
      <div className="p-6">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-white/40">InfoForge</div>
          <div className="mt-1 text-lg font-semibold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Orchestration
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-11',
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                    : 'hover:bg-white/5 text-white/80'
                )}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}