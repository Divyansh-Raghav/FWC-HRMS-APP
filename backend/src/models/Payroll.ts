import mongoose, { Schema } from 'mongoose';

const PayrollSchema = new Schema({
  employeeId:    { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  month:         { type: Number, required: true },
  year:          { type: Number, required: true },
  basicSalary:   { type: Number, required: true },
  allowances:    { type: Number, default: 0 },
  deductions:    { type: Number, default: 0 },
  tax:           { type: Number, default: 0 },
  netSalary:     { type: Number, required: true },
  status:        { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidOn:        { type: Date },
}, { timestamps: true });

export default mongoose.model('Payroll', PayrollSchema);
