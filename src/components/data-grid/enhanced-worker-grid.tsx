'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import {
  AlertTriangle,
  Edit,
  Save,
  X,
  Upload,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AIEnhanceButton } from '@/components/upload/ai-enhance-button';
import { EnhancedFileUploadDialog } from '@/components/upload/enhanced-file-upload-dailog';
import type { Worker } from '@/contexts/data-context';

// Default empty worker object to reset form state
const defaultEmptyWorker: Worker = {
  WorkerID: '',
  WorkerName: '',
  Skills: [],
  AvailableSlots: [],
  MaxLoadPerPhase: 0,
  WorkerGroup: '',
  QualificationLevel: 0, // ✅ Add this line
};

export function EnhancedWorkerGrid() {
  const { workers, setWorkers, validationErrors } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Worker>(defaultEmptyWorker);
  const [showUpload, setShowUpload] = useState(false);

  const workerErrors = validationErrors.filter((e) => e.entity === 'worker');

  const startEditing = (worker: Worker) => {
    setEditingId(worker.WorkerID);
    setEditingData({ ...worker });
  };

  const saveEdit = () => {
    setWorkers(
      workers.map((worker) =>
        worker.WorkerID === editingId ? editingData : worker
      )
    );
    setEditingId(null);
    setEditingData(defaultEmptyWorker);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData(defaultEmptyWorker);
  };

  const getRowErrors = (workerId: string) => {
    return workerErrors.filter((e) => e.entityId === workerId);
  };

  const handleEnhancedData = (enhancedData: Worker[]) => {
    setWorkers(enhancedData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Worker Data
              {workers.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {workers.length} records
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Upload and manage worker information, skills, and availability
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {workers.length > 0 && (
              <AIEnhanceButton
                data={workers}
                dataType="workers"
                onEnhanced={handleEnhancedData}
              />
            )}
            <Button onClick={() => setShowUpload(true)} size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Workers
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {workers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Worker Data</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload a CSV or Excel file containing worker information to get
              started. Our AI will help validate and enhance your data
              automatically.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setShowUpload(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Worker Data
              </Button>
              <div className="text-xs text-muted-foreground">
                Supported formats: CSV, XLSX, XLS
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {workers.length} worker records loaded successfully
                </span>
              </div>
            </div>

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
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  WorkerName: e.target.value,
                                })
                              }
                              className="h-8"
                            />
                          ) : (
                            worker.WorkerName
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(worker.Skills) ? (
                              worker.Skills.map((skill: string) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                None
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(worker.AvailableSlots) ? (
                              worker.AvailableSlots.map((slot: number) => (
                                <Badge
                                  key={slot}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {slot}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                None
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={editingData.MaxLoadPerPhase || ''}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  MaxLoadPerPhase: parseInt(e.target.value),
                                })
                              }
                              className="h-8 w-20"
                            />
                          ) : (
                            worker.MaxLoadPerPhase || (
                              <span className="text-muted-foreground">-</span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingData.WorkerGroup || ''}
                              onChange={(e) =>
                                setEditingData({
                                  ...editingData,
                                  WorkerGroup: e.target.value,
                                })
                              }
                              className="h-8"
                            />
                          ) : (
                            worker.WorkerGroup || (
                              <span className="text-muted-foreground">-</span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={saveEdit}
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                              >
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
          </>
        )}

        {workerErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Validation Issues Found:
            </h4>
            {workerErrors.map((error) => (
              <div
                key={error.id}
                className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200"
              >
                <div className="font-medium">
                  {error.entityId}: {error.message}
                </div>
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
        dataType="workers"
      />
    </Card>
  );
}
