import mongoose, { Schema } from 'mongoose';

const PerformanceSchema = new Schema({
  employeeId:  { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  reviewerId:  { type: Schema.Types.ObjectId, ref: 'Employee' },
  period:      { type: String, required: true },
  goals:       [{ title: String, target: String, achieved: Boolean }],
  rating:      { type: Number, min: 1, max: 5 },
  feedback:    { type: String },
  aiSummary:   { type: String },
  status:      { type: String, enum: ['draft', 'submitted', 'reviewed'], default: 'draft' },
}, { timestamps: true });

export default mongoose.model('Performance', PerformanceSchema);