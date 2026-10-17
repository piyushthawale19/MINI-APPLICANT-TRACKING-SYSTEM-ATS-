import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Never return password hash in JSON responses
UserSchema.set('toJSON', {
  transform(_, ret: Record<string, any>) {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = models.User || model('User', UserSchema);
