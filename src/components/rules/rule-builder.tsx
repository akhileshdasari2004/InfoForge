'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import { Plus, Settings, Trash2, Edit, Power } from 'lucide-react';
import { RuleDialog } from './rule-dailog';
import { Switch } from '@/components/ui/switch';

export function RuleBuilder() {
  const { rules, updateRule, deleteRule } = useData();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const activeRules = rules.filter(r => r.active);
  const inactiveRules = rules.filter(r => !r.active);

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setShowDialog(true);
  };

  const handleToggle = (ruleId: string, active: boolean) => {
    updateRule(ruleId, { active });
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'coRun': return 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
      case 'slotRestriction': return 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30';
      case 'loadLimit': return 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30';
      case 'phaseWindow': return 'bg-pink-500/15 text-pink-300 border border-pink-500/30';
      case 'precedence': return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
      default: return 'bg-white/10 text-white/80 border border-white/20';
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rule Builder</h1>
          <p className="text-white/60">
            Create and manage business rules for your data allocation
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-purple-600 to-fuchsia-600 border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <Settings className="w-5 h-5" />
              Rule Summary
            </CardTitle>
            <CardDescription className="text-white/60">
              Overview of configured rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/80">Total Rules</span>
                <Badge variant="outline" className="border-white/20 text-white/80">{rules.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/80">Active Rules</span>
                <Badge className="bg-purple-600 text-white border-0">{activeRules.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/80">Inactive Rules</span>
                <Badge variant="secondary" className="bg-white/10 text-white/80 border-white/20">{inactiveRules.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white/90">Rule Types</CardTitle>
            <CardDescription className="text-white/60">
              Available rule categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span>Co-run Rules</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-fuchsia-400"></div>
                <span>Slot Restrictions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                <span>Load Limits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                <span>Phase Windows</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span>Precedence Rules</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white/90">Quick Actions</CardTitle>
            <CardDescription className="text-white/60">
              Common rule operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start border-white/20 text-white/80">
                <Power className="w-4 h-4 mr-2" />
                Enable All Rules
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-white/20 text-white/80">
                <Settings className="w-4 h-4 mr-2" />
                Import Rules
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-white/20 text-white/80">
                <Plus className="w-4 h-4 mr-2" />
                Rule Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {rules.length > 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white/90">Configured Rules</CardTitle>
            <CardDescription className="text-white/60">
              Manage your business rules and their settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div 
                  key={rule.id} 
                  className={`p-4 rounded-lg border ${
                    rule.active ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Switch
                          checked={rule.active}
                          onCheckedChange={(checked) => handleToggle(rule.id, checked)}
                        />
                        <span className={`px-2 py-0.5 rounded text-xs ${getRuleTypeColor(rule.type)}`}>
                          {rule.type}
                        </span>
                        <h4 className="font-medium text-white/90">{rule.name}</h4>
                      </div>
                      
                      <p className="text-sm text-white/70 mb-2">
                        {rule.description}
                      </p>
                      
                      <div className="text-xs text-white/60">
                        <strong>Parameters:</strong> {JSON.stringify(rule.parameters)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-white/20 text-white/80"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-white/20 text-white/80"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <Settings className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white/90">No Rules Configured</h3>
            <p className="text-white/60 mb-4">
              Start by creating your first business rule to control data allocation
            </p>
            <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-purple-600 to-fuchsia-600 border-0">
              <Plus className="w-4 h-4 mr-2" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      )}

      <RuleDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        editingRule={editingRule}
        onClose={() => {
          setShowDialog(false);
          setEditingRule(null);
        }}
      />
    </div>
  );
}