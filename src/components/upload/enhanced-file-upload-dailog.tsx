"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Sparkles,
  FileText,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/contexts/data-context";
import { parseCSV, parseXLSX } from "@/lib/file-parser";

interface EnhancedFileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataType?: "clients" | "workers" | "tasks";
}

export function EnhancedFileUploadDialog({
  open,
  onOpenChange,
  dataType,
}: EnhancedFileUploadDialogProps) {
  const { setClients, setWorkers, setTasks } = useData();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [enhancing, setEnhancing] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  // Define expected columns for each data type
  const expectedColumns = {
    clients: {
      required: ["ClientID", "ClientName", "PriorityLevel"],
      optional: ["RequestedTaskIDs", "GroupTag", "AttributesJSON"],
    },
    workers: {
      required: [
        "WorkerID",
        "WorkerName",
        "Skills",
        "AvailableSlots",
        "MaxLoadPerPhase",
      ],
      optional: ["WorkerGroup", "QualificationLevel"],
    },
    tasks: {
      required: [
        "TaskID",
        "TaskName",
        "Category",
        "Duration",
        "RequiredSkills",
      ],
      optional: ["PreferredPhases", "MaxConcurrent"],
    },
  };

  // Utility function to normalize number arrays
  function normalizeNumberArray(input: any): number[] {
    if (Array.isArray(input)) {
      return input.map((n: any) => Number(n)).filter((n: number) => !isNaN(n));
    }
    if (typeof input === "string") {
      return input
        .split(",")
        .map((s: string) => parseInt(s.trim(), 10))
        .filter((n: number) => !isNaN(n));
    }
    if (typeof input === "number") {
      return !isNaN(input) ? [input] : [];
    }
    return [];
  }

  // Utility function to normalize string arrays
  function normalizeStringArray(input: any): string[] {
    if (Array.isArray(input)) {
      return input.filter((s: any) => typeof s === "string" && s.trim() !== "");
    }
    if (typeof input === "string") {
      return input
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s !== "");
    }
    return [];
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    onDrop: handleFileDrop,
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

        // Parse the file based on its extension
        if (fileName.endsWith(".csv")) {
          data = await parseCSV(file);
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
          data = await parseXLSX(file);
        }

        // Validate file content
        if (!data || data.length === 0) {
          toast.error("File is empty or could not be parsed.");
          setUploading(false);
          return;
        }

        // Extract headers from the first row
        const headers = Object.keys(data[0]);

        // Determine target data type if not provided
        let targetType = dataType;
        if (!targetType) {
          if (fileName.includes("client")) targetType = "clients";
          else if (fileName.includes("worker")) targetType = "workers";
          else if (fileName.includes("task")) targetType = "tasks";
          else targetType = "clients"; 
        }

        // Validate required columns (case-insensitive)
        const requiredColumns =
          expectedColumns[targetType as keyof typeof expectedColumns].required;
        const optionalColumns =
          expectedColumns[targetType as keyof typeof expectedColumns].optional;

        const missingRequiredColumns = requiredColumns.filter(
          (col) => !headers.some((h) => h.toLowerCase() === col.toLowerCase())
        );

        if (missingRequiredColumns.length > 0) {
          toast.error(
            `File structure does not match for ${targetType}. Missing required columns: ${missingRequiredColumns.join(
              ", "
            )}.`
          );
          setUploading(false);
          return;
        }

        // Validate that at least one expected column is present
        const allExpectedColumns = [...requiredColumns, ...optionalColumns];
        const hasValidColumns = headers.some((h) =>
          allExpectedColumns.some(
            (col) => col.toLowerCase() === h.toLowerCase()
          )
        );

        if (!hasValidColumns) {
          toast.error(
            `File structure does not match for ${targetType}. No expected columns found.`
          );
          setUploading(false);
          return;
        }

        setUploadedData(data);

        // Transform the data based on target type
        const transformedData = data.map((item) => {
          if (targetType === "clients") {
            return {
              ClientID: item.ClientID || item.clientId || item.id || "",
              ClientName: item.ClientName || item.clientName || item.name || "",
              PriorityLevel:
                parseInt(
                  item.PriorityLevel || item.priorityLevel || item.priority || "1",
                  10
                ) || 1,
              RequestedTaskIDs: normalizeStringArray(
                item.RequestedTaskIDs || item.requestedTaskIds || ""
              ),
              GroupTag: item.GroupTag || item.groupTag || item.group || "",
              AttributesJSON: item.AttributesJSON || item.attributesJson || {},
            };
          } else if (targetType === "workers") {
            return {
              WorkerID: item.WorkerID || item.workerId || item.id || "",
              WorkerName: item.WorkerName || item.workerName || item.name || "",
              Skills: normalizeStringArray(item.Skills || item.skills || ""),
              AvailableSlots: normalizeNumberArray(
                item.AvailableSlots || item.availableSlots || ""
              ),
              MaxLoadPerPhase:
                parseInt(
                  item.MaxLoadPerPhase || item.maxLoadPerPhase || item.maxLoad || "0",
                  10
                ) || 0,
              WorkerGroup: item.WorkerGroup || item.workerGroup || item.group || "",
              QualificationLevel:
                parseInt(
                  item.QualificationLevel ||
                    item.qualificationLevel ||
                    item.level ||
                    "1",
                  10
                ) || 1,
            };
          } else if (targetType === "tasks") {
            return {
              TaskID: item.TaskID || item.taskId || item.id || "",
              TaskName: item.TaskName || item.taskName || item.name || "",
              Category: item.Category || item.category || "",
              Duration: parseInt(item.Duration || item.duration || "1", 10) || 1,
              RequiredSkills: normalizeStringArray(
                item.RequiredSkills || item.requiredSkills || ""
              ),
              PreferredPhases: normalizeNumberArray(
                item.PreferredPhases || item.preferredPhases || ""
              ),
              MaxConcurrent:
                parseInt(
                  item.MaxConcurrent ||
                    item.maxConcurrent ||
                    item.maxConcurrency ||
                    "1",
                  10
                ) || 1,
            };
          }
          return item; 
        });

        // Update state and make API call based on target type
        if (targetType === "clients") {
          await fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transformedData),
          });
          setClients(transformedData);
          setUploadedFiles((prev) => [...prev, "clients"]);
        } else if (targetType === "workers") {
          await fetch("/api/workers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transformedData),
          });
          setWorkers(transformedData);
          setUploadedFiles((prev) => [...prev, "workers"]);
        } else if (targetType === "tasks") {
          await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transformedData),
          });
          setTasks(transformedData);
          setUploadedFiles((prev) => [...prev, "tasks"]);
        }

        processedFiles++;
        setProgress((processedFiles / totalFiles) * 100);
      }

      toast.success(
        `Successfully uploaded ${acceptedFiles.length} file(s) with ${uploadedData.length} records`
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        "Failed to upload files. Please check the file format and try again."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleAIEnhance() {
    if (uploadedData.length === 0) {
      toast.error("No data to enhance");
      return;
    }

    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: uploadedData,
          dataType: dataType || "clients",
        }),
      });

      const { jobId } = await res.json();
      if (!jobId) throw new Error("No jobId returned");

      let attempts = 0;
      const maxAttempts = 60;

      const poll = async () => {
        const response = await fetch(`/api/ai/enhance?jobId=${jobId}`);
        const result = await response.json();

        if (result.status === "done") {
          const enhanced = result.data;
          if (dataType === "clients") setClients(enhanced);
          else if (dataType === "workers") setWorkers(enhanced);
          else if (dataType === "tasks") setTasks(enhanced);
          toast.success("AI enhancement complete!");
        } else if (result.status === "error") {
          toast.error(`AI error: ${result.error}`);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000);
        } else {
          toast.warning("AI enhancement timed out");
        }
      };

      await poll();
    } catch (error) {
      console.error("AI enhancement error:", error);
      toast.error("AI enhancement failed");
    } finally {
      setEnhancing(false);
    }
  }

  const handleClose = () => {
    onOpenChange(false);
    setUploading(false);
    setProgress(0);
    setUploadedFiles([]);
    setUploadedData([]);
  };

  const getDataTypeInfo = () => {
    switch (dataType) {
      case "clients":
        return {
          title: "Client Data",
          description:
            "Upload client information including IDs, names, priority levels, and requested tasks",
          icon: Database,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        };
      case "workers":
        return {
          title: "Worker Data",
          description:
            "Upload worker information including IDs, names, skills, and availability",
          icon: Database,
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case "tasks":
        return {
          title: "Task Data",
          description:
            "Upload task information including IDs, names, requirements, and constraints",
          icon: Database,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        };
      default:
        return {
          title: "Data Files",
          description: "Upload CSV or Excel files containing your data",
          icon: FileText,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
    }
  };

  const typeInfo = getDataTypeInfo();
  const TypeIcon = typeInfo.icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={`w-8 h-8 ${typeInfo.bgColor} rounded-lg flex items-center justify-center`}
            >
              <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
            </div>
            Upload {typeInfo.title}
          </DialogTitle>
          <DialogDescription>{typeInfo.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }
              ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop your files here"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports CSV, XLSX, and XLS files
                </p>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Processing your data...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Parsing and validating your data
              </p>
            </div>
          )}

          {uploadedFiles.length > 0 && !uploading && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Upload Complete
                </h4>
                {uploadedFiles.map((fileType) => (
                  <div
                    key={fileType}
                    className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="capitalize">
                      {fileType} data uploaded successfully
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({uploadedData.length} records)
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleAIEnhance}
                disabled={enhancing}
                className="w-full gap-2"
                variant="outline"
              >
                <Sparkles className="w-4 h-4" />
                {enhancing
                  ? "Enhancing with AI..."
                  : "Enhance Data Quality with AI"}
              </Button>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Upload Guidelines
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Any CSV or Excel file format is supported</p>
              <p>• Required columns for {dataType || "data"}:</p>
              <p className="pl-2">
                {dataType
                  ? expectedColumns[
                      dataType as keyof typeof expectedColumns
                    ].required.join(", ")
                  : "Varies by data type"}
              </p>
              <p>• Optional columns for {dataType || "data"}:</p>
              <p className="pl-2">
                {dataType
                  ? expectedColumns[
                      dataType as keyof typeof expectedColumns
                    ].optional.join(", ") || "None"
                  : "Varies by data type"}
              </p>
              <p>• Data will be validated and errors highlighted</p>
              <p>• Use AI enhancement to improve data quality</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}