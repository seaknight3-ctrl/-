export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-600 text-white p-3 rounded-lg">
              <svg className="w-8 h-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                중소기업 경영컨설팅 자동 분석 시스템
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                CRETOP PDF 분석 기반 종합 컨설팅 리포트 생성
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 bg-primary-50 px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-primary-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span className="text-sm font-semibold text-primary-700">
                AI-Powered Analysis
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
