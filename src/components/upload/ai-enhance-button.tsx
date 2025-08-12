'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AIEnhanceButtonProps {
  data: any[];
  dataType: 'clients' | 'workers' | 'tasks';
  onEnhanced: (enhancedData: any[]) => void;
}

export function AIEnhanceButton({ data, dataType, onEnhanced }: AIEnhanceButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);

const handleEnhance = async () => {
  if (data.length === 0) {
    toast.error('No data to enhance');
    return;
  }

  setIsEnhancing(true);

  try {
    const res = await fetch('/api/ai/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, dataType }),
    });

    const { jobId } = await res.json();
    if (!jobId) throw new Error('No jobId returned');

    const toastId = toast.loading('Enhancing data with AI...'); 

    let attempts = 0;
    const maxAttempts = 60;

    const poll = async () => {
      const response = await fetch(`/api/ai/enhance?jobId=${jobId}`);
      const result = await response.json();

      if (result.status === 'done') {
        toast.success('AI enhancement complete!', { id: toastId });
        onEnhanced(result.data);
      } else if (result.status === 'error') {
        toast.error(`AI error: ${result.error}`, { id: toastId });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(poll, 5000); 
      } else {
        toast.warning('AI enhancement timed out', { id: toastId });
      }
    };

    poll();
  } catch (error) {
    console.error(error);
    toast.error('AI enhancement failed');
  } finally {
    setIsEnhancing(false);
  }
};

  return (
    <Button
      onClick={handleEnhance}
      disabled={isEnhancing || data.length === 0}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Sparkles className="w-4 h-4" />
      {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
    </Button>
  );
}
