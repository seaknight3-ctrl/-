# ⚡ 빠른 시작 가이드

## 1단계: OpenAI API 키 설정 (필수!)

`.env` 파일을 열고 API 키를 입력하세요:

```bash
# .env 파일 수정
nano .env

# 또는
vim .env
```

다음 줄을 수정:
```env
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

> 💡 API 키는 https://platform.openai.com/api-keys 에서 생성할 수 있습니다.

## 2단계: 서버 실행

```bash
# 프론트엔드 + 백엔드 동시 실행
npm run dev
```

## 3단계: 브라우저 접속

- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:3000

## 4단계: PDF 분석

1. 브라우저에서 PDF 파일 업로드
2. "AI 분석 시작" 버튼 클릭
3. 30초~1분 대기
4. 리포트 확인 및 다운로드

---

## 🧪 테스트 모드 (API 키 없이 테스트)

OpenAI API 키가 없는 경우, 테스트 모드로 실행할 수 있습니다:

1. `server/services/aiAnalyzer.js` 파일 열기
2. `analyze` 메서드를 `analyzeDummy`로 변경:

```javascript
// 79번째 줄 근처
router.post('/upload', upload.array('files', 5), async (req, res) => {
  // ...
  
  // 변경 전:
  // const analysisResult = await aiAnalyzer.analyze(parsedData);
  
  // 변경 후:
  const analysisResult = await aiAnalyzer.analyzeDummy(parsedData);
  
  // ...
});
```

3. 서버 재시작

> ⚠️ 테스트 모드는 더미 데이터를 반환하므로 실제 분석은 수행하지 않습니다.

---

## 🔧 문제 해결

### 문제: 패키지 설치 오류
```bash
rm -rf node_modules package-lock.json
npm install
```

### 문제: 포트 충돌 (Port 3000 already in use)
```bash
# .env 파일에서 포트 변경
PORT=3001
```

### 문제: OpenAI API 오류
- API 키가 정확한지 확인
- OpenAI 계정에 크레딧이 있는지 확인
- https://platform.openai.com/account/usage 에서 사용량 확인

---

## 📋 체크리스트

실행 전 확인사항:

- [ ] Node.js 18 이상 설치됨
- [ ] npm install 완료
- [ ] .env 파일에 OpenAI API 키 설정
- [ ] 포트 3000, 5173이 사용 가능

모든 항목이 체크되었다면:
```bash
npm run dev
```

✅ 서버가 정상적으로 실행되면 브라우저에서 http://localhost:5173 접속!

---

## 📞 추가 도움

- 자세한 사용법: `USAGE_GUIDE.md`
- 프로젝트 개요: `README.md`
- API 문서: `README.md` → API 엔드포인트 섹션

**Happy Analyzing! 🎉**
