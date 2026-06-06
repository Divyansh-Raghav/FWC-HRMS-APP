import { Router, Request, Response } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

const router  = Router();
const storage = multer.memoryStorage();
const upload  = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/pdf', protect, upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const data = await pdfParse(req.file.buffer);
    res.json({ text: data.text, pages: data.numpages });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to parse PDF: ' + err.message });
  }
});

export default router;