import mongoose, { Schema } from 'mongoose';

const AttendanceSchema = new Schema({
  employeeId:  { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  date:        { type: Date, required: true },
  clockIn:     { type: String },
  clockOut:    { type: String },
  status:      { type: String, enum: ['present', 'absent', 'late', 'half_day'], default: 'present' },
  hoursWorked: { type: Number, default: 0 },
  note:        { type: String },
}, { timestamps: true });

export default mongoose.model('Attendance', AttendanceSchema);