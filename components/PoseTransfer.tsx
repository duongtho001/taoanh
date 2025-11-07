import React, { useState, useCallback } from 'react';
import { transferPose, getPoseSuggestions, upscaleImage } from '../services/geminiService';
import { UploadedImage } from '../types';
import ImageUploader from './ImageUploader';
import ResultDisplay from './ResultDisplay';
import { fileToBase64 } from '../utils/fileUtils';
import AspectRatioSelector from './shared/AspectRatioSelector';

interface PoseTransferProps {
    onImageClick: (imageUrl: string) => void;
    onSaveToGallery: (imageUrl: string) => void;
    savedStatus: Record<string, boolean>;
}

const SuggestionIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const SuggestionLoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const PoseTransfer: React.FC<PoseTransferProps> = ({ onImageClick, onSaveToGallery, savedStatus }) => {
  const [subjectImage, setSubjectImage] = useState<UploadedImage | null>(null);
  const [posePrompt, setPosePrompt] = useState<string>('');
  const [numVariations, setNumVariations] = useState<number>(2);
  const [aspectRatio, setAspectRatio] = useState('4:5');

  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpscaling, setIsUpscaling] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  const handleSubjectImageUpload = useCallback(async (file: File) => {
    try {
      const { base64, mimeType } = await fileToBase64(file);
      setSubjectImage({ data: base64, mimeType, preview: URL.createObjectURL(file) });
      setGeneratedImages(null);
      setError(null);
    } catch (err) { setError('Không thể tải ảnh chủ thể.'); console.error(err); }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!subjectImage) {
      setError('Vui lòng tải lên ảnh chủ thể để tiếp tục.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    try {
      const resultBase64 = await transferPose(subjectImage, posePrompt, numVariations, aspectRatio);
      setGeneratedImages(resultBase64.map(base64 => `data:image/png;base64,${base64}`));
    } catch (err) {
      console.error('API Error:', err);
      setError('Đã xảy ra lỗi khi tạo dáng mới.');
    } finally {
      setIsLoading(false);
    }
  }, [subjectImage, posePrompt, numVariations, aspectRatio]);

  const handleUpscale = useCallback(async (index: number) => {
    if (!generatedImages || !generatedImages[index]) return;
    setIsUpscaling(index);
    setError(null);
    try {
      const base64Data = generatedImages[index].split(',')[1];
      const upscaledBase64 = await upscaleImage(base64Data);
      setGeneratedImages(current => {
        if (!current) return null;
        const newImages = [...current];
        newImages[index] = `data:image/png;base64,${upscaledBase64}`;
        return newImages;
      });
    } catch (err) {
      console.error('Upscale API Error:', err);
      setError('Không thể upscale ảnh.');
    } finally {
      setIsUpscaling(null);
    }
  }, [generatedImages]);
  
  const handleGetSuggestions = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
        const result = await getPoseSuggestions();
        setSuggestions(result);
    } catch (error) {
        console.error("Failed to get pose suggestions:", error);
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPosePrompt(suggestion);
    setSuggestions([]);
  };

  const isButtonDisabled = isLoading || !subjectImage;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg">
        <ImageUploader onImageUpload={handleSubjectImageUpload} previewUrl={subjectImage?.preview ?? null} />
        
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">1. (Tùy chọn) Mô tả dáng mong muốn</label>
            <div className="relative">
                <input
                    type="text"
                    value={posePrompt}
                    onChange={(e) => setPosePrompt(e.target.value)}
                    placeholder="Ví dụ: Tay chống hông, nhìn qua vai..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 text-white focus:ring-purple-500 focus:border-purple-500 transition"
                />
                 <button type="button" onClick={handleGetSuggestions} disabled={isSuggesting} className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-purple-300 hover:text-purple-200 disabled:opacity-50">
                  {isSuggesting ? <SuggestionLoadingSpinner/> : <SuggestionIcon />}
                  {isSuggesting ? 'Đang lấy...' : 'Gợi ý AI'}
                </button>
            </div>
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {suggestions.map((s, i) => (
                        <button key={i} type="button" onClick={() => handleSuggestionClick(s)} className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-full text-xs text-slate-300 hover:bg-slate-600 hover:border-slate-500 transition-colors">
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <AspectRatioSelector
          label="2. Chọn khung hình"
          value={aspectRatio}
          onChange={setAspectRatio}
        />

        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{`3. Số lượng biến thể: ${numVariations}`}</label>
            <input
              type="range"
              name="numVariations"
              min="2" max="6" step="1"
              value={numVariations}
              onChange={(e) => setNumVariations(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
        </div>

        <button onClick={handleSubmit} disabled={isButtonDisabled} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            {isLoading ? 'Đang xử lý...' : 'Tạo Dáng Mới'}
        </button>
         {(!subjectImage) && <p className="text-xs text-center text-yellow-400 -mt-4">Vui lòng tải lên ảnh chủ thể</p>}
      </div>
      <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-center min-h-[600px] lg:min-h-0">
        <ResultDisplay
          generatedImages={generatedImages}
          isLoading={isLoading}
          error={error}
          onUpscale={handleUpscale}
          isUpscaling={isUpscaling}
          onImageClick={onImageClick}
          onSaveToGallery={onSaveToGallery}
          savedStatus={savedStatus}
        />
      </div>
    </div>
  );
};

export default PoseTransfer;