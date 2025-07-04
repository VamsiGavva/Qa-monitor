import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  unitTestLabel: string;
  tags: string[];
  description: string;
  testCases: string[];
  notes?: string;
  attachedImages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  unitTestLabel: {
    type: String,
    required: [true, 'Unit Test Label is required'],
    trim: true,
    unique: true,
  },
  tags: [{
    type: String,
    required: true,
    trim: true,
  }],
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  testCases: [{
    type: String,
    required: true,
    trim: true,
  }],
  notes: {
    type: String,
    trim: true,
  },
  attachedImages: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Add indexes for better query performance
TaskSchema.index({ unitTestLabel: 1 });
TaskSchema.index({ tags: 1 });
TaskSchema.index({ createdAt: -1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);