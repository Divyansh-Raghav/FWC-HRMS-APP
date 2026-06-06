import mongoose, { Schema } from 'mongoose';

const ApplicationSchema = new Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String },
  resumeText:  { type: String },
  aiScore:     { type: Number },
  aiSummary:   { type: String },
  status:      { type: String, enum: ['applied', 'screening', 'interview', 'selected', 'rejected'], default: 'applied' },
  appliedOn:   { type: Date, default: Date.now },
});

const RecruitmentSchema = new Schema({
  title:        { type: String, required: true },
  department:   { type: String, required: true },
  description:  { type: String, required: true },
  requirements: { type: String },
  location:     { type: String, default: 'Remote' },
  type:         { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
  status:       { type: String, enum: ['open', 'closed', 'filled'], default: 'open' },
  applications: [ApplicationSchema],
  postedBy:     { type: Schema.Types.ObjectId, ref: 'Employee' },
}, { timestamps: true });

export default mongoose.model('Recruitment', RecruitmentSchema);