import { redis } from './redis'; 

type JobStatus = 'pending' | 'done' | 'error';

interface AIJob {
  status: JobStatus;
  data?: any;
  error?: string;
}

// In-memory store for development mode
const inMemoryJobs = new Map<string, string>();

export const aiJobs = {
  async create(jobId: string) {
    if (process.env.NODE_ENV === 'development') {
      inMemoryJobs.set(`job:${jobId}`, JSON.stringify({ status: 'pending' }));
    } else {
      await redis.set(`job:${jobId}`, JSON.stringify({ status: 'pending' }), 'EX', 3600);
    }
  },
  async complete(jobId: string, data: any) {
    if (process.env.NODE_ENV === 'development') {
      inMemoryJobs.set(`job:${jobId}`, JSON.stringify({ status: 'done', data }));
    } else {
      await redis.set(`job:${jobId}`, JSON.stringify({ status: 'done', data }), 'EX', 3600);
    }
  },
  async fail(jobId: string, error: string) {
    if (process.env.NODE_ENV === 'development') {
      inMemoryJobs.set(`job:${jobId}`, JSON.stringify({ status: 'error', error }));
    } else {
      await redis.set(`job:${jobId}`, JSON.stringify({ status: 'error', error }), 'EX', 3600);
    }
  },
  async get(jobId: string): Promise<AIJob | null> {
    if (process.env.NODE_ENV === 'development') {
      const result = inMemoryJobs.get(`job:${jobId}`);
      return result ? JSON.parse(result) : null;
    } else {
      const result = await redis.get(`job:${jobId}`);
      return result ? JSON.parse(result) : null;
    }
  },
};
