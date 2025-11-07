import React, { useState, useCallback } from 'react';
import { changeExpression } from '../services/geminiService';
import { UploadedImage } from '../types';
import ImageUploader from './ImageUploader';
import ResultDisplay from './ResultDisplay';
import { fileToBase64 } from '../utils/fileUtils';
import AspectRatioSelector from './shared/AspectRatioSelector';

interface ExpressionChangerProps {
    onImageClick: (imageUrl: string) => void;
    onSaveToGallery: (imageUrl: string) => void;
    savedStatus: Record<string, boolean>;
}

const expressionPresets = [
    { label: 'Vui vẻ', value: 'a happy, joyful smile' },
    { label: 'Buồn', value: 'a sad, melancholic expression' },
    { label: 'Ngạc nhiên', value: 'a surprised look with wide eyes' },
    { label: 'Tức giận', value: 'an angry, frowning expression' },
    { label: 'Cười mỉm', value: 'a gentle, subtle smile' },
    { label: 'Tự tin', value: 'a confident, self-assured smirk' },
];

const ExpressionChanger: React.FC<ExpressionChangerProps> = ({ onImageClick, onSaveToGallery, savedStatus }) => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [expressionPrompt, setExpressionPrompt] = useState<string>(expressionPresets[0].value);
  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const { base64, mimeType } = await fileToBase64(file);
      setUploadedImage({
        data: base64,
        mimeType: mimeType,
        preview: URL.createObjectURL(file),
      });
      setGeneratedImage(null);
      setError(null);
    } catch (err) {
      setError('Không thể tải ảnh lên. Vui lòng thử lại.');
      console.error(err);
    }
  }, []);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExpressionPrompt(e.target.value);
  };

  const handleSubmit = useCallback(async () => {
    if (!uploadedImage) {
      setError('Vui lòng tải ảnh lên trước.');
      return;
    }
    if (!expressionPrompt.trim()) {
        setError('Vui lòng mô tả biểu cảm bạn muốn.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultBase64 = await changeExpression(uploadedImage, expressionPrompt, aspectRatio);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      console.error('API Error:', err);
      setError('Đã xảy ra lỗi khi thay đổi biểu cảm. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, expressionPrompt, aspectRatio]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg">
        <ImageUploader
          onImageUpload={handleImageUpload}
          previewUrl={uploadedImage?.preview ?? null}
        />
        
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    2. Chọn hoặc mô tả biểu cảm
                </label>
                <select
                    value={expressionPresets.find(p => p.value === expressionPrompt) ? expressionPrompt : 'custom'}
                    onChange={handlePresetChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 text-white focus:ring-purple-500 focus:border-purple-500 transition mb-3"
                >
                    {expressionPresets.map(preset => (
                        <option key={preset.label} value={preset.value}>{preset.label}</option>
                    ))}
                    <option value="custom">Khác (nhập bên dưới)</option>
                </select>
                 <textarea
                    value={expressionPrompt}
                    onChange={(e) => setExpressionPrompt(e.target.value)}
                    placeholder="Ví dụ: Một nụ cười tự tin và rạng rỡ..."
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 text-white focus:ring-purple-500 focus:border-purple-500 transition"
                />
            </div>

            <AspectRatioSelector 
                label="3. Chọn khung hình"
                value={aspectRatio}
                onChange={setAspectRatio}
            />
        </div>

        <button
            onClick={handleSubmit}
            disabled={isLoading || !uploadedImage}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
            {isLoading ? 'Đang xử lý...' : 'Thay Đổi Biểu Cảm'}
        </button>
         {!uploadedImage && <p className="text-xs text-center text-yellow-400 -mt-4">Vui lòng tải ảnh lên để bắt đầu</p>}
      </div>
      <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-center min-h-[600px] lg:min-h-0">
        <ResultDisplay
          generatedImages={generatedImage ? [generatedImage] : null}
          isLoading={isLoading}
          error={error}
          onUpscale={() => {}} // Not used
          isUpscaling={null}
          onImageClick={onImageClick}
          onSaveToGallery={onSaveToGallery}
          savedStatus={savedStatus}
        />
      </div>
    </div>
  );
};

export default ExpressionChanger;