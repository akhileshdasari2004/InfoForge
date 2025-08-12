'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/contexts/data-context';
import { Download, FileSpreadsheet, Settings} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { clients, workers, tasks, rules, priorityWeights, validationErrors } = useData();
  const [exportOptions, setExportOptions] = useState({
    clients: true,
    workers: true,
    tasks: true,
    rules: true,
    validationReport: false
  });
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const hasErrors = errorCount > 0;

  const handleExport = async () => {
    if (hasErrors) {
      toast.error('Please fix all validation errors before exporting');
      return;
    }

    setExporting(true);
    setProgress(0);

    try {
      const workbook = XLSX.utils.book_new();
      let exportedFiles = 0;
      const totalFiles = Object.values(exportOptions).filter(Boolean).length;

      // Export clients
      if (exportOptions.clients && clients.length > 0) {
        const clientsWS = XLSX.utils.json_to_sheet(clients);
        XLSX.utils.book_append_sheet(workbook, clientsWS, 'Clients');
        exportedFiles++;
        setProgress((exportedFiles / totalFiles) * 90);
      }

      // Export workers
      if (exportOptions.workers && workers.length > 0) {
        const workersWS = XLSX.utils.json_to_sheet(workers);
        XLSX.utils.book_append_sheet(workbook, workersWS, 'Workers');
        exportedFiles++;
        setProgress((exportedFiles / totalFiles) * 90);
      }

      // Export tasks
      if (exportOptions.tasks && tasks.length > 0) {
        const tasksWS = XLSX.utils.json_to_sheet(tasks);
        XLSX.utils.book_append_sheet(workbook, tasksWS, 'Tasks');
        exportedFiles++;
        setProgress((exportedFiles / totalFiles) * 90);
      }

      // Export validation report
      if (exportOptions.validationReport && validationErrors.length > 0) {
        const validationWS = XLSX.utils.json_to_sheet(validationErrors);
        XLSX.utils.book_append_sheet(workbook, validationWS, 'Validation Report');
        exportedFiles++;
        setProgress((exportedFiles / totalFiles) * 90);
      }

      // Save workbook
      XLSX.writeFile(workbook, `data-alchemist-export-${new Date().toISOString().split('T')[0]}.xlsx`);

      // Export rules configuration if selected
      if (exportOptions.rules) {
        const rulesConfig = {
          rules: rules.filter(r => r.active),
          priorityWeights,
          exportDate: new Date().toISOString(),
          metadata: {
            totalClients: clients.length,
            totalWorkers: workers.length,
            totalTasks: tasks.length,
            validationErrors: validationErrors.length
          }
        };

        const rulesBlob = new Blob([JSON.stringify(rulesConfig, null, 2)], {
          type: 'application/json'
        });
        
        const rulesUrl = URL.createObjectURL(rulesBlob);
        const rulesLink = document.createElement('a');
        rulesLink.href = rulesUrl;
        rulesLink.download = `rules-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(rulesLink);
        rulesLink.click();
        document.body.removeChild(rulesLink);
        URL.revokeObjectURL(rulesUrl);
      }

      setProgress(100);
      toast.success('Export completed successfully!');
      
      setTimeout(() => {
        onOpenChange(false);
        setExporting(false);
        setProgress(0);
      }, 1500);

    } catch (error) {
      console.log(error)
      toast.error('Export failed');
      setExporting(false);
      setProgress(0);
    }
  };

  const toggleOption = (option: keyof typeof exportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Export your cleaned and validated data for downstream processing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasErrors && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> {errorCount} validation error(s) found. 
                Please fix all errors before exporting.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Export Options</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clients"
                  checked={exportOptions.clients}
                  onCheckedChange={() => toggleOption('clients')}
                />
                <label htmlFor="clients" className="text-sm">
                  Clients Data ({clients.length} records)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="workers"
                  checked={exportOptions.workers}
                  onCheckedChange={() => toggleOption('workers')}
                />
                <label htmlFor="workers" className="text-sm">
                  Workers Data ({workers.length} records)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tasks"
                  checked={exportOptions.tasks}
                  onCheckedChange={() => toggleOption('tasks')}
                />
                <label htmlFor="tasks" className="text-sm">
                  Tasks Data ({tasks.length} records)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rules"
                  checked={exportOptions.rules}
                  onCheckedChange={() => toggleOption('rules')}
                />
                <label htmlFor="rules" className="text-sm">
                  Rules Configuration ({rules.filter(r => r.active).length} active rules)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validation"
                  checked={exportOptions.validationReport}
                  onCheckedChange={() => toggleOption('validationReport')}
                />
                <label htmlFor="validation" className="text-sm">
                  Validation Report ({validationErrors.length} issues)
                </label>
              </div>
            </div>
          </div>

          {exporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Exporting files...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Export Format
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Data will be exported as Excel (.xlsx) format</p>
              <p>• Rules configuration will be exported as JSON</p>
              <p>• All exported data is validated and cleaned</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exporting || hasErrors}>
              {exporting ? (
                <>
                  <Settings className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}