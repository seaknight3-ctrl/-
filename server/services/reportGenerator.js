import PDFDocument from 'pdfkit';
import { marked } from 'marked';

/**
 * 리포트 생성 서비스
 * 분석 결과를 PDF로 변환
 */
class ReportGenerator {
  /**
   * 분석 결과를 PDF로 생성
   */
  async generatePDF(reportData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // 한글 폰트 설정 (기본 폰트 사용 - 한글 지원 제한적)
        // 실제 운영시에는 한글 폰트 파일을 추가해야 함

        // 표지
        this.addCoverPage(doc, reportData);

        // 목차
        doc.addPage();
        this.addTableOfContents(doc);

        // 각 섹션 추가
        const sections = [
          { title: '0. 기업 현황 요약', content: reportData.report.section0 },
          { title: '1. 자금조달 전략', content: reportData.report.section1 },
          { title: '2. 세무 절세 컨설팅', content: reportData.report.section2 },
          { title: '3. 기업인증 전략', content: reportData.report.section3 },
          { title: '4. 정책자금 활용', content: reportData.report.section4 },
          { title: '5. 정부지원금 제안', content: reportData.report.section5 }
        ];

        sections.forEach(section => {
          if (section.content) {
            doc.addPage();
            this.addSection(doc, section.title, section.content);
          }
        });

        // PDF 완료
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 표지 페이지 추가
   */
  addCoverPage(doc, reportData) {
    doc.fontSize(28)
       .text('중소기업 경영컨설팅', 50, 200, { align: 'center' })
       .fontSize(24)
       .text('종합 분석 리포트', 50, 240, { align: 'center' });

    if (reportData.companyInfo?.name) {
      doc.fontSize(20)
         .text(reportData.companyInfo.name, 50, 320, { align: 'center' });
    }

    doc.fontSize(12)
       .text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, 50, 700, { align: 'center' })
       .text('한기솔 경영컨설팅', 50, 720, { align: 'center' });
  }

  /**
   * 목차 추가
   */
  addTableOfContents(doc) {
    doc.fontSize(20)
       .text('목차', 50, 50);

    doc.fontSize(12)
       .moveDown(2);

    const contents = [
      '0. 기업 현황 요약',
      '1. 자금조달 전략',
      '2. 세무 절세 컨설팅 포인트',
      '3. 기업인증 기반 경영컨설팅 전략',
      '4. 정책자금(융자) 활용 전략',
      '5. 정부지원금·바우처·고용지원 제도 제안'
    ];

    contents.forEach((item, index) => {
      doc.text(`${item}`, 70, doc.y, { continued: false })
         .moveDown(0.5);
    });
  }

  /**
   * 섹션 추가
   */
  addSection(doc, title, content) {
    // 제목
    doc.fontSize(18)
       .text(title, 50, 50)
       .moveDown(1);

    // 내용 (마크다운 단순 변환)
    const plainText = this.markdownToPlainText(content);

    doc.fontSize(10)
       .text(plainText, {
         width: 495,
         align: 'left',
         lineGap: 2
       });
  }

  /**
   * 마크다운을 플레인 텍스트로 변환 (간단한 변환)
   */
  markdownToPlainText(markdown) {
    if (!markdown) return '';

    let text = markdown;

    // 헤더 제거
    text = text.replace(/^#{1,6}\s+/gm, '');

    // 볼드/이탤릭 제거
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/\*(.+?)\*/g, '$1');
    text = text.replace(/__(.+?)__/g, '$1');
    text = text.replace(/_(.+?)_/g, '$1');

    // 링크 제거
    text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

    // 코드 블록 제거
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`(.+?)`/g, '$1');

    return text.trim();
  }

  /**
   * Markdown을 HTML로 변환
   */
  async markdownToHTML(reportData) {
    let html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>경영컨설팅 리포트 - ${reportData.companyInfo?.name || '기업'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 { color: #2c3e50; margin-top: 2rem; }
        table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #3498db; color: white; }
        code { background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background-color: #f4f4f4; padding: 1rem; border-radius: 5px; overflow-x: auto; }
        .cover { text-align: center; padding: 100px 0; }
        .cover h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        .cover .company { font-size: 1.8rem; color: #3498db; }
    </style>
</head>
<body>
    <div class="cover">
        <h1>중소기업 경영컨설팅<br>종합 분석 리포트</h1>
        <p class="company">${reportData.companyInfo?.name || '기업명'}</p>
        <p>생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
    </div>
    <hr>
`;

    // 각 섹션 추가
    const sections = [
      reportData.report.section0,
      reportData.report.section1,
      reportData.report.section2,
      reportData.report.section3,
      reportData.report.section4,
      reportData.report.section5
    ];

    sections.forEach(section => {
      if (section) {
        html += marked(section);
      }
    });

    html += `
    <hr>
    <footer style="text-align: center; margin-top: 50px; color: #7f8c8d;">
        <p>한기솔 경영컨설팅</p>
        <p>본 리포트는 AI 기반 자동 분석 결과이며, 실제 컨설팅 시 추가 검토가 필요합니다.</p>
    </footer>
</body>
</html>
`;

    return html;
  }
}

export default new ReportGenerator();
