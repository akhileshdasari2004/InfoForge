'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import { AlertTriangle, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function TaskGrid() {
  const { tasks, setTasks, validationErrors } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});

  const taskErrors = validationErrors.filter(e => e.entity === 'task');

  const startEditing = (task: any) => {
    setEditingId(task.TaskID);
    setEditingData({ ...task });
  };

  const saveEdit = () => {
    setTasks(tasks.map(task => 
      task.TaskID === editingId ? editingData : task
    ));
    setEditingId(null);
    setEditingData({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const getRowErrors = (taskId: string) => {
    return taskErrors.filter(e => e.entityId === taskId);
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Task Data</CardTitle>
          <CardDescription>
            Upload a CSV or XLSX file containing task data to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Data</CardTitle>
        <CardDescription>
          Manage task information, requirements, and constraints
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Required Skills</TableHead>
                <TableHead>Preferred Phases</TableHead>
                <TableHead>Max Concurrent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => {
                const isEditing = editingId === task.TaskID;
                const rowErrors = getRowErrors(task.TaskID);
                const hasErrors = rowErrors.length > 0;

                return (
                  <TableRow 
                    key={task.TaskID} 
                    className={hasErrors ? 'bg-red-50/50 border-red-200' : ''}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {task.TaskID}
                        {hasErrors && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingData.TaskName || ''}
                          onChange={(e) => setEditingData({...editingData, TaskName: e.target.value})}
                          className="h-8"
                        />
                      ) : (
                        task.TaskName
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingData.Category || ''}
                          onChange={(e) => setEditingData({...editingData, Category: e.target.value})}
                          className="h-8"
                        />
                      ) : (
                        task.Category
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={editingData.Duration || ''}
                          onChange={(e) => setEditingData({...editingData, Duration: parseInt(e.target.value)})}
                          className="h-8 w-20"
                        />
                      ) : (
                        <Badge variant="outline">
                          {task.Duration} phases
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(task.RequiredSkills) ? 
                          task.RequiredSkills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          )) : 
                          <span className="text-muted-foreground text-sm">None</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(task.PreferredPhases) ? 
                          task.PreferredPhases.map((phase: number) => (
                            <Badge key={phase} variant="outline" className="text-xs">
                              {phase}
                            </Badge>
                          )) : 
                          <span className="text-muted-foreground text-sm">Any</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="1"
                          value={editingData.MaxConcurrent || ''}
                          onChange={(e) => setEditingData({...editingData, MaxConcurrent: parseInt(e.target.value)})}
                          className="h-8 w-20"
                        />
                      ) : (
                        task.MaxConcurrent || <span className="text-muted-foreground">∞</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={saveEdit}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => startEditing(task)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {taskErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-red-700">Validation Errors:</h4>
            {taskErrors.map((error) => (
              <div key={error.id} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                <strong>{error.entityId}</strong>: {error.message}
                {error.suggestion && (
                  <div className="text-xs text-red-500 mt-1">
                    Suggestion: {error.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}