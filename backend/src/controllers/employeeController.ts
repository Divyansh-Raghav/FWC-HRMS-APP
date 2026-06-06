import { Request, Response } from 'express';
import Employee from '../models/Employee';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name:       { $regex: search, $options: 'i' } },
        { email:      { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = department;

    const total     = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    res.json({ employees, total, page: +page, totalPages: Math.ceil(total / +limit) });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const count      = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
    const employee   = await Employee.create({ ...req.body, employeeId });
    res.status(201).json(employee);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};