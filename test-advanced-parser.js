import AdvancedPDFParser from './server/services/advancedPdfParser.js';
import fs from 'fs';
import path from 'path';

const TEST_PDF_DIR = './test_pdfs';

async function testAdvancedParser() {
  console.log('🧪 고급 PDF 파서 테스트 시작\n');

  try {
    // 테스트 PDF 파일 읽기
    const testFiles = fs.readdirSync(TEST_PDF_DIR)
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        originalname: file,
        path: path.join(TEST_PDF_DIR, file)
      }));

    console.log(`📄 테스트 파일: ${testFiles.length}개`);
    testFiles.forEach(f => console.log(`   - ${f.originalname}`));
    console.log('');

    // PDF 파싱 실행
    console.log('🔄 PDF 파싱 중...\n');
    const result = await AdvancedPDFParser.parseMultiplePDFs(testFiles);

    // 결과 출력
    console.log('=' . repeat(80));
    console.log('📊 파싱 결과 요약');
    console.log('='.repeat(80));
    console.log(`총 파일 수: ${result.summary.totalFiles}`);
    console.log(`파일 유형: ${JSON.stringify(result.summary.types, null, 2)}`);
    console.log(`데이터 품질: ${result.summary.dataQuality}`);
    console.log(`오류 발생: ${result.summary.hasError ? 'Yes' : 'No'}`);
    console.log('');

    // 통합 구조화 데이터 출력
    console.log('=' . repeat(80));
    console.log('🏢 기업 기본 정보 (통합)');
    console.log('='.repeat(80));
    console.log(JSON.stringify(result.structured.company, null, 2));
    console.log('');

    console.log('=' . repeat(80));
    console.log('💰 재무 정보 (통합)');
    console.log('='.repeat(80));
    console.log(`매출액: ${result.structured.financial.revenue?.join(', ') || '데이터 없음'}`);
    console.log(`영업이익: ${result.structured.financial.operatingIncome?.join(', ') || '데이터 없음'}`);
    console.log(`당기순이익: ${result.structured.financial.netIncome?.join(', ') || '데이터 없음'}`);
    console.log(`총자산: ${result.structured.financial.totalAssets?.join(', ') || '데이터 없음'}`);
    console.log(`부채비율: ${result.structured.financial.debtRatio || '데이터 없음'}%`);
    console.log('');

    console.log('=' . repeat(80));
    console.log('📈 신용 정보 (통합)');
    console.log('='.repeat(80));
    console.log(JSON.stringify(result.structured.credit, null, 2));
    console.log('');

    console.log('=' . repeat(80));
    console.log('🏦 대출 정보 (세부신용공여)');
    console.log('='.repeat(80));
    if (result.structured.loan && Object.keys(result.structured.loan).length > 0) {
      console.log(`대출 건수: ${result.structured.loan.loanCount || 0}`);
      console.log(`총 대출잔액: ${result.structured.loan.totalLoan || '데이터 없음'} 백만원`);
      console.log(`대출 목록:`);
      result.structured.loan.loans?.forEach((loan, idx) => {
        console.log(`  ${idx + 1}. ${loan.bank}: ${loan.amount} 백만원`);
      });
      console.log(`보증 정보:`);
      result.structured.loan.guarantees?.forEach((g, idx) => {
        console.log(`  ${idx + 1}. ${g.institution}: ${g.amount} 백만원`);
      });
    } else {
      console.log('대출 정보 없음');
    }
    console.log('');

    console.log('=' . repeat(80));
    console.log('🏠 담보 정보 (담보기록)');
    console.log('='.repeat(80));
    if (result.structured.collateral && Object.keys(result.structured.collateral).length > 0) {
      console.log(`담보 건수: ${result.structured.collateral.collateralCount || 0}`);
      console.log(`총 담보가액: ${result.structured.collateral.totalCollateral || '데이터 없음'} 백만원`);
      console.log(`담보 목록:`);
      result.structured.collateral.collaterals?.forEach((col, idx) => {
        console.log(`  ${idx + 1}. ${col.type}: ${col.amount} 백만원`);
      });
    } else {
      console.log('담보 정보 없음');
    }
    console.log('');

    console.log('=' . repeat(80));
    console.log('✅ 데이터 완전성 체크');
    console.log('='.repeat(80));
    console.log(JSON.stringify(result.structured.completeness, null, 2));
    console.log('');

    // 파일별 상세 정보
    console.log('=' . repeat(80));
    console.log('📑 파일별 추출 데이터');
    console.log('='.repeat(80));
    result.files.forEach((file, idx) => {
      console.log(`\n[파일 ${idx + 1}] ${file.filename} (${file.type})`);
      if (file.error) {
        console.log(`  ⚠️ 오류: ${file.error}`);
      } else {
        console.log(`  텍스트 길이: ${file.rawText.length} 문자`);
        console.log(`  구조화 데이터 키: ${Object.keys(file.structured || {}).join(', ')}`);
      }
    });

    console.log('\n\n✅ 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  }
}

// 테스트 실행
testAdvancedParser();
