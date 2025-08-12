'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/data-context';
import { parseCSV, parseXLSX } from '@/lib/file-parser';
import { validateData } from '@/lib/validation';

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FileUploadDialog({ open, onOpenChange }: FileUploadDialogProps) {
  const { setClients, setWorkers, setTasks, setValidationErrors } = useData();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    onDrop: handleFileDrop
  });

  async function handleFileDrop(acceptedFiles: File[]) {
    setUploading(true);
    setProgress(0);
    
    try {
      const totalFiles = acceptedFiles.length;
      let processedFiles = 0;

      for (const file of acceptedFiles) {
        const fileName = file.name.toLowerCase();
        let data: any[] = [];

        // Parse file based on extension
        if (fileName.endsWith('.csv')) {
          data = await parseCSV(file);
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          data = await parseXLSX(file);
        }

        // Determine data type and set appropriate data
        if (fileName.includes('client')) {
          setClients(data);
          setUploadedFiles(prev => [...prev, 'clients']);
        } else if (fileName.includes('worker')) {
          setWorkers(data);
          setUploadedFiles(prev => [...prev, 'workers']);
        } else if (fileName.includes('task')) {
          setTasks(data);
          setUploadedFiles(prev => [...prev, 'tasks']);
        }

        processedFiles++;
        setProgress((processedFiles / totalFiles) * 100);
      }

      // Run validation after all files are processed
      const errors = await validateData({ clients: [], workers: [], tasks: [] });
      setValidationErrors(errors);

      toast.success(`Successfully uploaded ${acceptedFiles.length} file(s)`);
      
      // Auto-close dialog after successful upload
      setTimeout(() => {
        onOpenChange(false);
        setUploading(false);
        setProgress(0);
        setUploadedFiles([]);
      }, 1500);
      
    } catch (error) {
      console.log(error)
      toast.error('Failed to upload files');
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Data Files</DialogTitle>
          <DialogDescription>
            Upload CSV or XLSX files for clients, workers, and tasks data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV or XLSX files (clients, workers, tasks)
                </p>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing files...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {uploadedFiles.length > 0 && !uploading && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploaded Files:</h4>
              {uploadedFiles.map((fileType) => (
                <div key={fileType} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="capitalize">{fileType}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              File Naming Guidelines
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Files should contain &apos;client&apos;, &apos;worker&apos;, or &apos;task&apos; in their names</p>
              <p>• Supported formats: CSV, XLSX, XLS</p>
              <p>• Files will be automatically validated after upload</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}