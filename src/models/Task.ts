import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: string;
  taskName: string;
  category: string;
  duration: number;
  requiredSkills: string[];
  preferredPhases: number[];
  maxConcurrent: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: String,
    required: true,
  },
  taskName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  requiredSkills: [{
    type: String,
  }],
  preferredPhases: [{
    type: Number,
  }],
  maxConcurrent: {
    type: Number,
  },
}, {
  timestamps: true,
});

TaskSchema.index({ userId: 1, taskId: 1 }, { unique: true });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);