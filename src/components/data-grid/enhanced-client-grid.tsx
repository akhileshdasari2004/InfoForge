'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import { AlertTriangle, Edit, Save, X, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIEnhanceButton } from '@/components/upload/ai-enhance-button';
import { EnhancedFileUploadDialog } from '@/components/upload/enhanced-file-upload-dailog';

export function EnhancedClientGrid() {
  const { clients, setClients, validationErrors } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});
  const [showUpload, setShowUpload] = useState(false);

  const clientErrors = validationErrors.filter(e => e.entity === 'client');

  const startEditing = (client: any) => {
    setEditingId(client.ClientID);
    setEditingData({ ...client });
  };

  const saveEdit = () => {
    setClients(clients.map(client => 
      client.ClientID === editingId ? editingData : client
    ));
    setEditingId(null);
    setEditingData({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const getRowErrors = (clientId: string) => {
    return clientErrors.filter(e => e.entityId === clientId);
  };

  const handleEnhancedData = (enhancedData: any[]) => {
    setClients(enhancedData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Client Data
              {clients.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {clients.length} records
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Upload and manage client information and requested tasks
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {clients.length > 0 && (
              <AIEnhanceButton 
                data={clients} 
                dataType="clients" 
                onEnhanced={handleEnhancedData}
              />
            )}
            <Button onClick={() => setShowUpload(true)} size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Clients
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Client Data</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload a CSV or Excel file containing client information to get started. 
              Our AI will help validate and enhance your data automatically.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setShowUpload(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Client Data
              </Button>
              <div className="text-xs text-muted-foreground">
                Supported formats: CSV, XLSX, XLS
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {clients.length} client records loaded successfully
                </span>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requested Tasks</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const isEditing = editingId === client.ClientID;
                    const rowErrors = getRowErrors(client.ClientID);
                    const hasErrors = rowErrors.length > 0;

                    return (
                      <TableRow 
                        key={client.ClientID} 
                        className={hasErrors ? 'bg-red-50/50 border-red-200' : ''}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {client.ClientID}
                            {hasErrors && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingData.ClientName || ''}
                              onChange={(e) => setEditingData({...editingData, ClientName: e.target.value})}
                              className="h-8"
                            />
                          ) : (
                            client.ClientName
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              value={editingData.PriorityLevel || ''}
                              onChange={(e) => setEditingData({...editingData, PriorityLevel: parseInt(e.target.value)})}
                              className="h-8 w-20"
                            />
                          ) : (
                            <Badge variant={client.PriorityLevel >= 4 ? 'destructive' : 'secondary'}>
                              {client.PriorityLevel}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(client.RequestedTaskIDs) ? 
                              client.RequestedTaskIDs.map((taskId: string) => (
                                <Badge key={taskId} variant="outline" className="text-xs">
                                  {taskId}
                                </Badge>
                              )) : 
                              <span className="text-muted-foreground text-sm">None</span>
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editingData.GroupTag || ''}
                              onChange={(e) => setEditingData({...editingData, GroupTag: e.target.value})}
                              className="h-8"
                            />
                          ) : (
                            client.GroupTag || <span className="text-muted-foreground">-</span>
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
                              onClick={() => startEditing(client)}
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
        
        {clientErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Validation Issues Found:
            </h4>
            {clientErrors.map((error) => (
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
        dataType="clients"
      />
    </Card>
  );
}