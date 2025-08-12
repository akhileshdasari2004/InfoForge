import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const rawTasks = await request.json();
    await dbConnect();

    await Task.deleteMany({ userId });

    const invalidTasks: any[] = [];

    const tasksToInsert = rawTasks.map((task: any, idx: number) => {
      // Debug log for each task
      console.log(`🔍 Task [${idx}]:`, task);

      const taskId = task.TaskID || task.taskId || task.id;
      const taskName = task.TaskName || task.taskName;
      const category = task.Category || task.category;
      const duration = Number(task.Duration || task.duration);

      // Check if any required field is missing or invalid
      if (!taskId || !taskName || !category || isNaN(duration) || duration < 1) {
        invalidTasks.push({ index: idx, original: task });
        return null;
      }

      return {
        userId,
        taskId,
        taskName,
        category,
        duration,
        requiredSkills: Array.isArray(task.RequiredSkills) ? task.RequiredSkills : [],
        preferredPhases: Array.isArray(task.PreferredPhases)
          ? task.PreferredPhases.map((p: any) => Number(p)).filter((p: any) => !isNaN(p))
          : [],
        maxConcurrent: Number(task.MaxConcurrent || 1),
      };
    }).filter(Boolean);

    if (invalidTasks.length > 0) {
      console.warn('Invalid tasks:', invalidTasks);
      return NextResponse.json(
        {
          message: 'Some tasks are missing required fields: taskId, taskName, category, or duration',
          invalidTasks,
        },
        { status: 400 }
      );
    }

    const insertedTasks = await Task.insertMany(tasksToInsert);
    return NextResponse.json(insertedTasks, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
