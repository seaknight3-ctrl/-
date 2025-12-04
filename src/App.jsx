import { useState } from 'react';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import ReportView from './components/ReportView';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalysisComplete = (data) => {
    setReportData(data);
    setError(null);
  };

  const handleAnalysisError = (errorMessage) => {
    setError(errorMessage);
    setReportData(null);
  };

  const handleReset = () => {
    setReportData(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold">분석 오류</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {isAnalyzing && (
          <LoadingSpinner />
        )}

        {!reportData && !isAnalyzing && (
          <UploadSection 
            onAnalysisStart={() => setIsAnalyzing(true)}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
            onAnalysisEnd={() => setIsAnalyzing(false)}
          />
        )}

        {reportData && !isAnalyzing && (
          <ReportView 
            reportData={reportData}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 한기솔 경영컨설팅 | 중소기업 경영컨설팅 자동 분석 시스템
          </p>
          <p className="text-xs text-gray-400 mt-2">
            본 시스템은 AI 기반 자동 분석 도구이며, 실제 컨설팅 시 전문가의 추가 검토가 필요합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
