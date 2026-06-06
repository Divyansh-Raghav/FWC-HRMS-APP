import mongoose, { Schema } from 'mongoose';

const EmployeeSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User' },
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  phone:        { type: String },
  department:   { type: String, required: true },
  designation:  { type: String, required: true },
  employeeId:   { type: String, unique: true },
  joinDate:     { type: Date, default: Date.now },
  salary:       { type: Number, default: 0 },
  status:       { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  role:         { type: String, enum: ['admin', 'senior_manager', 'hr_recruiter', 'employee'], default: 'employee' },
  address:      { type: String },
  avatar:       { type: String },
}, { timestamps: true });

export default mongoose.model('Employee', EmployeeSchema);