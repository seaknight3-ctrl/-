# 중소기업 경영컨설팅 자동 분석 시스템

## 📋 프로젝트 개요

KODATA 크레탑(CRETOP) PDF 리포트를 업로드하면 AI가 자동으로 분석하여 5대 경영컨설팅 영역에 대한 종합 리포트를 생성하는 시스템입니다.

### 🎯 핵심 기능

1. **자금조달 전략** - 현재 여신 구조 분석 및 추가 조달 방안 제시
2. **세무 절세 컨설팅** - 적용 가능한 세액공제 및 절세 전략 제안
3. **기업인증 전략** - 벤처/이노비즈/메인비즈 등 인증 우선순위 및 로드맵
4. **정책자금 매칭** - 중진공/소진공/신보/기보 정책자금 추천
5. **정부지원금 제안** - R&D, 고용, 디지털전환 지원사업 매칭

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📂 프로젝트 구조

```
sme-consulting-analyzer/
├── server/                 # 백엔드 (Express.js)
│   ├── index.js           # 메인 서버
│   ├── routes/            # API 라우트
│   ├── services/          # 비즈니스 로직
│   │   ├── pdfParser.js   # PDF 파싱
│   │   ├── aiAnalyzer.js  # AI 분석 엔진
│   │   └── reportGen.js   # 리포트 생성
│   ├── prompts/           # AI 프롬프트 템플릿
│   └── uploads/           # 업로드된 파일 (임시)
├── src/                   # 프론트엔드 (React)
│   ├── components/        # React 컴포넌트
│   ├── pages/            # 페이지
│   ├── App.jsx           # 메인 앱
│   └── main.jsx          # 엔트리 포인트
├── public/               # 정적 파일
└── dist/                 # 빌드 결과물
```

## 🔧 기술 스택

### Backend
- **Node.js** + **Express.js** - RESTful API 서버
- **pdf-parse** - PDF 텍스트 추출
- **OpenAI API** - GPT-4 기반 분석
- **PDFKit** - 리포트 PDF 생성

### Frontend
- **React 18** - UI 프레임워크
- **Vite** - 빌드 도구
- **TailwindCSS** - 스타일링
- **Axios** - HTTP 클라이언트

## 📖 사용 방법

### 1. PDF 업로드
- CRETOP 기업종합보고서, 세부신용공여, 담보기록 PDF를 업로드합니다.
- 여러 파일을 동시에 업로드할 수 있습니다.

### 2. 자동 분석
- AI가 PDF에서 다음 정보를 자동 추출합니다:
  - 기업 기본정보 (업종, 업력, 규모)
  - 재무제표 (매출, 영업이익, 부채비율 등)
  - 여신 및 보증 현황
  - 신용등급 및 담보 정보
  - 기업인증 현황

### 3. 리포트 생성
- 5대 컨설팅 영역에 대한 맞춤형 전략을 도출합니다.
- Markdown 형식의 리포트를 웹에서 확인하거나 PDF로 다운로드할 수 있습니다.

## 🎨 주요 화면

1. **메인 대시보드** - PDF 업로드 및 분석 시작
2. **분석 결과** - 6개 섹션으로 구성된 종합 리포트
3. **리포트 내보내기** - PDF/Markdown 다운로드

## 🤖 AI 프롬프트 구조

본 시스템은 **역할 기반 프롬프트 엔지니어링**을 활용합니다:

```
Role: 중소기업 종합 경영컨설턴트 AI
Context: CRETOP PDF 기반 기업 정보 추출
Task: 5대 컨설팅 영역 전략 수립
Constraints: 팩트 기반, 추측 금지, 출처 명시
Output: 6개 섹션 구조화 리포트
```

## 📝 API 엔드포인트

### POST /api/analyze
PDF 파일을 업로드하고 분석 결과를 반환합니다.

**Request:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "files=@기업종합보고서.pdf" \
  -F "files=@세부신용공여.pdf"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyName": "지무디앤씨",
    "report": {
      "summary": "...",
      "fundraising": "...",
      "tax": "...",
      "certification": "...",
      "policyFund": "...",
      "grants": "..."
    }
  }
}
```

## 🔒 보안 고려사항

- 업로드된 PDF는 분석 후 자동 삭제됩니다.
- 민감한 재무정보는 서버에 저장되지 않습니다.
- OpenAI API 키는 환경변수로 관리합니다.

## 🛠 개발 모드

```bash
# 백엔드만 실행
npm run server

# 프론트엔드만 실행
npm run client

# 동시 실행
npm run dev
```

## 📦 프로덕션 빌드

```bash
npm run build
npm start
```

## 🤝 기여자

- **한기솔 채대표** - 경영컨설팅 도메인 전문가
- **AI Developer** - 시스템 아키텍처 및 개발

## 📄 라이선스

MIT License

## 📞 문의

문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ for Korean SME Consultants**
