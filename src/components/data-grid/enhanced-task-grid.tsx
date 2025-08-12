'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import type { Task } from '@/contexts/data-context';
import { AlertTriangle, Edit, Save, X, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIEnhanceButton } from '@/components/upload/ai-enhance-button';
import { EnhancedFileUploadDialog } from '@/components/upload/enhanced-file-upload-dailog';

export function EnhancedTaskGrid() {
  const { tasks, setTasks, validationErrors } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultEmptyTask: Task = {
    TaskID: '',
    TaskName: '',
    Category: '',
    Duration: 0,
    RequiredSkills: [],
    PreferredPhases: [],
    MaxConcurrent: 0,
  };

  const [editingData, setEditingData] = useState<Task>(defaultEmptyTask);
  const [showUpload, setShowUpload] = useState(false);

  const taskErrors = validationErrors.filter(e => e.entity === 'task');

  const startEditing = (task: Task) => {
    setEditingId(task.TaskID);
    setEditingData({ ...task });
  };

  const saveEdit = () => {
    if (
      !editingData.TaskID?.trim() ||
      !editingData.TaskName?.trim() ||
      !editingData.Category?.trim() ||
      isNaN(editingData.Duration) ||
      editingData.Duration < 1
    ) {
      alert('All required fields must be filled: TaskID, TaskName, Category, Duration >= 1');
      return;
    }

    setTasks(tasks.map(task =>
      task.TaskID === editingId ? editingData : task
    ));
    setEditingId(null);
    setEditingData(defaultEmptyTask);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(defaultEmptyTask);
  };

  const getRowErrors = (taskId: string) => {
    return taskErrors.filter(e => e.entityId === taskId);
  };

  const handleEnhancedData = (enhancedData: Task[]) => {
    setTasks(enhancedData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Task Data
              {tasks.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {tasks.length} records
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Upload and manage task information, requirements, and constraints
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {tasks.length > 0 && (
              <AIEnhanceButton 
                data={tasks} 
                dataType="tasks" 
                onEnhanced={handleEnhancedData}
              />
            )}
            <Button onClick={() => setShowUpload(true)} size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Tasks
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Task Data</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload a CSV or Excel file containing task information to get started. 
              Our AI will help validate and enhance your data automatically.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setShowUpload(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Task Data
              </Button>
              <div className="text-xs text-muted-foreground">
                Supported formats: CSV, XLSX, XLS
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {tasks.length} task records loaded successfully
                </span>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Task Name</TableHead>
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
                      <TableRow key={task.TaskID} className={hasErrors ? 'bg-red-50/50 border-red-200' : ''}>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingData.TaskID || ''}
                              onChange={(e) => setEditingData({ ...editingData, TaskID: e.target.value })}
                              className="h-8 w-24"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              {task.TaskID}
                              {hasErrors && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingData.TaskName || ''}
                              onChange={(e) => setEditingData({ ...editingData, TaskName: e.target.value })}
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
                              onChange={(e) => setEditingData({ ...editingData, Category: e.target.value })}
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
                              onChange={(e) => setEditingData({ ...editingData, Duration: parseInt(e.target.value) })}
                              className="h-8 w-20"
                            />
                          ) : (
                            <Badge variant="outline">{task.Duration} phases</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(task.RequiredSkills) && task.RequiredSkills.length > 0 ? (
                              task.RequiredSkills.map((skill: string) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(task.PreferredPhases) && task.PreferredPhases.length > 0 ? (
                              task.PreferredPhases.map((phase: number) => (
                                <Badge key={phase} variant="outline" className="text-xs">
                                  {phase}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">Any</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="1"
                              value={editingData.MaxConcurrent || ''}
                              onChange={(e) => setEditingData({ ...editingData, MaxConcurrent: parseInt(e.target.value) })}
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
                            <Button size="sm" variant="outline" onClick={() => startEditing(task)}>
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
          </>
        )}

        {taskErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Validation Issues Found:
            </h4>
            {taskErrors.map((error) => (
              <div key={error.id} className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                <div className="font-medium">{error.entityId}: {error.message}</div>
                {error.suggestion && (
                  <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Suggestion: {error.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <EnhancedFileUploadDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        dataType="tasks"
      />
    </Card>
  );
}
