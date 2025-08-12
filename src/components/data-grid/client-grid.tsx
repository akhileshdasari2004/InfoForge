'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/data-context';
import { AlertTriangle, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ClientGrid() {
  const { clients, setClients, validationErrors } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>({});

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

  if (clients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Client Data</CardTitle>
          <CardDescription>
            Upload a CSV or XLSX file containing client data to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Data</CardTitle>
        <CardDescription>
          Manage client information and requested tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
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
        
        {clientErrors.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-red-700">Validation Errors:</h4>
            {clientErrors.map((error) => (
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