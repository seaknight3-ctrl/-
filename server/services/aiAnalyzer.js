import OpenAI from 'openai';
import dotenv from 'dotenv';
import MASTER_PROMPT from '../prompts/masterPrompt.js';

dotenv.config();

/**
 * AI 분석 서비스
 * OpenAI GPT-4를 사용한 CRETOP 데이터 분석
 */
class AIAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.AI_MODEL || 'gpt-4-turbo-preview';
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS || '4096');
    this.temperature = parseFloat(process.env.AI_TEMPERATURE || '0.3');
  }

  /**
   * PDF 파싱 데이터를 AI로 분석
   */
  async analyze(parsedData) {
    try {
      console.log('🤖 AI 분석 요청 준비 중...');
      console.log(`📊 모델: ${this.model}`);
      console.log(`📄 분석할 파일 수: ${parsedData.files.length}`);

      // 사용자 메시지 구성
      const userMessage = this.buildUserMessage(parsedData);

      console.log('💭 OpenAI API 호출 중...');

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: MASTER_PROMPT
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: { type: 'text' }
      });

      console.log('✅ AI 분석 완료');
      console.log(`📊 사용된 토큰: ${completion.usage.total_tokens}`);

      const reportText = completion.choices[0].message.content;

      // 리포트를 섹션별로 파싱
      const parsedReport = this.parseReport(reportText);

      return {
        companyInfo: this.extractCompanyInfo(reportText),
        report: parsedReport,
        rawReport: reportText,
        metadata: {
          model: this.model,
          tokensUsed: completion.usage.total_tokens,
          analyzedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ AI 분석 오류:', error);

      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API 할당량이 부족합니다. API 키를 확인해주세요.');
      }
      if (error.code === 'invalid_api_key') {
        throw new Error('OpenAI API 키가 유효하지 않습니다.');
      }

      throw new Error(`AI 분석 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * 사용자 메시지 구성
   */
  buildUserMessage(parsedData) {
    let message = '다음은 업로드된 CRETOP PDF 파일들의 텍스트 내용입니다:\n\n';

    // 파일별 구분
    parsedData.files.forEach((file, index) => {
      message += `### 📄 파일 ${index + 1}: ${file.filename}\n`;
      message += `유형: ${file.type}\n\n`;
      if (file.error) {
        message += `⚠️ 오류: ${file.error}\n\n`;
      } else {
        // 텍스트가 너무 길면 잘라내기 (GPT-4 토큰 제한 고려)
        const maxLength = 15000;
        const text = file.text.length > maxLength 
          ? file.text.substring(0, maxLength) + '\n\n... (내용이 길어 일부 생략됨) ...'
          : file.text;
        message += `내용:\n${text}\n\n`;
      }
      message += '---\n\n';
    });

    message += '\n위 데이터를 바탕으로 [0]~[5] 섹션으로 구성된 종합 경영컨설팅 리포트를 작성해주세요.';

    return message;
  }

  /**
   * 리포트 텍스트를 섹션별로 파싱
   */
  parseReport(reportText) {
    const sections = {
      section0: '', // 기업 현황 요약
      section1: '', // 자금조달 전략
      section2: '', // 세무 절세
      section3: '', // 기업인증
      section4: '', // 정책자금
      section5: ''  // 정부지원금
    };

    // 섹션 구분자 패턴
    const patterns = [
      { key: 'section0', regex: /##?\s*\[?0\.?\s*기업\s*현황\s*요약\]?/i },
      { key: 'section1', regex: /##?\s*\[?1\.?\s*자금조달\s*전략\]?/i },
      { key: 'section2', regex: /##?\s*\[?2\.?\s*세무\s*절세/i },
      { key: 'section3', regex: /##?\s*\[?3\.?\s*기업인증/i },
      { key: 'section4', regex: /##?\s*\[?4\.?\s*정책자금/i },
      { key: 'section5', regex: /##?\s*\[?5\.?\s*정부지원금/i }
    ];

    // 각 섹션의 시작 위치 찾기
    const positions = patterns.map(p => {
      const match = reportText.match(p.regex);
      return {
        key: p.key,
        index: match ? match.index : -1
      };
    }).filter(p => p.index >= 0).sort((a, b) => a.index - b.index);

    // 섹션별로 텍스트 추출
    positions.forEach((pos, idx) => {
      const start = pos.index;
      const end = idx < positions.length - 1 ? positions[idx + 1].index : reportText.length;
      sections[pos.key] = reportText.substring(start, end).trim();
    });

    return sections;
  }

  /**
   * 기업 기본 정보 추출
   */
  extractCompanyInfo(reportText) {
    const info = {
      name: null,
      industry: null,
      establishedYear: null,
      employees: null,
      creditRating: null
    };

    // 기업명 추출 시도
    const nameMatch = reportText.match(/기업명[:\s]+([^\n]+)/);
    if (nameMatch) info.name = nameMatch[1].trim();

    // 업종 추출
    const industryMatch = reportText.match(/업종[:\s]+([^\n]+)/);
    if (industryMatch) info.industry = industryMatch[1].trim();

    // 설립일 추출
    const yearMatch = reportText.match(/설립[일:]?\s*(\d{4})/);
    if (yearMatch) info.establishedYear = yearMatch[1];

    // 종업원 수 추출
    const empMatch = reportText.match(/종업원[:\s]+(\d+)/);
    if (empMatch) info.employees = parseInt(empMatch[1]);

    // 신용등급 추출
    const ratingMatch = reportText.match(/신용등급[:\s]+([A-Za-z0-9+-]+)/);
    if (ratingMatch) info.creditRating = ratingMatch[1];

    return info;
  }

  /**
   * 테스트용 더미 분석 (OpenAI API 없이 테스트할 때)
   */
  async analyzeDummy(parsedData) {
    console.log('🧪 테스트 모드: 더미 분석 결과 생성');

    return {
      companyInfo: {
        name: '테스트 기업',
        industry: '제조업',
        establishedYear: '2015',
        employees: 50,
        creditRating: 'BBB'
      },
      report: {
        section0: '## [0. 기업 현황 요약]\n\n테스트 데이터입니다.',
        section1: '## [1. 자금조달 전략]\n\n테스트 데이터입니다.',
        section2: '## [2. 세무 절세 컨설팅]\n\n테스트 데이터입니다.',
        section3: '## [3. 기업인증 전략]\n\n테스트 데이터입니다.',
        section4: '## [4. 정책자금 활용]\n\n테스트 데이터입니다.',
        section5: '## [5. 정부지원금 제안]\n\n테스트 데이터입니다.'
      },
      rawReport: '전체 리포트 (테스트)',
      metadata: {
        model: 'dummy',
        tokensUsed: 0,
        analyzedAt: new Date().toISOString()
      }
    };
  }
}

export default new AIAnalyzer();
