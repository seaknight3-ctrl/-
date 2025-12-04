import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

/**
 * PDF 파싱 서비스
 * CRETOP PDF에서 텍스트 추출 및 구조화
 */
class PDFParser {
  /**
   * 여러 PDF 파일을 파싱
   */
  async parseMultiplePDFs(files) {
    const results = [];

    for (const file of files) {
      try {
        const text = await this.parseSinglePDF(file.path);
        results.push({
          filename: file.originalname,
          type: this.identifyPDFType(file.originalname, text),
          text: text,
          path: file.path
        });
      } catch (error) {
        console.error(`PDF 파싱 오류 (${file.originalname}):`, error);
        results.push({
          filename: file.originalname,
          error: error.message,
          text: ''
        });
      }
    }

    return {
      files: results,
      combinedText: results.map(r => r.text).join('\n\n===== 다음 파일 =====\n\n'),
      summary: this.extractSummary(results)
    };
  }

  /**
   * 단일 PDF 파일 파싱
   */
  async parseSinglePDF(filePath) {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  /**
   * PDF 파일 유형 식별
   */
  identifyPDFType(filename, text) {
    const lowerFilename = filename.toLowerCase();
    const lowerText = text.toLowerCase();

    if (lowerFilename.includes('종합보고서') || lowerFilename.includes('기업보고서')) {
      return '기업종합보고서';
    }
    if (lowerFilename.includes('신용공여') || lowerText.includes('세부신용공여')) {
      return '세부신용공여';
    }
    if (lowerFilename.includes('담보') || lowerText.includes('담보기록')) {
      return '담보기록';
    }

    // 텍스트 내용으로 추가 판별
    if (lowerText.includes('재무제표') && lowerText.includes('손익계산서')) {
      return '기업종합보고서';
    }
    if (lowerText.includes('대출잔액') || lowerText.includes('보증잔액')) {
      return '세부신용공여';
    }
    if (lowerText.includes('부동산담보') || lowerText.includes('유효담보가액')) {
      return '담보기록';
    }

    return '기타';
  }

  /**
   * 핵심 정보 요약 추출
   */
  extractSummary(results) {
    const summary = {
      totalFiles: results.length,
      types: {},
      hasError: results.some(r => r.error)
    };

    results.forEach(result => {
      const type = result.type || '기타';
      summary.types[type] = (summary.types[type] || 0) + 1;
    });

    return summary;
  }

  /**
   * 텍스트에서 기업명 추출 시도
   */
  extractCompanyName(text) {
    // 정규표현식으로 기업명 패턴 찾기
    const patterns = [
      /기업명\s*[:：]\s*([^\n\r]+)/,
      /상호\s*[:：]\s*([^\n\r]+)/,
      /법인명\s*[:：]\s*([^\n\r]+)/,
      /회사명\s*[:：]\s*([^\n\r]+)/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * 텍스트에서 주요 재무 지표 추출 시도
   */
  extractFinancialData(text) {
    const data = {
      revenue: null,
      operatingIncome: null,
      netIncome: null,
      totalAssets: null,
      totalLiabilities: null,
      creditRating: null
    };

    // 매출액 패턴
    const revenuePattern = /매출액\s*[:：]?\s*([0-9,]+)\s*(백만원|원|천원)/;
    const revenueMatch = text.match(revenuePattern);
    if (revenueMatch) {
      data.revenue = revenueMatch[1].replace(/,/g, '');
    }

    // 신용등급 패턴
    const ratingPattern = /신용등급\s*[:：]?\s*([A-Za-z0-9+-]+)/;
    const ratingMatch = text.match(ratingPattern);
    if (ratingMatch) {
      data.creditRating = ratingMatch[1];
    }

    return data;
  }
}

export default new PDFParser();
