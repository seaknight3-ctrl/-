import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import analysisRouter from './routes/analysis.js';

// ES Module에서 __dirname 사용을 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.use('/api/analysis', analysisRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SME Consulting Analyzer',
    version: '1.0.0'
  });
});

// React SPA를 위한 fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Server start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 중소기업 경영컨설팅 자동 분석 시스템                  ║
║                                                           ║
║  서버 주소: http://localhost:${PORT}                       ║
║  환경: ${process.env.NODE_ENV || 'development'}                                      ║
║  API 엔드포인트: http://localhost:${PORT}/api              ║
║                                                           ║
║  📊 준비 완료! PDF를 업로드하여 분석을 시작하세요.          ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
