import { Schema, model, models } from 'mongoose';
import { HIRING_STAGES } from '@/types';

const CandidateSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    appliedRole: {
      type: String,
      required: [true, 'Applied role is required'],
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
      trim: true,
    },
    hiringStage: {
      type: String,
      enum: HIRING_STAGES,
      default: 'Applied',
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient search/filtering
CandidateSchema.index({ fullName: 'text', email: 'text', appliedRole: 'text' });
CandidateSchema.index({ hiringStage: 1, createdAt: -1 });
CandidateSchema.index({ createdBy: 1, createdAt: -1 });

export const Candidate = models.Candidate || model('Candidate', CandidateSchema);
