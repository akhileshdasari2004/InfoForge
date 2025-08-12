'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useData } from '@/contexts/data-context';
import { toast } from 'sonner';

// 👇 Rule type options
type RuleType = 'coRun' | 'slotRestriction' | 'loadLimit' | 'phaseWindow' | 'precedence';

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRule?: any;
  onClose: () => void;
}

export function RuleDialog({ open, onOpenChange, editingRule, onClose }: RuleDialogProps) {
  const { addRule, updateRule, tasks } = useData();

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: RuleType;
    parameters: Record<string, any>;
  }>({
    name: '',
    description: '',
    type: 'coRun',
    parameters: {}
  });

  useEffect(() => {
    if (editingRule) {
      setFormData({
        name: editingRule.name,
        description: editingRule.description,
        type: editingRule.type,
        parameters: editingRule.parameters
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'coRun',
        parameters: {}
      });
    }
  }, [editingRule, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Rule name is required');
      return;
    }

    const rule = {
      id: editingRule?.id || `rule-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      parameters: formData.parameters,
      active: true
    };

    if (editingRule) {
      updateRule(editingRule.id, rule);
      toast.success('Rule updated successfully');
    } else {
      addRule(rule);
      toast.success('Rule created successfully');
    }

    onClose();
  };

  const updateParameter = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  const renderParameterInputs = () => {
    switch (formData.type) {
      case 'coRun':
        return (
          <div className="space-y-3">
            <Label>Task IDs (comma-separated)</Label>
            <Input
              placeholder="e.g., T001, T002, T003"
              value={formData.parameters.tasks?.join(', ') || ''}
              onChange={(e) =>
                updateParameter(
                  'tasks',
                  e.target.value.split(',').map((s) => s.trim())
                )
              }
            />
          </div>
        );

      case 'slotRestriction':
        return (
          <div className="space-y-3">
            <div>
              <Label>Group Type</Label>
              <Select
                value={formData.parameters.groupType || ''}
                onValueChange={(value) => updateParameter('groupType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client Group</SelectItem>
                  <SelectItem value="worker">Worker Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Group Name</Label>
              <Input
                placeholder="Group identifier"
                value={formData.parameters.groupName || ''}
                onChange={(e) => updateParameter('groupName', e.target.value)}
              />
            </div>
            <div>
              <Label>Minimum Common Slots</Label>
              <Input
                type="number"
                min="1"
                value={formData.parameters.minCommonSlots || ''}
                onChange={(e) =>
                  updateParameter('minCommonSlots', parseInt(e.target.value))
                }
              />
            </div>
          </div>
        );

      case 'loadLimit':
        return (
          <div className="space-y-3">
            <div>
              <Label>Worker Group</Label>
              <Input
                placeholder="Worker group identifier"
                value={formData.parameters.workerGroup || ''}
                onChange={(e) => updateParameter('workerGroup', e.target.value)}
              />
            </div>
            <div>
              <Label>Max Slots Per Phase</Label>
              <Input
                type="number"
                min="1"
                value={formData.parameters.maxSlotsPerPhase || ''}
                onChange={(e) =>
                  updateParameter('maxSlotsPerPhase', parseInt(e.target.value))
                }
              />
            </div>
          </div>
        );

      case 'phaseWindow':
        return (
          <div className="space-y-3">
            <div>
              <Label>Task ID</Label>
              <Select
                value={formData.parameters.taskId || ''}
                onValueChange={(value) => updateParameter('taskId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.TaskID} value={task.TaskID}>
                      {task.TaskID} - {task.TaskName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Allowed Phases (comma-separated)</Label>
              <Input
                placeholder="e.g., 1, 2, 3"
                value={formData.parameters.allowedPhases?.join(', ') || ''}
                onChange={(e) =>
                  updateParameter(
                    'allowedPhases',
                    e.target.value
                      .split(',')
                      .map((s) => parseInt(s.trim()))
                      .filter((n) => !isNaN(n))
                  )
                }
              />
            </div>
          </div>
        );

      case 'precedence':
        return (
          <div className="space-y-3">
            <div>
              <Label>Rule Priority</Label>
              <Select
                value={formData.parameters.priority?.toString() || ''}
                onValueChange={(value) =>
                  updateParameter('priority', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High (1)</SelectItem>
                  <SelectItem value="2">Medium (2)</SelectItem>
                  <SelectItem value="3">Low (3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Override Global Rules</Label>
              <Select
                value={formData.parameters.overrideGlobal?.toString() || 'false'}
                onValueChange={(value) =>
                  updateParameter('overrideGlobal', value === 'true')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
          <DialogDescription>
            Configure business rules for data allocation and processing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="Enter rule name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this rule does"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="type">Rule Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as RuleType,
                  parameters: {}
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coRun">Co-run Tasks</SelectItem>
                <SelectItem value="slotRestriction">Slot Restriction</SelectItem>
                <SelectItem value="loadLimit">Load Limit</SelectItem>
                <SelectItem value="phaseWindow">Phase Window</SelectItem>
                <SelectItem value="precedence">Precedence Override</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderParameterInputs()}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingRule ? 'Update Rule' : 'Create Rule'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
