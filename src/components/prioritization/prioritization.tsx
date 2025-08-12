'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import { Crown, RotateCcw, Settings } from 'lucide-react';
import { toast } from 'sonner';

export function Prioritization() {
  const { priorityWeights, setPriorityWeights } = useData();

  const updateWeight = (key: keyof typeof priorityWeights, value: number[]) => {
    setPriorityWeights({
      ...priorityWeights,
      [key]: value[0]
    });
  };

  const resetToDefaults = () => {
    setPriorityWeights({
      priorityLevel: 30,
      requestFulfillment: 25,
      fairness: 20,
      workloadBalance: 15,
      skillMatching: 10,
    });
    toast.success('Reset to default weights');
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'maximize-fulfillment':
        setPriorityWeights({
          priorityLevel: 20,
          requestFulfillment: 40,
          fairness: 15,
          workloadBalance: 15,
          skillMatching: 10,
        });
        break;
      case 'fair-distribution':
        setPriorityWeights({
          priorityLevel: 15,
          requestFulfillment: 20,
          fairness: 35,
          workloadBalance: 20,
          skillMatching: 10,
        });
        break;
      case 'minimize-workload':
        setPriorityWeights({
          priorityLevel: 25,
          requestFulfillment: 20,
          fairness: 15,
          workloadBalance: 30,
          skillMatching: 10,
        });
        break;
    }
    toast.success(`Applied ${preset.replace('-', ' ')} preset`);
  };

  const totalWeight = Object.values(priorityWeights).reduce((sum, weight) => sum + weight, 0);

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Prioritization & Weights</h1>
        <p className="text-white/60">
          Configure how the system balances different allocation criteria
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <Crown className="w-5 h-5" />
              Weight Summary
            </CardTitle>
            <CardDescription className="text-white/60">
              Current priority distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/80">Total Weight</span>
                <Badge variant="outline" className="border-white/20 text-white/80">{totalWeight}%</Badge>
              </div>
              <div className="space-y-2">
                {Object.entries(priorityWeights).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="capitalize text-white/80">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-medium text-white/90">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white/90">Quick Presets</CardTitle>
            <CardDescription className="text-white/60">
              Apply common prioritization patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start border-white/20 text-white/80"
                onClick={() => applyPreset('maximize-fulfillment')}
              >
                Maximize Fulfillment
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start border-white/20 text-white/80"
                onClick={() => applyPreset('fair-distribution')}
              >
                Fair Distribution
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start border-white/20 text-white/80"
                onClick={() => applyPreset('minimize-workload')}
              >
                Minimize Workload
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white/90">Actions</CardTitle>
            <CardDescription className="text-white/60">
              Manage your prioritization settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start border-white/20 text-white/80"
                onClick={resetToDefaults}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start border-white/20 text-white/80"
                disabled
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white/90">Priority Weights Configuration</CardTitle>
          <CardDescription className="text-white/60">
            Adjust the relative importance of each allocation criterion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-white/80">Priority Level Weight</label>
                <Badge variant="outline" className="border-white/20 text-white/80">{priorityWeights.priorityLevel}%</Badge>
              </div>
              <Slider
                value={[priorityWeights.priorityLevel]}
                onValueChange={(value) => updateWeight('priorityLevel', value)}
                max={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-white/60 mt-1">
                How much client priority levels influence allocation decisions
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-white/80">Request Fulfillment Weight</label>
                <Badge variant="outline" className="border-white/20 text-white/80">{priorityWeights.requestFulfillment}%</Badge>
              </div>
              <Slider
                value={[priorityWeights.requestFulfillment]}
                onValueChange={(value) => updateWeight('requestFulfillment', value)}
                max={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-white/60 mt-1">
                Importance of fulfilling specific task requests
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-white/80">Fairness Weight</label>
                <Badge variant="outline" className="border-white/20 text-white/80">{priorityWeights.fairness}%</Badge>
              </div>
              <Slider
                value={[priorityWeights.fairness]}
                onValueChange={(value) => updateWeight('fairness', value)}
                max={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-white/60 mt-1">
                Ensuring equitable distribution across clients and workers
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-white/80">Workload Balance Weight</label>
                <Badge variant="outline" className="border-white/20 text-white/80">{priorityWeights.workloadBalance}%</Badge>
              </div>
              <Slider
                value={[priorityWeights.workloadBalance]}
                onValueChange={(value) => updateWeight('workloadBalance', value)}
                max={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-white/60 mt-1">
                Distributing work evenly across available workers
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-white/80">Skill Matching Weight</label>
                <Badge variant="outline" className="border-white/20 text-white/80">{priorityWeights.skillMatching}%</Badge>
              </div>
              <Slider
                value={[priorityWeights.skillMatching]}
                onValueChange={(value) => updateWeight('skillMatching', value)}
                max={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-white/60 mt-1">
                Matching tasks to workers with optimal skill sets
              </p>
            </div>
          </div>

          {totalWeight !== 100 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-300">
                <strong>Note:</strong> Total weights ({totalWeight}%) should ideally sum to 100% for optimal allocation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}