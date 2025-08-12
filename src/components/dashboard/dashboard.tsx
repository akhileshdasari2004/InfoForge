'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import { Users, Briefcase, UserCheck, AlertTriangle, CheckCircle, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function Dashboard() {
  const { clients, workers, tasks, validationErrors, rules } = useData();

  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;
  const activeRulesCount = rules.filter(r => r.active).length;

  const dataCompleteness = Math.round(
    ((clients.length > 0 ? 33 : 0) + 
     (workers.length > 0 ? 33 : 0) + 
     (tasks.length > 0 ? 34 : 0))
  );

  const validationStatus = errorCount === 0 ? 'success' : warningCount > 0 ? 'warning' : 'error';
  const validationScore = Math.max(0, Math.min(100, 100 - (errorCount + warningCount) * 5));

  const stats = [
    {
      title: 'Clients',
      value: clients.length.toString(),
      description: 'Active client records',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Workers',
      value: workers.length.toString(),
      description: 'Available workers',
      icon: UserCheck,
      color: 'text-fuchsia-400',
      bgColor: 'bg-fuchsia-500/10'
    },
    {
      title: 'Tasks',
      value: tasks.length.toString(),
      description: 'Total tasks',
      icon: Briefcase,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'Active Rules',
      value: activeRulesCount.toString(),
      description: 'Business rules configured',
      icon: CheckCircle,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    },
    {
      title: 'Quality Score',
      value: `${validationScore}%`,
      description: 'Data validation score',
      icon: TrendingUp,
      color: validationScore >= 80 ? 'text-green-400' : validationScore >= 60 ? 'text-yellow-300' : 'text-red-400',
      bgColor: 'bg-white/5'
    }
  ];

  // Simple distribution meters
  const totalEntities = Math.max(1, clients.length + workers.length + tasks.length);
  const clientsPct = Math.round((clients.length / totalEntities) * 100);
  const workersPct = Math.round((workers.length / totalEntities) * 100);
  const tasksPct = 100 - clientsPct - workersPct;

  return (
    <div className="space-y-8 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/60 via-black to-black">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-purple-300/80 mb-2">
              <Sparkles className="h-4 w-4" /> Allocation Pulse
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your orchestration snapshot</h1>
            <p className="text-white/60 mt-1">Monitor data, quality and rules at a glance. Optimize when you are ready.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="#validation" className="hidden" aria-hidden />
            <Link href="#data" className="hidden" aria-hidden />
            <Link href="/dashboard" className="hidden" aria-hidden />
            <Link
              href="/auth/signup"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm border-0"
            >
              Run Optimization
            </Link>
            <Link
              href="/auth/signin"
              className="px-4 py-2 rounded-lg border border-white/15 text-sm hover:bg-white/5"
            >
              View Logs
            </Link>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60">{stat.title}</p>
                      <div className="text-xl font-semibold">{stat.value}</div>
                    </div>
                    <div className={`w-9 h-9 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-white/50">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Data completeness */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white/90">
                <Clock className="w-5 h-5" />
                Data Completeness
              </CardTitle>
              <CardDescription className="text-white/60">
                Progress of data ingestion across all entities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Overall Progress</span>
                  <span className="text-white/80">{dataCompleteness}%</span>
                </div>
                <Progress value={dataCompleteness} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">{clients.length}</div>
                  <div className="text-white/60">Clients</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{workers.length}</div>
                  <div className="text-white/60">Workers</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{tasks.length}</div>
                  <div className="text-white/60">Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Load distribution */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90">Load Distribution</CardTitle>
              <CardDescription className="text-white/60">Relative share of entities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-white/60"><span>Clients</span><span>{clientsPct}%</span></div>
                <div className="h-2 rounded bg-white/5 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: `${clientsPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/60"><span>Workers</span><span>{workersPct}%</span></div>
                <div className="h-2 rounded bg-white/5 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-fuchsia-600 to-fuchsia-400" style={{ width: `${workersPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/60"><span>Tasks</span><span>{tasksPct}%</span></div>
                <div className="h-2 rounded bg-white/5 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-indigo-600 to-indigo-400" style={{ width: `${tasksPct}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {/* Validation status */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white/90">
                <AlertTriangle className="w-5 h-5" />
                Validation Status
              </CardTitle>
              <CardDescription className="text-white/60">Current data quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">Status</span>
                <Badge 
                  variant={validationStatus === 'success' ? 'default' : 
                          validationStatus === 'warning' ? 'secondary' : 'destructive'}
                >
                  {validationStatus === 'success' ? 'All Clear' : 
                   validationStatus === 'warning' ? 'Warnings' : 'Errors Found'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400">Errors</span>
                <span className="font-medium text-white/90">{errorCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-300">Warnings</span>
                <span className="font-medium text-white/90">{warningCount}</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Quality Score</span>
                  <span>{validationScore}%</span>
                </div>
                <Progress value={validationScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90">What's happening</CardTitle>
              <CardDescription className="text-white/60">Latest changes across your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-white/60">Rules</div>
              <div className="space-y-2">
                {rules.slice(0,5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm bg-white/5 rounded p-2 border border-white/10">
                    <span className="truncate mr-2">{r.name}</span>
                    <Badge variant={r.active ? 'default' : 'secondary'}>{r.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                ))}
                {rules.length === 0 && (
                  <div className="text-sm text-white/60">No rules configured yet.</div>
                )}
              </div>
              <div className="text-xs text-white/60 pt-3">Data</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 border border-white/10 rounded p-2">
                  <div className="text-lg font-semibold">{clients.length}</div>
                  <div className="text-[11px] text-white/60">Clients</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded p-2">
                  <div className="text-lg font-semibold">{workers.length}</div>
                  <div className="text-[11px] text-white/60">Workers</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded p-2">
                  <div className="text-lg font-semibold">{tasks.length}</div>
                  <div className="text-[11px] text-white/60">Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90">Quick Actions</CardTitle>
              <CardDescription className="text-white/60">Jump to common workflows</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link href="#data" className="px-3 py-2 rounded border border-white/15 text-sm text-center hover:bg-white/5">Open Data</Link>
              <Link href="#rules" className="px-3 py-2 rounded border border-white/15 text-sm text-center hover:bg-white/5">Rule Builder</Link>
              <Link href="#validation" className="px-3 py-2 rounded border border-white/15 text-sm text-center hover:bg-white/5">Validate</Link>
              <Link href="#export" className="px-3 py-2 rounded border border-white/15 text-sm text-center hover:bg-white/5">Export</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}