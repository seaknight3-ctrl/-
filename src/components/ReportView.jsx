import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ReportView({ reportData, onReset }) {
  const [activeTab, setActiveTab] = useState('section0');

  const sections = [
    { id: 'section0', title: '📊 기업 현황 요약', icon: '📊' },
    { id: 'section1', title: '💰 자금조달 전략', icon: '💰' },
    { id: 'section2', title: '📝 세무 절세', icon: '📝' },
    { id: 'section3', title: '🏆 기업인증', icon: '🏆' },
    { id: 'section4', title: '🏦 정책자금', icon: '🏦' },
    { id: 'section5', title: '🎁 정부지원금', icon: '🎁' }
  ];

  const handleDownloadMarkdown = () => {
    const fullReport = Object.values(reportData.report).join('\n\n---\n\n');
    const blob = new Blob([fullReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulting-report-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/analysis/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reportData })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consulting-report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('PDF 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📋 경영컨설팅 분석 리포트
            </h2>
            {reportData.companyInfo?.name && (
              <p className="text-lg text-gray-700">
                기업명: <span className="font-semibold text-primary-600">{reportData.companyInfo.name}</span>
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              생성일시: {new Date(reportData.metadata.analyzedAt).toLocaleString('ko-KR')}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDownloadMarkdown}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>MD 다운로드</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>PDF 다운로드</span>
            </button>
            <button
              onClick={onReset}
              className="btn-secondary"
            >
              새 분석
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="card">
        <div className="flex flex-wrap gap-2 mb-6">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === section.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.title.replace(section.icon, '').trim()}
            </button>
          ))}
        </div>

        {/* 리포트 내용 */}
        <div className="prose prose-sm max-w-none">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 text-gray-900" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-6 text-gray-800" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-800" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-base font-semibold mb-2 mt-3 text-gray-700" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 text-gray-700 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
                th: ({node, ...props}) => <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300" {...props} />,
                td: ({node, ...props}) => <td className="px-4 py-2 text-sm text-gray-700 border border-gray-300" {...props} />,
                code: ({node, inline, ...props}) => 
                  inline 
                    ? <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm" {...props} />
                    : <code className="block bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 my-4" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
              }}
            >
              {reportData.report[activeTab] || '내용이 없습니다.'}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* 메타데이터 */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 분석 정보</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">AI 모델</p>
            <p className="font-semibold text-gray-900">{reportData.metadata.model}</p>
          </div>
          <div>
            <p className="text-gray-500">사용 토큰</p>
            <p className="font-semibold text-gray-900">{reportData.metadata.tokensUsed?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">분석 파일</p>
            <p className="font-semibold text-gray-900">{reportData.metadata.filesProcessed}개</p>
          </div>
          <div>
            <p className="text-gray-500">상태</p>
            <p className="font-semibold text-green-600">✅ 완료</p>
          </div>
        </div>
      </div>
    </div>
  );
}
