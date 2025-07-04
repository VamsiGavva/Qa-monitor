import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    minlength: [1, 'Tag name must be at least 1 character'],
    maxlength: [50, 'Tag name cannot exceed 50 characters'],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Add indexes
TagSchema.index({ name: 1 });
TagSchema.index({ createdBy: 1 });
TagSchema.index({ isActive: 1 });

export default mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema);