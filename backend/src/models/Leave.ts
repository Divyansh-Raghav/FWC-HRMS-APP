import mongoose, { Schema } from 'mongoose';

const LeaveSchema = new Schema({
  employeeId:  { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  type:        { type: String, enum: ['casual', 'sick', 'earned', 'unpaid'], required: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  days:        { type: Number, required: true },
  reason:      { type: String, required: true },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy:  { type: Schema.Types.ObjectId, ref: 'Employee' },
  appliedOn:   { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Leave', LeaveSchema);