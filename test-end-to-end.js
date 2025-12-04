#!/usr/bin/env node
import AdvancedPDFParser from './server/services/advancedPdfParser.js';
import EnhancedAIAnalyzer from './server/services/enhancedAiAnalyzer.js';
import fs from 'fs';
import path from 'path';

const TEST_PDF_DIR = './test_pdfs';

/**
 * 전체 파이프라인 테스트 (PDF 파싱 → AI 분석)
 */
async function testEndToEnd() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 END-TO-END 시스템 테스트');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. PDF 파일 읽기
    const testFiles = fs.readdirSync(TEST_PDF_DIR)
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        originalname: file,
        path: path.join(TEST_PDF_DIR, file)
      }));

    console.log(`📄 테스트 파일: ${testFiles.length}개`);
    testFiles.forEach(f => console.log(`   - ${f.originalname}`));
    console.log('');

    // 2. PDF 파싱 (구조화)
    console.log('🔍 STEP 1: PDF 파싱 및 구조화...\n');
    const parsedData = await AdvancedPDFParser.parseMultiplePDFs(testFiles);

    console.log(`✅ 파싱 완료`);
    console.log(`   - 데이터 품질: ${parsedData.summary.dataQuality}`);
    console.log(`   - 기업정보: ${parsedData.structured.completeness.hasCompanyInfo ? '✅' : '❌'}`);
    console.log(`   - 재무정보: ${parsedData.structured.completeness.hasFinancialInfo ? '✅' : '❌'}`);
    console.log(`   - 신용정보: ${parsedData.structured.completeness.hasCreditInfo ? '✅' : '❌'}`);
    console.log(`   - 대출정보: ${parsedData.structured.completeness.hasLoanInfo ? '✅' : '❌'}`);
    console.log(`   - 담보정보: ${parsedData.structured.completeness.hasCollateralInfo ? '✅' : '❌'}`);
    console.log('');

    // 3. 구조화된 데이터 출력
    console.log('📊 STEP 2: 구조화된 데이터 확인\n');
    console.log('🏢 기업 기본 정보:');
    console.log(`   - 기업명: ${parsedData.structured.company.name || '자료 없음'}`);
    console.log(`   - 사업자번호: ${parsedData.structured.company.businessNumber || '자료 없음'}`);
    console.log(`   - 대표자: ${parsedData.structured.company.ceo || '자료 없음'}`);
    console.log(`   - 업종: ${parsedData.structured.company.industry || '자료 없음'}`);
    console.log('');

    console.log('💰 재무 정보:');
    console.log(`   - 매출액: ${parsedData.structured.financial.revenue?.join(', ') || '자료 없음'}`);
    console.log(`   - 영업이익: ${parsedData.structured.financial.operatingIncome?.join(', ') || '자료 없음'}`);
    console.log(`   - 부채비율: ${parsedData.structured.financial.debtRatio || '자료 없음'}%`);
    console.log('');

    console.log('🏦 대출 정보:');
    console.log(`   - 대출 건수: ${parsedData.structured.loan.loanCount || 0}`);
    console.log(`   - 총 대출잔액: ${parsedData.structured.loan.totalLoan || '자료 없음'} 백만원`);
    if (parsedData.structured.loan.loans && parsedData.structured.loan.loans.length > 0) {
      parsedData.structured.loan.loans.forEach((loan, idx) => {
        console.log(`   - ${loan.bank}: ${loan.amount} 백만원`);
      });
    }
    console.log('');

    // 4. AI 분석 테스트 (실제 OpenAI 호출 여부 확인)
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    
    if (!hasOpenAIKey) {
      console.log('⚠️  OPENAI_API_KEY가 설정되지 않아 실제 AI 분석은 건너뜁니다.');
      console.log('📝 구조화된 데이터 출력만 확인합니다.\n');
      
      console.log('=' . repeat(80));
      console.log('✅ 구조화된 데이터 추출 테스트 성공!');
      console.log('=' . repeat(80));
      console.log('\n실제 AI 분석을 실행하려면:');
      console.log('1. .env 파일에 OPENAI_API_KEY를 설정하세요.');
      console.log('2. 이 스크립트를 다시 실행하세요: node test-end-to-end.js\n');
      return;
    }

    console.log('🤖 STEP 3: AI 분석 실행 중...\n');
    console.log('   (이 단계는 30초~1분 소요될 수 있습니다)\n');

    const analysisResult = await EnhancedAIAnalyzer.analyze(parsedData);

    console.log('✅ AI 분석 완료!');
    console.log(`   - 사용 모델: ${analysisResult.metadata.model}`);
    console.log(`   - 사용 토큰: ${analysisResult.metadata.tokensUsed}`);
    console.log(`   - 분석 시간: ${analysisResult.metadata.analyzedAt}`);
    console.log('');

    // 5. 분석 결과 출력 (일부)
    console.log('📋 STEP 4: 분석 결과 미리보기\n');
    console.log('=' . repeat(80));
    console.log(analysisResult.report.section0.substring(0, 500));
    console.log('...(이하 생략)...');
    console.log('=' . repeat(80));
    console.log('');

    console.log('✅ END-TO-END 테스트 성공!');
    console.log('');
    console.log('다음 단계:');
    console.log('1. npm run start 로 서버를 시작하세요.');
    console.log('2. 웹 브라우저에서 PDF를 업로드하고 분석 결과를 확인하세요.');
    console.log('');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
    console.error('\n상세 오류:');
    console.error(error);
    process.exit(1);
  }
}

// 테스트 실행
testEndToEnd();
