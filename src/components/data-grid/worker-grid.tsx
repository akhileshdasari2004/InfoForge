'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import { AlertTriangle, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WorkerGrid() {
  const { workers, setWorkers, validationErrors } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});

  const workerErrors = validationErrors.filter(e => e.entity === 'worker');

  const startEditing = (worker: any) => {
    setEditingId(worker.WorkerID);
    setEditingData({ ...worker });
  };

  const saveEdit = () => {
    setWorkers(workers.map(worker => 
      worker.WorkerID === editingId ? editingData : worker
    ));
    setEditingId(null);
    setEditingData({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const getRowErrors = (workerId: string) => {
    return workerErrors.filter(e => e.entityId === workerId);
  };

  if (workers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Worker Data</CardTitle>
          <CardDescription>
            Upload a CSV or XLSX file containing worker data to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker Data</CardTitle>
        <CardDescription>
          Manage worker information, skills, and availability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Available Slots</TableHead>
                <TableHead>Max Load</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => {
                const isEditing = editingId === worker.WorkerID;
                const rowErrors = getRowErrors(worker.WorkerID);
                const hasErrors = rowErrors.length > 0;

                return (
                  <TableRow 
                    key={worker.WorkerID} 
                    className={hasErrors ? 'bg-red-50/50 border-red-200' : ''}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {worker.WorkerID}
                        {hasErrors && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingData.WorkerName || ''}
                          onChange={(e) => setEditingData({...editingData, WorkerName: e.target.value})}
                          className="h-8"
                        />
                      ) : (
                        worker.WorkerName
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(worker.Skills) ? 
                          worker.Skills.map((skill: string) => (
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
                        {Array.isArray(worker.AvailableSlots) ? 
                          worker.AvailableSlots.map((slot: number) => (
                            <Badge key={slot} variant="outline" className="text-xs">
                              {slot}
                            </Badge>
                          )) : 
                          <span className="text-muted-foreground text-sm">None</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={editingData.MaxLoadPerPhase || ''}
                          onChange={(e) => setEditingData({...editingData, MaxLoadPerPhase: parseInt(e.target.value)})}
                          className="h-8 w-20"
                        />
                      ) : (
                        worker.MaxLoadPerPhase || <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editingData.WorkerGroup || ''}
                          onChange={(e) => setEditingData({...editingData, WorkerGroup: e.target.value})}
                          className="h-8"
                        />
                      ) : (
                        worker.WorkerGroup || <span className="text-muted-foreground">-</span>
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
                          onClick={() => startEditing(worker)}
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
        
        {workerErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-red-700">Validation Errors:</h4>
            {workerErrors.map((error) => (
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