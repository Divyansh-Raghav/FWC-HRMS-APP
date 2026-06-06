import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Employee from '../models/Employee';

dotenv.config();

type RoleType =
  | 'admin'
  | 'senior_manager'
  | 'hr_recruiter'
  | 'employee'
  | 'applicant';

const employees: {
  name: string;
  email: string;
  department: string;
  designation: string;
  salary: number;
  role: RoleType;
}[] = [
  { name: 'Admin User', email: 'admin@hrms.com', department: 'Management', designation: 'System Admin', salary: 90000, role: 'admin' },
  { name: 'Senior Manager', email: 'manager@hrms.com', department: 'Operations', designation: 'Senior Manager', salary: 75000, role: 'senior_manager' },
  { name: 'HR Recruiter', email: 'hr@hrms.com', department: 'Human Resources', designation: 'HR Recruiter', salary: 55000, role: 'hr_recruiter' },
  { name: 'John Employee', email: 'john@hrms.com', department: 'Engineering', designation: 'Software Engineer', salary: 60000, role: 'employee' },
  { name: 'Priya Sharma', email: 'priya@hrms.com', department: 'Engineering', designation: 'Frontend Developer', salary: 58000, role: 'employee' },
  { name: 'Rahul Verma', email: 'rahul@hrms.com', department: 'Sales', designation: 'Sales Executive', salary: 45000, role: 'employee' },
  { name: 'Anjali Singh', email: 'anjali@hrms.com', department: 'Human Resources', designation: 'HR Executive', salary: 48000, role: 'employee' },
  { name: 'Vikram Patel', email: 'vikram@hrms.com', department: 'Operations', designation: 'Operations Lead', salary: 65000, role: 'employee' },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || '');

  await User.deleteMany({});
  await Employee.deleteMany({});

  // 👤 Applicant (ONLY in User collection)
  await User.create({
    name: 'Job Applicant',
    email: 'applicant@hrms.com',
    password: 'password123',
    role: 'applicant',
    department: 'External',
  });

  // 👨‍💼 Seed Users + Employees
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];

    await User.create({
      name: emp.name,
      email: emp.email,
      password: 'password123',
      role: emp.role,
      department: emp.department,
    });

    await Employee.create({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      salary: emp.salary,

      employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      joinDate: new Date(
        2023,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      ),
      status: 'active',

      role: emp.role === 'applicant' ? 'employee' : emp.role, // safety fix
    });
  }

  console.log('✅ Seeded employees + 1 applicant successfully');
  process.exit(0);
};

seed().catch(console.error);