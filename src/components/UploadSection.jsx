import { useState, useRef } from 'react';

export default function UploadSection({ 
  onAnalysisStart, 
  onAnalysisComplete, 
  onAnalysisError,
  onAnalysisEnd 
}) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (selectedFiles) => {
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      alert('PDF 파일만 업로드 가능합니다.');
    }
    
    setFiles(prev => [...prev, ...pdfFiles].slice(0, 5)); // 최대 5개
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      alert('PDF 파일을 업로드해주세요.');
      return;
    }

    onAnalysisStart();

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/analysis/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onAnalysisComplete(data.data);
      } else {
        onAnalysisError(data.error || '분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('분석 요청 오류:', error);
      onAnalysisError('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      onAnalysisEnd();
    }
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📄 CRETOP PDF 업로드
        </h2>
        <p className="text-gray-600">
          기업종합보고서, 세부신용공여, 담보기록 PDF를 업로드하여 AI 기반 경영컨설팅 리포트를 생성하세요.
        </p>
      </div>

      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p className="text-lg text-gray-700 mb-2">
          PDF 파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-sm text-gray-500">
          최대 5개 파일, 파일당 10MB 이하
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">업로드된 파일 ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 분석 시작 버튼 */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={files.length === 0}
          className={`btn-primary px-8 py-3 text-lg flex items-center space-x-2 ${
            files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          <span>AI 분석 시작</span>
        </button>
      </div>

      {/* 안내 사항 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">📌 분석 안내</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 기업종합보고서, 세부신용공여, 담보기록 PDF를 모두 업로드하면 더 정확한 분석이 가능합니다.</li>
          <li>• 분석에는 약 30초~1분 정도 소요됩니다.</li>
          <li>• 업로드된 파일은 분석 후 자동으로 삭제되어 보안이 유지됩니다.</li>
          <li>• AI 분석 결과는 참고용이며, 실제 컨설팅 시 전문가의 추가 검토가 필요합니다.</li>
        </ul>
      </div>
    </div>
  );
}
