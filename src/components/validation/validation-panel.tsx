'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/contexts/data-context';
import { AlertTriangle, CheckCircle, RefreshCw, Zap, Sparkles, Download } from 'lucide-react';
import { useState } from 'react';
import { validateData } from '@/lib/validation';
import { toast } from 'sonner';
import { ExportDialog } from '@/components/export/export-dialog';

export function ValidationPanel() {
  const { clients, workers, tasks, validationErrors, setValidationErrors } = useData();
  const [isValidating, setIsValidating] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;
  const totalIssues = errorCount + warningCount;
  const validationScore = Math.max(0, Math.round(100 - (totalIssues * 5)));
  const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0;

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const errors = await validateData({ clients, workers, tasks });
      setValidationErrors(errors);
      toast.success(`Validation complete. Found ${errors.length} issues.`);
    } catch (error) {
      toast.error('Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const runAIValidation = async () => {
    setIsValidating(true);
    try {
      let payload = null;

      if (clients.length > 0) payload = { data: clients, dataType: 'clients' };
      else if (workers.length > 0) payload = { data: workers, dataType: 'workers' };
      else if (tasks.length > 0) payload = { data: tasks, dataType: 'tasks' };
      else {
        toast.error('No data found for AI validation');
        setIsValidating(false);
        return;
      }

      const response = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setValidationErrors(result.errors || []);
        toast.success('AI validation complete!');
      } else {
        await runValidation();
      }
    } catch (error) {
      await runValidation();
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Zap className="w-6 h-6 text-purple-400" />
          Data Validation
        </h1>
        <p className="text-white/60 mt-1">
          Comprehensive data quality analysis with AI-powered validation
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <Zap className="w-5 h-5" />
              Data Quality Score
            </CardTitle>
            <CardDescription className="text-white/60">Overall data integrity assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <div className={`text-4xl font-bold ${
                validationScore >= 80 ? 'text-green-400' : 
                validationScore >= 60 ? 'text-yellow-300' : 'text-red-400'
              }`}>
                {validationScore}%
              </div>
              <Progress value={validationScore} className="h-3" />
              <div className="flex justify-between text-xs mt-2 text-white/60">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issue Summary */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <AlertTriangle className="w-5 h-5" />
              Issue Summary
            </CardTitle>
            <CardDescription className="text-white/60">Breakdown of validation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Critical Errors</span>
                <Badge variant={errorCount > 0 ? 'destructive' : 'outline'}>{errorCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Warnings</span>
                <Badge variant={warningCount > 0 ? 'secondary' : 'outline'}>{warningCount}</Badge>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total Issues</span>
                <Badge variant="outline" className="border-white/20 text-white/80">{totalIssues}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <RefreshCw className="w-5 h-5" />
              Validation Actions
            </CardTitle>
            <CardDescription className="text-white/60">Run comprehensive validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={runValidation}
                disabled={isValidating || !hasData}
                className="w-full gap-2 border-white/20 text-white/80"
                variant="outline"
              >
                {isValidating ? <><RefreshCw className="w-4 h-4 animate-spin" />Validating...</>
                : <><CheckCircle className="w-4 h-4" />Run Standard Validation</>}
              </Button>

              <Button 
                onClick={runAIValidation}
                disabled={isValidating || !hasData}
                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 border-0"
              >
                {isValidating ? <><Sparkles className="w-4 h-4 animate-spin" />AI Validating...</>
                : <><Sparkles className="w-4 h-4" />AI-Powered Validation</>}
              </Button>

              {hasData && errorCount === 0 && (
                <Button onClick={() => setShowExport(true)} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Export Clean Data
                </Button>
              )}

              <p className="text-xs text-white/60 text-center">
                {hasData 
                  ? 'Validates data against 12+ business rules' 
                  : 'Upload data first to run validation'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Data */}
      {!hasData && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white/90">No Data to Validate</h3>
            <p className="text-white/60 mb-4">
              Upload your client, worker, or task data first to run validation checks.
            </p>
            <Button onClick={() => window.location.href = '#data'} variant="outline" className="border-white/20 text-white/80">
              Go to Data Grid
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationErrors.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white/90">
              <AlertTriangle className="w-5 h-5" />
              Validation Results
            </CardTitle>
            <CardDescription className="text-white/60">
              Detailed breakdown of all validation issues found in your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationErrors.map(error => (
                <div
                  key={error.id}
                  className={`p-4 rounded-lg border ${
                    error.type === 'error'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-yellow-500/10 border-yellow-500/30'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <Badge variant={error.type === 'error' ? 'destructive' : 'secondary'}>
                        {error.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white/80">{error.entity}</Badge>
                      <span className="font-medium text-white/90">{error.entityId}</span>
                    </div>
                    <p className={`text-sm ${error.type === 'error' ? 'text-red-300' : 'text-yellow-300'}`}>
                      {error.message}
                    </p>
                    {error.field && (
                      <p className="text-xs text-white/60">
                        Field: <span className="font-medium text-white/80">{error.field}</span>
                      </p>
                    )}
                    {error.suggestion && (
                      <div className={`mt-2 p-2 rounded text-xs ${
                        error.type === 'error'
                          ? 'bg-red-500/10 text-red-300'
                          : 'bg-yellow-500/10 text-yellow-300'
                      }`}>
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3" />
                          <strong>Suggestion:</strong>
                        </div>
                        <p>{error.suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Clear */}
      {validationErrors.length === 0 && hasData && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white/90">All Clear!</h3>
            <p className="text-white/60 mb-6">
              Your data has passed all validation checks and is ready for export.
            </p>
            <Button onClick={() => setShowExport(true)} className="gap-2">
              <Download className="w-4 h-4" />
              Export Clean Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Export Dialog */}
      <ExportDialog open={showExport} onOpenChange={setShowExport} />
    </div>
  );
}
