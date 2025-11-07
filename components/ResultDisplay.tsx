import React from 'react';

interface ResultDisplayProps {
  generatedImages: string[] | null;
  isLoading: boolean;
  error: string | null;
  onUpscale: (index: number) => void;
  isUpscaling: number | null;
  onImageClick: (imageUrl: string) => void;
  onSaveToGallery: (imageUrl: string) => void;
  savedStatus: Record<string, boolean>;
}

const LoadingIndicator: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
    <p className="text-slate-300 mt-4 text-lg font-medium">AI đang sáng tạo...</p>
    <p className="text-slate-400 mt-2 text-sm">Quá trình này có thể mất vài phút. Vui lòng chờ.</p>
  </div>
);

const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center text-slate-500 h-full">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-semibold">Kết quả của bạn sẽ xuất hiện ở đây</h3>
        <p className="mt-2 max-w-sm">Hoàn thành các bước và nhấn "Tạo ảnh" để xem điều kỳ diệu xảy ra.</p>
    </div>
);


const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center text-red-400 h-full p-4 border border-red-400/50 bg-red-500/10 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold">Oops! Đã có lỗi xảy ra</h3>
        <p className="mt-2 text-sm">{message}</p>
    </div>
);

const UpscalingSpinner: React.FC = () => (
  <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center backdrop-blur-sm z-10">
    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span className="mt-2 text-white text-sm">Đang upscale...</span>
  </div>
);

const ZoomIcon: React.FC = () => (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
    </div>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ generatedImages, isLoading, error, onUpscale, isUpscaling, onImageClick, onSaveToGallery, savedStatus }) => {
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (generatedImages && generatedImages.length > 0) {
    return (
      <div className="w-full flex flex-col items-center gap-4">
        <p className="font-semibold text-lg text-slate-300">Đây là kết quả của bạn!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-h-[75vh] overflow-y-auto p-1">
          {generatedImages.map((imageSrc, index) => {
            const isCurrentlyUpscaling = isUpscaling === index;
            const isSaved = savedStatus[imageSrc];
            return (
              <div key={index} className="flex flex-col items-center gap-3">
                <div 
                  className="relative aspect-[4/5] w-full max-w-md rounded-lg overflow-hidden shadow-2xl shadow-black/50 group cursor-pointer"
                  onClick={() => onImageClick(imageSrc)}
                >
                  {isCurrentlyUpscaling && <UpscalingSpinner />}
                  <img src={imageSrc} alt={`Generated variation ${index + 1}`} className="w-full h-full object-cover" />
                  <ZoomIcon />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                   <button
                    onClick={(e) => { e.stopPropagation(); onUpscale(index); }}
                    disabled={isCurrentlyUpscaling || isUpscaling !== null}
                    className="inline-flex items-center justify-center py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upscale lên 8K
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSaveToGallery(imageSrc); }}
                    disabled={isSaved}
                    className={`inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSaved ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600 border-slate-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isSaved ? 'Đã lưu' : 'Lưu vào thư viện'}
                  </button>
                  <a
                    href={imageSrc}
                    onClick={(e) => e.stopPropagation()}
                    download={`fashion-ai-image-${Date.now()}-${index}.png`}
                    className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 transition-all"
                  >
                    Tải xuống
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <Placeholder />;
};

export default ResultDisplay;