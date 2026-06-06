import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: ['http://localhost:3000', 'https://fwc-hrms-app-xo39.vercel.app'] }));



app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

mongoose.connect(process.env.MONGODB_URI || '')
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Import routes AFTER express is fully ready
    const { default: authRoutes }     = await import('./routes/auth');
    const { default: employeeRoutes } = await import('./routes/employees');
    const { default: attendanceRoutes } = await import('./routes/attendance');
    const { default: payrollRoutes }     = await import('./routes/payroll');
    const { default: performanceRoutes } = await import('./routes/performance');
    const { default: recruitmentRoutes } = await import('./routes/recruitment');
    const { default: uploadRoutes } = await import('./routes/upload');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/employees', employeeRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/payroll',     payrollRoutes);
    app.use('/api/performance', performanceRoutes);
    app.use('/api/recruitment', recruitmentRoutes);
    app.use('/api/upload', uploadRoutes);

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log('✅ Routes registered: /api/auth, /api/employees, /api/attendance');
   
    });
  })
  .catch((err) => console.error('❌ MongoDB error:', err));
