export default function LoadingSpinner() {
  return (
    <div className="card max-w-2xl mx-auto text-center py-12">
      <div className="flex justify-center mb-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        AI 분석 진행 중...
      </h3>
      <p className="text-gray-600 mb-6">
        PDF 파일을 분석하고 있습니다. 잠시만 기다려주세요.
      </p>
      
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <span className="text-sm text-gray-700">PDF 텍스트 추출 완료</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-700">AI 분석 중...</span>
        </div>
        <div className="flex items-center space-x-3 opacity-50">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full"></div>
          <span className="text-sm text-gray-500">리포트 생성 대기</span>
        </div>
      </div>

      <div className="mt-8 text-xs text-gray-500">
        💡 Tip: 분석 중에는 페이지를 새로고침하지 마세요.
      </div>
    </div>
  );
}
