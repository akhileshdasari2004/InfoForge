import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: string;
  clientName: string;
  priorityLevel: number;
  requestedTaskIds: string[];
  groupTag: string;
  attributesJson: any;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  priorityLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  requestedTaskIds: [{
    type: String,
  }],
  groupTag: {
    type: String,
  },
  attributesJson: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

ClientSchema.index({ userId: 1, clientId: 1 }, { unique: true });

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);