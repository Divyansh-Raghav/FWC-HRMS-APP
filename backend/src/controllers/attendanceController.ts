import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import Leave from '../models/Leave';
import Employee from '../models/Employee';

export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { employeeId, month, year } = req.query;
    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (month && year) {
      const start = new Date(+year, +month - 1, 1);
      const end   = new Date(+year, +month, 0);
      query.date  = { $gte: start, $lte: end };
    }
    const records = await Attendance.find(query)
      .populate('employeeId', 'name employeeId department')
      .sort({ date: -1 });
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const clockIn = async (req: any, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const existing = await Attendance.findOne({ employeeId: employee._id, date: today });
    if (existing) return res.status(400).json({ message: 'Already clocked in today' });

    const now    = new Date();
    const hour   = now.getHours();
    const status = hour >= 10 ? 'late' : 'present';
    const record = await Attendance.create({
      employeeId: employee._id,
      date:       today,
      clockIn:    now.toTimeString().slice(0, 5),
      status,
    });
    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const clockOut = async (req: any, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const record = await Attendance.findOne({ employeeId: employee._id, date: today });
    if (!record) return res.status(404).json({ message: 'No clock-in found for today' });

    const now      = new Date();
    const clockIn  = record.clockIn || '09:00';
    const [ih, im] = clockIn.split(':').map(Number);
    const hours    = +(((now.getHours() - ih) * 60 + (now.getMinutes() - im)) / 60).toFixed(1);

    record.clockOut    = now.toTimeString().slice(0, 5);
    record.hoursWorked = hours;
    await record.save();
    res.json(record);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeaves = async (req: Request, res: Response) => {
  try {
    const { employeeId, status } = req.query;
    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (status)     query.status = status;
    const leaves = await Leave.find(query)
      .populate('employeeId', 'name employeeId department')
      .sort({ appliedOn: -1 });
    res.json(leaves);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const applyLeave = async (req: any, res: Response) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate);
    const end   = new Date(endDate);
    const days  = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const leave = await Leave.create({ employeeId: employee._id, type, startDate: start, endDate: end, days, reason });
    res.status(201).json(leave);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLeaveStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user._id },
      { new: true }
    );
    res.json(leave);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};