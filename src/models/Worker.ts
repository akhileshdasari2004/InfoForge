import mongoose, { Document, Schema } from 'mongoose';

export interface IWorker extends Document {
  userId: mongoose.Types.ObjectId;
  workerId: string;
  workerName: string;
  skills: string[];
  availableSlots: number[];
  maxLoadPerPhase: number;
  workerGroup: string;
  qualificationLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workerId: {
    type: String,
    required: true,
  },
  workerName: {
    type: String,
    required: true,
  },
  skills: [{
    type: String,
  }],
  availableSlots: [{
    type: Number,
  }],
  maxLoadPerPhase: {
    type: Number,
  },
  workerGroup: {
    type: String,
  },
  qualificationLevel: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

WorkerSchema.index({ userId: 1, workerId: 1 }, { unique: true });

export default mongoose.models.Worker || mongoose.model<IWorker>('Worker', WorkerSchema);