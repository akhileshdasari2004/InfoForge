// app/api/ai/enhance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/ai-service';
import { aiJobs } from '@/lib/ai-jobs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    // In development mode, bypass authentication for testing
    let userId: string = 'test-user';
    
    // Only check authentication in production
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions);
      const sessionUserId = (session?.user as { id?: string })?.id;

      if (!sessionUserId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      userId = sessionUserId;
    }

    const { data, dataType } = await req.json();
    if (!data || !dataType) {
      return NextResponse.json({ message: 'Missing data or dataType' }, { status: 400 });
    }

    const jobId = uuidv4();
    await aiJobs.create(jobId); 

    // Background task
    (async () => {
      try {
        const limited = Array.isArray(data) ? data.slice(0, 10) : data;
        const enhanced = await aiService.enhanceData(limited, dataType);
        await aiJobs.complete(jobId, enhanced); 
      } catch (err: any) {
        await aiJobs.fail(jobId, err?.message || 'Unknown error');
      }
    })();

    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to start enhancement', error: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ message: 'Missing jobId' }, { status: 400 });
  }

  const job = await aiJobs.get(jobId); 
  if (!job) {
    return NextResponse.json({ message: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json(job); 
}
