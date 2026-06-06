import { Request, Response } from 'express';
import Performance from '../models/Performance';
import Employee from '../models/Employee';

export const getReviews = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.query;
    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    const reviews = await Performance.find(query)
      .populate('employeeId', 'name employeeId department designation')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createReview = async (req: any, res: Response) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    const review   = await Performance.create({ ...req.body, reviewerId: employee?._id });
    res.status(201).json(review);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Performance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(review);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};