import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Worker from '@/models/Worker';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

const rawWorkers = await request.json();
await dbConnect();

// Remove existing records for this user
await Worker.deleteMany({ userId });

const invalidWorkers: any[] = [];

const workersToInsert = rawWorkers
  .map((worker: any, idx: number) => {
    const workerId = worker.WorkerID || worker.workerId || worker.id || `auto-worker-${idx}`;
const workerName = worker.WorkerName || worker.workerName || `Unnamed Worker ${idx + 1}`;

    // Validation for required fields
    if (!workerId || !workerName) {
      invalidWorkers.push({ index: idx, original: worker });
      return null;
    }

    // Normalize Skills
    const parsedSkills =
      typeof worker.Skills === 'string'
        ? worker.Skills.split(',').map((s: string) => s.trim())
        : Array.isArray(worker.Skills)
        ? worker.Skills.map((s: any) => String(s).trim())
        : [];

    // Normalize AvailableSlots
    const parsedAvailableSlots =
      typeof worker.AvailableSlots === 'string'
        ? worker.AvailableSlots.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n))
        : Array.isArray(worker.AvailableSlots)
        ? worker.AvailableSlots.map((n: any) => Number(n)).filter((n: number) => !isNaN(n))
        : [];

    return {
      userId,
      workerId,
      workerName,
      skills: parsedSkills,
      availableSlots: parsedAvailableSlots,
      maxLoadPerPhase: Number(worker.MaxLoadPerPhase || 0),
      workerGroup: worker.WorkerGroup || '',
      qualificationLevel: Number(worker.QualificationLevel || 1),
    };
  })
  .filter(Boolean); 


if (invalidWorkers.length > 0) {
  return NextResponse.json(
    {
      message: 'Some workers are missing required fields: workerId or workerName',
      invalidWorkers,
    },
    { status: 400 }
  );
}

console.log('✅ Parsed workers for insert:', workersToInsert);

const insertedWorkers = await Worker.insertMany(workersToInsert);

return NextResponse.json(insertedWorkers, { status: 201 });

  } catch (err) {
    console.error('POST /api/workers error:', err);
    return NextResponse.json(
      { message: 'Internal server error', error: String(err) },
      { status: 500 }
    );
  }
}
