import OpenAI from 'openai';
import dotenv from 'dotenv';
import ENHANCED_MASTER_PROMPT from '../prompts/enhancedMasterPrompt.js';

dotenv.config();

/**
 * 향상된 AI 분석 서비스
 * 구조화된 데이터 기반 CRETOP 분석
 */
class EnhancedAIAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.AI_MODEL || 'gpt-4-turbo-preview';
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS || '4096');
    this.temperature = parseFloat(process.env.AI_TEMPERATURE || '0.3');
  }

  /**
   * 구조화된 PDF 파싱 데이터를 AI로 분석
   * @param {Object} parsedData - Advanced PDF Parser의 출력
   */
  async analyze(parsedData) {
    try {
      console.log('🤖 향상된 AI 분석 요청 준비 중...');
      console.log(`📊 모델: ${this.model}`);
      console.log(`📄 분석할 파일 수: ${parsedData.files.length}`);
      console.log(`📋 데이터 품질: ${parsedData.summary.dataQuality}`);

      // 데이터 완전성 확인
      const completeness = parsedData.structured.completeness;
      console.log('✅ 데이터 완전성:', completeness);

      // 사용자 메시지 구성 (구조화된 데이터 + 원본 텍스트)
      const userMessage = this.buildEnhancedUserMessage(parsedData);

      console.log('💭 OpenAI API 호출 중...');
      console.log(`📏 메시지 길이: ${userMessage.length} 문자`);

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: ENHANCED_MASTER_PROMPT
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
        companyInfo: parsedData.structured.company,
        report: parsedReport,
        rawReport: reportText,
        structured: parsedData.structured,
        metadata: {
          model: this.model,
          tokensUsed: completion.usage.total_tokens,
          analyzedAt: new Date().toISOString(),
          dataQuality: parsedData.summary.dataQuality,
          completeness: completeness
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
   * 구조화된 데이터를 포함한 사용자 메시지 구성
   */
  buildEnhancedUserMessage(parsedData) {
    let message = '# 기업 신용분석 데이터\n\n';

    // 1. 구조화된 데이터를 JSON으로 제공
    message += '## 📊 구조화된 데이터 (우선 활용)\n\n';
    message += '```json\n';
    message += JSON.stringify(parsedData.structured, null, 2);
    message += '\n```\n\n';

    // 2. 데이터 품질 정보
    message += '## 📈 데이터 품질 정보\n\n';
    message += `- 총 파일 수: ${parsedData.summary.totalFiles}\n`;
    message += `- 파일 유형: ${JSON.stringify(parsedData.summary.types)}\n`;
    message += `- 데이터 품질: ${parsedData.summary.dataQuality}\n`;
    message += `- 오류 발생: ${parsedData.summary.hasError ? 'Yes' : 'No'}\n\n`;

    // 3. 파일별 원본 텍스트 (구조화 실패 시 참고용)
    message += '## 📄 원본 PDF 텍스트 (참고용)\n\n';
    message += '구조화된 데이터가 불완전한 경우, 아래 원본 텍스트에서 추가 정보를 추출하십시오.\n\n';

    parsedData.files.forEach((file, index) => {
      message += `### [파일 ${index + 1}] ${file.filename} (${file.type})\n\n`;
      if (file.error) {
        message += `⚠️ 오류: ${file.error}\n\n`;
      } else {
        // 텍스트가 너무 길면 잘라내기 (GPT-4 토큰 제한 고려)
        const maxLength = 10000; // 파일당 10,000자로 제한
        const text = file.rawText.length > maxLength 
          ? file.rawText.substring(0, maxLength) + '\n\n... (내용이 길어 일부 생략됨) ...'
          : file.rawText;
        message += `\`\`\`\n${text}\n\`\`\`\n\n`;
      }
      message += '---\n\n';
    });

    // 4. 분석 요청
    message += '\n\n## 📝 분석 요청\n\n';
    message += '위 구조화된 데이터와 원본 텍스트를 바탕으로, ';
    message += '[0. 기업 현황 요약] ~ [5. 정부지원금 제안] 섹션으로 구성된 ';
    message += '종합 경영컨설팅 리포트를 작성해주세요.\n\n';
    message += '**중요 지침**:\n';
    message += '- 구조화된 데이터를 우선적으로 활용하되, 데이터가 부족한 경우 원본 텍스트에서 추가 정보를 찾으십시오.\n';
    message += '- 데이터가 없으면 "자료 없음"으로 표기하고, 절대 추측하지 마십시오.\n';
    message += '- 모든 판단에 구체적인 근거(수치, 등급 등)를 명시하십시오.\n';
    message += '- 표와 목록을 활용하여 가독성을 높이십시오.\n';

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
   * 테스트용 더미 분석 (OpenAI API 없이 테스트할 때)
   */
  async analyzeDummy(parsedData) {
    console.log('🧪 테스트 모드: 더미 분석 결과 생성');

    const company = parsedData.structured.company;
    const financial = parsedData.structured.financial;

    return {
      companyInfo: company,
      report: {
        section0: this.generateDummySection0(company, financial),
        section1: '## [1. 자금조달 전략]\n\n테스트 데이터입니다.',
        section2: '## [2. 세무 절세 컨설팅]\n\n테스트 데이터입니다.',
        section3: '## [3. 기업인증 전략]\n\n테스트 데이터입니다.',
        section4: '## [4. 정책자금 활용]\n\n테스트 데이터입니다.',
        section5: '## [5. 정부지원금 제안]\n\n테스트 데이터입니다.'
      },
      rawReport: '전체 리포트 (테스트)',
      structured: parsedData.structured,
      metadata: {
        model: 'dummy',
        tokensUsed: 0,
        analyzedAt: new Date().toISOString(),
        dataQuality: parsedData.summary.dataQuality
      }
    };
  }

  generateDummySection0(company, financial) {
    return `## [0. 기업 현황 요약]

### 기본정보
- **기업명**: ${company.name || '자료 없음'}
- **사업자번호**: ${company.businessNumber || '자료 없음'}
- **대표자**: ${company.ceo || '자료 없음'}
- **업종**: ${company.industry || '자료 없음'}
- **설립일**: ${company.establishedDate || '자료 없음'}
- **소재지**: ${company.address || '자료 없음'}
- **종업원**: ${company.employees || '자료 없음'}명

### 핵심 재무현황
매출액: ${financial.revenue?.join(', ') || '자료 없음'}

(테스트 모드)`;
  }
}

export default new EnhancedAIAnalyzer();
