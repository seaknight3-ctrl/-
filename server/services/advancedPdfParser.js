import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

/**
 * 고급 PDF 파싱 서비스
 * CRETOP PDF에서 구조화된 데이터 추출
 */
class AdvancedPDFParser {
  /**
   * 여러 PDF 파일을 파싱하고 구조화된 데이터 반환
   */
  async parseMultiplePDFs(files) {
    const results = [];

    for (const file of files) {
      try {
        const rawText = await this.parseSinglePDF(file.path);
        const pdfType = this.identifyPDFType(file.originalname, rawText);
        
        // PDF 타입별로 특화된 데이터 추출
        const structuredData = await this.extractStructuredData(rawText, pdfType);
        
        results.push({
          filename: file.originalname,
          type: pdfType,
          rawText: rawText,
          structured: structuredData,
          path: file.path
        });
      } catch (error) {
        console.error(`PDF 파싱 오류 (${file.originalname}):`, error);
        results.push({
          filename: file.originalname,
          error: error.message,
          rawText: '',
          structured: {}
        });
      }
    }

    // 통합 구조화된 데이터 생성
    const consolidatedData = this.consolidateStructuredData(results);

    return {
      files: results,
      combinedText: results.map(r => r.rawText).join('\n\n===== 다음 파일 =====\n\n'),
      structured: consolidatedData,
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

    if (lowerFilename.includes('종합보고서') || lowerFilename.includes('report') || lowerFilename.includes('기업보고서')) {
      return '기업종합보고서';
    }
    if (lowerFilename.includes('신용공여') || lowerText.includes('세부신용공여')) {
      return '세부신용공여';
    }
    if (lowerFilename.includes('담보') || lowerText.includes('담보기록')) {
      return '담보기록';
    }

    // 텍스트 내용으로 추가 판별
    if (lowerText.includes('재무제표') || lowerText.includes('손익계산서')) {
      return '기업종합보고서';
    }
    if (lowerText.includes('대출잔액') || lowerText.includes('보증잔액') || lowerText.includes('신용공여')) {
      return '세부신용공여';
    }
    if (lowerText.includes('부동산담보') || lowerText.includes('유효담보가액')) {
      return '담보기록';
    }

    return '기타';
  }

  /**
   * PDF 타입별 구조화된 데이터 추출
   */
  async extractStructuredData(text, pdfType) {
    const data = {
      type: pdfType,
      company: this.extractCompanyBasicInfo(text),
      financial: this.extractFinancialData(text),
      credit: this.extractCreditInfo(text),
      loan: null,
      collateral: null
    };

    // PDF 타입별 특화 데이터 추출
    switch (pdfType) {
      case '기업종합보고서':
        data.financial = this.extractFinancialData(text);
        data.credit = this.extractCreditInfo(text);
        data.business = this.extractBusinessInfo(text);
        break;
      case '세부신용공여':
        data.loan = this.extractLoanDetails(text);
        break;
      case '담보기록':
        data.collateral = this.extractCollateralDetails(text);
        break;
    }

    return data;
  }

  /**
   * 기업 기본 정보 추출
   */
  extractCompanyBasicInfo(text) {
    const info = {
      name: null,
      businessNumber: null,
      ceo: null,
      industry: null,
      establishedDate: null,
      address: null,
      employees: null,
      phone: null
    };

    // 기업명 추출
    const namePatterns = [
      /기업명\s*[:\s]+([^\n\r]+)/i,
      /상호\s*[:\s]+([^\n\r]+)/i,
      /법인명\s*[:\s]+([^\n\r]+)/i,
      /회사명\s*[:\s]+([^\n\r]+)/i,
      /업체명\s*[:\s]+([^\n\r]+)/i
    ];
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.name = match[1].trim();
        break;
      }
    }

