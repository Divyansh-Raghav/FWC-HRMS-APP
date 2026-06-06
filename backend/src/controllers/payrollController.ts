import { Request, Response } from 'express';
import Payroll from '../models/Payroll';
import Employee from '../models/Employee';

export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const { employeeId, month, year } = req.query;
    const query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (month) query.month = +month;
    if (year)  query.year  = +year;
    const payrolls = await Payroll.find(query)
      .populate('employeeId', 'name employeeId department designation')
      .sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const generatePayroll = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;
    const employees = await Employee.find({ status: 'active' });
    const results = [];

    for (const emp of employees) {
      const existing = await Payroll.findOne({ employeeId: emp._id, month, year });
      if (existing) continue;

      const basicSalary = emp.salary || 30000;
      const allowances  = Math.round(basicSalary * 0.2);
      const tax         = Math.round(basicSalary * 0.1);
      const deductions  = Math.round(basicSalary * 0.05);
      const netSalary   = basicSalary + allowances - tax - deductions;

      const payroll = await Payroll.create({
        employeeId: emp._id, month, year,
        basicSalary, allowances, deductions, tax, netSalary,
      });
      results.push(payroll);
    }
    res.status(201).json({ message: `Generated ${results.length} payslips`, results });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsPaid = async (req: Request, res: Response) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidOn: new Date() },
      { new: true }
    );
    res.json(payroll);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};