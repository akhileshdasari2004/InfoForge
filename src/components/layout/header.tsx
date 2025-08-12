'use client';

import { Search, Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/data-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function Header() {
  const { searchData } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const results = searchData(searchQuery);
      console.log('Search results:', results);
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/70">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-2">
          <div className="text-sm text-white/50">InfoForge Dashboard</div>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search clients, workers, tasks..."
              className="pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-white/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}