    // 사업자번호 추출 (KRETOP 형식: "289 - 15 - 00723" 패턴)
    const bizNumPatterns = [
      /사업자\s*번호\s*[:\s]+(\d{3}[-\s]+\d{2}[-\s]+\d{5})/i,
      /사업자\s*등록\s*번호\s*[:\s]+(\d{3}[-\s]+\d{2}[-\s]+\d{5})/i,
      /법인\s*등록\s*번호\s*[:\s]+(\d{6}[-\s]+\d{7})/i,
      // KRETOP PDF 특수 패턴: 띄어쓰기 + 하이픈 혼합
      /(\d{3})\s*-\s*(\d{2})\s*-\s*(\d{5})/
    ];
    for (const pattern of bizNumPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match.length === 4) {
          // 그룹 캡처 방식 (3, 2, 5)
          info.businessNumber = `${match[1]}-${match[2]}-${match[3]}`;
        } else if (match[1]) {
          info.businessNumber = match[1].replace(/\s+/g, '').replace(/--/g, '-');
        }
        break;
      }
    }

    // 대표자 추출
    const ceoPatterns = [
      /대표자\s*[:\s]+([^\n\r]+)/i,
      /대표이사\s*[:\s]+([^\n\r]+)/i,
      /대표\s*[:\s]+([^\n\r]+)/i
    ];
    for (const pattern of ceoPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.ceo = match[1].trim().replace(/\s+/g, ' ');
        break;
      }
    }

    // 업종 추출
    const industryPatterns = [
      /업종\s*[:\s]+([^\n\r]+)/i,
      /주\s*업종\s*[:\s]+([^\n\r]+)/i,
      /사업\s*내용\s*[:\s]+([^\n\r]+)/i
    ];
    for (const pattern of industryPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.industry = match[1].trim();
        break;
      }
    }

    // 설립일 추출
    const datePatterns = [
      /설립일[자]?\s*[:\s]+(\d{4}[-/.년\s]+\d{1,2}[-/.월\s]+\d{1,2})/i,
      /창립일[자]?\s*[:\s]+(\d{4}[-/.년\s]+\d{1,2}[-/.월\s]+\d{1,2})/i,
      /개업일[자]?\s*[:\s]+(\d{4}[-/.년\s]+\d{1,2}[-/.월\s]+\d{1,2})/i
    ];
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.establishedDate = match[1].trim();
        break;
      }
    }

    // 종업원 수 추출
    const empPatterns = [
      /종업원\s*수?\s*[:\s]+(\d+)\s*명?/i,
      /직원\s*수?\s*[:\s]+(\d+)\s*명?/i,
      /임직원\s*수?\s*[:\s]+(\d+)\s*명?/i
    ];
    for (const pattern of empPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.employees = parseInt(match[1]);
        break;
      }
    }

    // 전화번호 추출
    const phonePattern = /전화\s*번?호?\s*[:\s]+([\d-()]+)/i;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      info.phone = phoneMatch[1].trim();
    }

    // 주소 추출
    const addressPatterns = [
      /주\s*소\s*[:\s]+([^\n\r]+(?:시|구|동|로|길)[^\n\r]*)/i,
      /소재지\s*[:\s]+([^\n\r]+(?:시|구|동|로|길)[^\n\r]*)/i,
      /본점\s*소재지\s*[:\s]+([^\n\r]+(?:시|구|동|로|길)[^\n\r]*)/i
    ];
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.address = match[1].trim();
        break;
      }
    }

    return info;
  }

  /**
   * 재무 데이터 추출
   */
  extractFinancialData(text) {
    const data = {
      revenue: [],
      operatingIncome: [],
      netIncome: [],
      totalAssets: [],
      totalLiabilities: [],
      equity: [],
      debtRatio: null,
      currentRatio: null,
      quickRatio: null,
      roe: null,
      roa: null
    };

    // 매출액 추출 (최근 3개년)
    const revenuePattern = /매출액\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi;
    let match;
    while ((match = revenuePattern.exec(text)) !== null) {
      const amount = this.parseAmount(match[1], match[2]);
      if (amount) data.revenue.push(amount);
    }

    // 영업이익 추출
    const opIncomePattern = /영업이익\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi;
    while ((match = opIncomePattern.exec(text)) !== null) {
      const amount = this.parseAmount(match[1], match[2]);
      if (amount) data.operatingIncome.push(amount);
    }

    // 당기순이익 추출
    const netIncomePattern = /당기[순]?이익\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi;
    while ((match = netIncomePattern.exec(text)) !== null) {
      const amount = this.parseAmount(match[1], match[2]);
      if (amount) data.netIncome.push(amount);
    }

    // 총자산 추출
    const assetPattern = /총\s*자산\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi;
    while ((match = assetPattern.exec(text)) !== null) {
      const amount = this.parseAmount(match[1], match[2]);
      if (amount) data.totalAssets.push(amount);
    }

    // 총부채 추출
    const liabPattern = /총\s*부채\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi;
    while ((match = liabPattern.exec(text)) !== null) {
      const amount = this.parseAmount(match[1], match[2]);
      if (amount) data.totalLiabilities.push(amount);
    }

    // 자본총계 추출
    const equityPattern = /자본[총]?계\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi;
    while ((match = equityPattern.exec(text)) !== null) {
      const amount = this.parseAmount(match[1], match[2]);
      if (amount) data.equity.push(amount);
    }

    // 비율 데이터 추출
    const ratioPatterns = [
      { key: 'debtRatio', pattern: /부채비율\s*[:\s]+([0-9.]+)\s*%?/i },
      { key: 'currentRatio', pattern: /유동비율\s*[:\s]+([0-9.]+)\s*%?/i },
      { key: 'quickRatio', pattern: /당좌비율\s*[:\s]+([0-9.]+)\s*%?/i },
      { key: 'roe', pattern: /ROE|자기자본이익률\s*[:\s]+([0-9.-]+)\s*%?/i },
      { key: 'roa', pattern: /ROA|총자산이익률\s*[:\s]+([0-9.-]+)\s*%?/i }
    ];

    for (const { key, pattern } of ratioPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        data[key] = parseFloat(match[1]);
      }
    }

    // 최신 데이터만 유지 (배열의 첫 번째 값)
    if (data.revenue.length > 3) data.revenue = data.revenue.slice(0, 3);
    if (data.operatingIncome.length > 3) data.operatingIncome = data.operatingIncome.slice(0, 3);
    if (data.netIncome.length > 3) data.netIncome = data.netIncome.slice(0, 3);
    if (data.totalAssets.length > 3) data.totalAssets = data.totalAssets.slice(0, 3);

    return data;
  }

  /**
   * 신용 정보 추출
   */
  extractCreditInfo(text) {
    const info = {
      creditRating: null,
      ratingAgency: null,
      ratingDate: null,
      creditScore: null,
      creditLimit: null,
      defaultHistory: null
    };

    // 신용등급 추출
    const ratingPatterns = [
      /신용등급\s*[:\s]+([A-Za-z0-9+-]+)/i,
      /기업신용등급\s*[:\s]+([A-Za-z0-9+-]+)/i,
      /등급\s*[:\s]+([A-Za-z0-9+-]+)/i
    ];
    for (const pattern of ratingPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        info.creditRating = match[1].trim();
        break;
      }
    }

    // 평가기관 추출
    const agencyPattern = /평가기관\s*[:\s]+([^\n\r]+)/i;
    const agencyMatch = text.match(agencyPattern);
    if (agencyMatch) {
      info.ratingAgency = agencyMatch[1].trim();
    }

    // 신용한도 추출
    const limitPattern = /신용한도\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/i;
    const limitMatch = text.match(limitPattern);
    if (limitMatch) {
      info.creditLimit = this.parseAmount(limitMatch[1], limitMatch[2]);
    }

    // 연체/부도 이력 확인
    const defaultPatterns = [
      /연체|부도|불량|default/i,
      /신용\s*불량/i,
      /대출\s*연체/i
    ];
    for (const pattern of defaultPatterns) {
      if (pattern.test(text)) {
        info.defaultHistory = '확인필요';
        break;
      }
    }

    return info;
  }

  /**
   * 사업 정보 추출
   */
  extractBusinessInfo(text) {
    const info = {
      mainProducts: [],
      mainCustomers: [],
      certifications: [],
      exportRatio: null
    };

    // 주요 제품/서비스
    const productPattern = /주요\s*제품\s*[:\s]+([^\n\r]+)/i;
    const productMatch = text.match(productPattern);
    if (productMatch) {
      info.mainProducts = productMatch[1].split(/[,、]/).map(p => p.trim());
    }

    // 인증 정보
    const certPatterns = [
      /벤처기업|벤처인증/i,
      /이노비즈|inno-?biz/i,
      /메인비즈|main-?biz/i,
      /ISO\s*\d+/i,
      /특허|지식재산권/i
    ];
    for (const pattern of certPatterns) {
      const match = text.match(pattern);
      if (match) {
        info.certifications.push(match[0]);
      }
    }

    // 수출 비중
    const exportPattern = /수출\s*비중\s*[:\s]+([0-9.]+)\s*%/i;
    const exportMatch = text.match(exportPattern);
    if (exportMatch) {
      info.exportRatio = parseFloat(exportMatch[1]);
    }

    return info;
  }

  /**
   * 대출 상세 정보 추출 (세부신용공여)
   */
  extractLoanDetails(text) {
    const loans = [];
    const guarantees = [];

    // KRETOP 세부신용공여는 테이블이 줄바꿈으로 분리되어 있음
    // 패턴: "국민은행\n대출채권일반자금(운전）\n30\n-\n30"
    
    // 은행/금고 패턴
    const bankNames = text.match(/([\w가-힣]+은행|[\w가-힣]+금고)/g) || [];
    
    // 각 은행에 대해 바로 뒤에 나오는 숫자를 찾음
    bankNames.forEach(bank => {
      // 은행명 이후 100자 내에서 금액 추출
      const bankIndex = text.indexOf(bank);
      const snippet = text.substring(bankIndex, bankIndex + 200);
      
      // 대출유형 확인
      let loanType = '기타';
      if (snippet.includes('운전')) loanType = '운전자금';
      else if (snippet.includes('시설')) loanType = '시설자금';
      
      // 금액 추출 (첫 번째 숫자가 대출 금액)
      const amountMatch = snippet.match(/대출채권[^\d]*(\d+)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1]);
        if (amount > 0) {
          loans.push({
            bank,
            loanType,
            amount,
            currency: '백만원'
          });
        }
      }
    });

    // 보증기관 패턴
    const guaranteeNames = text.match(/([\w가-힣]+보증기금|[\w가-힣]+보증재단|[\w가-힣]+보증보험)/g) || [];
    
    guaranteeNames.forEach(institution => {
      const instIndex = text.indexOf(institution);
      const snippet = text.substring(instIndex, instIndex + 200);
      
      // 보증 금액 추출
      const amountMatch = snippet.match(/보증[^\d]*(\d+)/);
      if (amountMatch) {
        const amount = parseInt(amountMatch[1]);
        if (amount > 0) {
          guarantees.push({
            institution,
            amount,
            currency: '백만원'
          });
        }
      }
    });

    // 총 대출잔액 계산
    const totalLoan = loans.length > 0 ? loans.reduce((sum, loan) => sum + loan.amount, 0) : null;
    const totalGuarantee = guarantees.length > 0 ? guarantees.reduce((sum, g) => sum + g.amount, 0) : null;

    return {
      loans,
      totalLoan,
      guarantees,
      totalGuarantee,
      loanCount: loans.length
    };
  }

  /**
   * 담보 상세 정보 추출
   */
  extractCollateralDetails(text) {
    const collaterals = [];

    // 담보 유형별 패턴
    const patterns = [
      { type: '부동산담보', pattern: /부동산\s*담보\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi },
      { type: '보증서담보', pattern: /보증서\s*담보\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi },
      { type: '예금담보', pattern: /예금\s*담보\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/gi }
    ];

    for (const { type, pattern } of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        collaterals.push({
          type,
          amount: this.parseAmount(match[1], match[2])
        });
      }
    }

    // 총 담보가액 추출
    const totalPattern = /총\s*담보\s*가[액치]\s*[:\s]+([0-9,]+)\s*(백만원|천원|원|억)/i;
    const totalMatch = text.match(totalPattern);
    const totalCollateral = totalMatch ? this.parseAmount(totalMatch[1], totalMatch[2]) : null;

    return {
      collaterals,
      totalCollateral,
      collateralCount: collaterals.length
    };
  }

  /**
   * 금액 문자열을 숫자로 변환 (단위 고려)
   */
  parseAmount(amountStr, unit) {
    const amount = parseFloat(amountStr.replace(/,/g, ''));
    if (isNaN(amount)) return null;

    // 단위 변환 (백만원 기준)
    switch (unit) {
      case '억':
      case '억원':
        return amount * 100;
      case '백만원':
        return amount;
      case '천원':
        return amount / 1000;
      case '원':
        return amount / 1000000;
      default:
        return amount;
    }
  }

  /**
   * 여러 PDF의 구조화된 데이터를 통합
   */
  consolidateStructuredData(results) {
    const consolidated = {
      company: {},
      financial: {},
      credit: {},
      business: {},
      loan: {},
      collateral: {},
      completeness: {
        hasCompanyInfo: false,
        hasFinancialInfo: false,
        hasCreditInfo: false,
        hasLoanInfo: false,
        hasCollateralInfo: false
      }
    };

    // 각 파일의 구조화된 데이터를 병합
    for (const result of results) {
      if (!result.structured) continue;

      const { company, financial, credit, business, loan, collateral } = result.structured;

      // 기업 기본 정보 병합 (null이 아닌 값 우선)
      if (company) {
        Object.keys(company).forEach(key => {
          if (company[key] && !consolidated.company[key]) {
            consolidated.company[key] = company[key];
          }
        });
        if (Object.keys(consolidated.company).some(k => consolidated.company[k])) {
          consolidated.completeness.hasCompanyInfo = true;
        }
      }

      // 재무 정보 병합
      if (financial && Object.keys(financial).length > 0) {
        Object.assign(consolidated.financial, financial);
        consolidated.completeness.hasFinancialInfo = true;
      }

      // 신용 정보 병합
      if (credit && Object.keys(credit).length > 0) {
        Object.assign(consolidated.credit, credit);
        consolidated.completeness.hasCreditInfo = true;
      }

      // 사업 정보 병합
      if (business && Object.keys(business).length > 0) {
        Object.assign(consolidated.business, business);
      }

      // 대출 정보 병합
      if (loan && Object.keys(loan).length > 0) {
        Object.assign(consolidated.loan, loan);
        consolidated.completeness.hasLoanInfo = true;
      }

      // 담보 정보 병합
      if (collateral && Object.keys(collateral).length > 0) {
        Object.assign(consolidated.collateral, collateral);
        consolidated.completeness.hasCollateralInfo = true;
      }
    }

    return consolidated;
  }

  /**
   * 핵심 정보 요약 추출
   */
  extractSummary(results) {
    const summary = {
      totalFiles: results.length,
      types: {},
      hasError: results.some(r => r.error),
      dataQuality: 'unknown'
    };

    results.forEach(result => {
      const type = result.type || '기타';
      summary.types[type] = (summary.types[type] || 0) + 1;
    });

    // 데이터 품질 평가
    const hasAllTypes = 
      summary.types['기업종합보고서'] && 
      summary.types['세부신용공여'] && 
      summary.types['담보기록'];
    
    if (hasAllTypes && !summary.hasError) {
      summary.dataQuality = 'excellent';
    } else if (summary.types['기업종합보고서'] && !summary.hasError) {
      summary.dataQuality = 'good';
    } else if (!summary.hasError) {
      summary.dataQuality = 'fair';
    } else {
      summary.dataQuality = 'poor';
    }

    return summary;
  }
}

export default new AdvancedPDFParser();
