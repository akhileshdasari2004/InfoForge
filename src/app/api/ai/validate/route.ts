import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateData } from '@/lib/validation';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    // In development mode, bypass authentication for testing
    let userId = 'test-user';
    
    // Only check authentication in production
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions);
      userId = (session?.user as { id?: string })?.id;

      if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    const { data, dataType } = await request.json();

    if (!data || !dataType || !Array.isArray(data)) {
      return NextResponse.json({ message: 'Invalid or missing dataset' }, { status: 400 });
    }

    const payload: any = {
      clients: [],
      workers: [],
      tasks: []
    };

    payload[dataType] = data;

    // First try AI validation
    try {
      // Define a simple schema based on data type
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          required: dataType === 'clients' ? ['ClientID', 'ClientName'] :
                   dataType === 'workers' ? ['WorkerID', 'WorkerName', 'Skills'] :
                   ['TaskID', 'TaskName', 'Duration']
        }
      };
      
      const aiValidationResult = await aiService.validateWithAI(data, schema);
      
      if (!aiValidationResult.isValid) {
        // Convert AI validation errors to the expected format
        const formattedErrors = aiValidationResult.errors?.map((error, index) => ({
          id: `ai-error-${index}`,
          type: 'error',
          entity: dataType.slice(0, -1), // Remove 's' to get singular form
          entityId: `unknown-${index}`,
          field: 'unknown',
          message: error,
          suggestion: 'Fix the data according to the error message'
        })) || [];
        
        return NextResponse.json({ errors: formattedErrors });
      }
    } catch (aiError) {
      console.error('AI Validation failed, falling back to standard validation:', aiError);
    }
    
    // Fall back to standard validation if AI validation fails or passes
    const errors = await validateData(payload);
    return NextResponse.json({ errors });
  } catch (error: any) {
    console.error('Manual Validation Error:', error);
    return NextResponse.json(
      {
        message: 'Validation failed',
        error: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
