import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'admin'
  | 'senior_manager'
  | 'hr_recruiter'
  | 'employee'
  | 'applicant';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  employeeId: string;
  isActive: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: [
        'admin',
        'senior_manager',
        'hr_recruiter',
        'employee',
        'applicant',
      ],
      default: 'employee',
    },
    department: { type: String, default: 'General' },
    employeeId: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
});

/// Auto-generate employeeId
UserSchema.pre('save', async function () {
  if (!this.employeeId) {
    const count = await mongoose.model('User').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
});

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);