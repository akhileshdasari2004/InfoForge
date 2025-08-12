import mongoose, { Document, Schema } from 'mongoose';

export interface IRule extends Document {
  userId: mongoose.Types.ObjectId;
  ruleId: string;
  type: string;
  name: string;
  description: string;
  parameters: any;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RuleSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ruleId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['coRun', 'slotRestriction', 'loadLimit', 'phaseWindow', 'precedence'],
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  parameters: {
    type: Schema.Types.Mixed,
    default: {},
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

RuleSchema.index({ userId: 1, ruleId: 1 }, { unique: true });

export default mongoose.models.Rule || mongoose.model<IRule>('Rule', RuleSchema);