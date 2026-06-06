import { Request, Response } from 'express';
import Recruitment from '../models/Recruitment';
import Employee from '../models/Employee';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Recruitment.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createJob = async (req: any, res: Response) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    const job = await Recruitment.create({ ...req.body, postedBy: employee?._id });
    res.status(201).json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Recruitment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const addApplication = async (req: Request, res: Response) => {
  try {
    const job = await Recruitment.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.applications.push(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  try {
    const job = await Recruitment.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const app = job.applications.id(req.params.appId as string); // ← fix: cast to string
    if (!app) return res.status(404).json({ message: 'Application not found' });
    Object.assign(app, req.body);
    await job.save();
    res.json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};