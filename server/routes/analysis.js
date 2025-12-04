import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import pdfParser from '../services/pdfParser.js';
import aiAnalyzer from '../services/aiAnalyzer.js';
import reportGenerator from '../services/reportGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer 설정 - PDF 파일 업로드
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PDF 파일만 업로드 가능합니다.'));
    }
  }
});

/**
 * POST /api/analysis/upload
 * PDF 파일 업로드 및 분석
 */
router.post('/upload', upload.array('files', 5), async (req, res) => {
  const uploadedFiles = req.files;

  try {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'PDF 파일을 업로드해주세요.'
      });
    }

    console.log(`📄 ${uploadedFiles.length}개 파일 업로드 완료`);

    // 1. PDF 파싱
    console.log('🔍 PDF 텍스트 추출 중...');
    const parsedData = await pdfParser.parseMultiplePDFs(uploadedFiles);

    // 2. AI 분석
    console.log('🤖 AI 분석 시작...');
    const analysisResult = await aiAnalyzer.analyze(parsedData);

    // 3. 업로드된 파일 삭제 (보안)
    console.log('🗑️  임시 파일 삭제 중...');
    await Promise.all(
      uploadedFiles.map(file => fs.unlink(file.path).catch(err => console.error(err)))
    );

    console.log('✅ 분석 완료!');

    res.json({
      success: true,
      data: {
        companyInfo: analysisResult.companyInfo,
        report: analysisResult.report,
        metadata: {
          filesProcessed: uploadedFiles.length,
          analyzedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ 분석 실패:', error);

    // 에러 발생시에도 업로드된 파일 삭제
    if (uploadedFiles) {
      await Promise.all(
        uploadedFiles.map(file => fs.unlink(file.path).catch(err => console.error(err)))
      );
    }

    res.status(500).json({
      success: false,
      error: error.message || '분석 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/analysis/generate-pdf
 * 분석 결과를 PDF로 변환
 */
router.post('/generate-pdf', async (req, res) => {
  try {
    const { reportData } = req.body;

    if (!reportData) {
      return res.status(400).json({
        success: false,
        error: '리포트 데이터가 필요합니다.'
      });
    }

    console.log('📄 PDF 리포트 생성 중...');
    const pdfBuffer = await reportGenerator.generatePDF(reportData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=consulting-report-${Date.now()}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ PDF 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: 'PDF 생성 중 오류가 발생했습니다.'
    });
  }
});

export default router;
