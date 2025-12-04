# 중소기업 경영컨설팅 자동 분석 시스템 - 사용 가이드

## 🚀 시작하기

### 1. 초기 설정

#### OpenAI API 키 설정
1. `.env` 파일을 열어주세요
2. `OPENAI_API_KEY` 값을 실제 키로 변경하세요:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
   ```

#### 서버 실행
```bash
# 개발 모드 (프론트엔드 + 백엔드 동시 실행)
npm run dev

# 백엔드만 실행
npm run server

# 프론트엔드만 실행
npm run client
```

### 2. 접속
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:3000

## 📝 사용 방법

### Step 1: PDF 업로드
1. 메인 화면에서 PDF 파일을 드래그 앤 드롭하거나 클릭하여 선택
2. 업로드 가능한 파일:
   - ✅ 기업종합보고서.pdf
   - ✅ 세부신용공여.pdf
   - ✅ 담보기록.pdf
3. 최대 5개 파일, 각 10MB 이하

### Step 2: AI 분석 시작
1. 파일 업로드 완료 후 "AI 분석 시작" 버튼 클릭
2. 분석 진행 (약 30초~1분 소요)
   - PDF 텍스트 추출
   - AI 분석 및 리포트 생성

### Step 3: 리포트 확인
분석 완료 후 다음 6개 섹션으로 구성된 리포트 확인:

1. **📊 기업 현황 요약**
   - 기본정보, 재무현황, 신용등급
   - 여신·보증 현황

2. **💰 자금조달 전략**
   - 현재 차입 구조 분석
   - 추가 조달 가능성
   - 은행/보증/정책자금 추천

3. **📝 세무 절세 컨설팅**
   - 적용 가능한 세액공제
   - 절세 전략 제안
   - 법인전환 검토

4. **🏆 기업인증 전략**
   - 벤처/이노비즈/메인비즈 적합성
   - 인증별 기대효과
   - 준비 로드맵

5. **🏦 정책자금 활용**
   - 중진공/소진공 자금 매칭
   - 신보/기보 보증상품
   - 신청 가능 자금 리스트

6. **🎁 정부지원금 제안**
   - 고용지원금
   - R&D 지원사업
   - 스마트공장/디지털전환
   - 지역 특화 지원사업

### Step 4: 리포트 다운로드
- **Markdown 다운로드**: 텍스트 편집 가능한 .md 파일
- **PDF 다운로드**: 인쇄 가능한 .pdf 파일

## 🔧 고급 설정

### AI 모델 변경
`.env` 파일에서 설정:
```env
AI_MODEL=gpt-4-turbo-preview  # 또는 gpt-4, gpt-3.5-turbo
AI_MAX_TOKENS=4096
AI_TEMPERATURE=0.3  # 0~1 (낮을수록 일관적, 높을수록 창의적)
```

### 서버 포트 변경
```env
PORT=3000  # 원하는 포트로 변경
```

### 파일 업로드 크기 제한 변경
```env
MAX_FILE_SIZE=10485760  # 바이트 단위 (기본 10MB)
```

## 🎯 프롬프트 커스터마이징

AI 분석 프롬프트를 수정하려면:
1. `server/prompts/masterPrompt.js` 파일 열기
2. `MASTER_PROMPT` 상수 내용 수정
3. 서버 재시작

### 프롬프트 구조
```javascript
- [역할 정의]: AI의 역할과 목표
- [입력 데이터 추출 항목]: PDF에서 찾을 정보
- [분석 관점]: 성장성/수익성/안정성/여신구조
- [출력 형식]: 6개 섹션 구조
- [분석 원칙]: 팩트 기반, 근거 명시, 정확성 우선
```

## 📊 API 활용

### PDF 분석 API
```bash
curl -X POST http://localhost:3000/api/analysis/upload \
  -F "files=@기업종합보고서.pdf" \
  -F "files=@세부신용공여.pdf" \
  -F "files=@담보기록.pdf"
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "companyInfo": {
      "name": "지무디앤씨",
      "industry": "제도업",
      "creditRating": "bb-"
    },
    "report": {
      "section0": "...",
      "section1": "...",
      ...
    },
    "metadata": {
      "filesProcessed": 3,
      "analyzedAt": "2024-12-04T10:30:00Z"
    }
  }
}
```

### PDF 생성 API
```bash
curl -X POST http://localhost:3000/api/analysis/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"reportData": {...}}' \
  --output report.pdf
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

## 🛠 문제 해결

### 1. OpenAI API 오류
```
Error: OpenAI API 할당량이 부족합니다
```
**해결**: OpenAI 계정의 API 크레딧을 확인하고 충전하세요.

### 2. PDF 파싱 오류
```
Error: PDF 파일을 읽을 수 없습니다
```
**해결**: 
- PDF 파일이 손상되지 않았는지 확인
- 파일 크기가 10MB 이하인지 확인
- 다른 PDF 리더로 열리는지 확인

### 3. 포트 충돌
```
Error: Port 3000 is already in use
```
**해결**: 
```bash
# 프로세스 찾기
lsof -i :3000

# 프로세스 종료
kill -9 <PID>

# 또는 .env 파일에서 PORT 변경
```

### 4. 모듈 없음 오류
```
Error: Cannot find module 'xxx'
```
**해결**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 💡 활용 팁

### 1. 정확한 분석을 위한 파일 준비
- 최신 크레탑 리포트 사용 (3개월 이내)
- 3개 파일 모두 업로드 (종합보고서, 신용공여, 담보기록)
- 파일명에 기업명 포함 권장

### 2. 리포트 활용
- Markdown 버전: 수정하여 맞춤형 리포트 작성
- PDF 버전: 고객사 제출용
- 섹션별 복사: 제안서 작성 시 활용

### 3. 배치 처리
여러 기업을 순차적으로 분석할 경우:
1. 기업별 폴더 준비
2. 순서대로 업로드 및 분석
3. 리포트 다운로드 후 다음 기업 진행

### 4. 프롬프트 최적화
- 특정 업종에 맞게 프롬프트 조정
- 지역별 특화 지원사업 추가
- 최신 정책자금 정보 반영

## 🔐 보안 주의사항

1. **API 키 관리**
   - `.env` 파일을 절대 공개 저장소에 업로드하지 마세요
   - `.gitignore`에 `.env` 포함 확인

2. **업로드 파일**
   - 분석 후 자동 삭제됨
   - 서버에 영구 저장되지 않음

3. **민감 정보**
   - 재무정보는 메모리에서만 처리
   - 데이터베이스 저장 없음

## 📞 지원

### 로그 확인
```bash
# 서버 로그 보기
tail -f server.log

# 에러 로그만 보기
tail -f server.log | grep ERROR
```

### 디버그 모드
```env
NODE_ENV=development  # 상세 에러 메시지 표시
```

---

**Happy Consulting! 🎉**

궁금한 점이 있으시면 README.md를 참고하시거나 이슈를 등록해주세요.
