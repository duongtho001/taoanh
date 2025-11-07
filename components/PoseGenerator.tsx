import React, { useState, useCallback } from 'react';
import { generateFashionImage, upscaleImage } from '../services/geminiService';
import { FashionFormData, UploadedImage } from '../types';
import ImageUploader from './ImageUploader';
import FashionForm from './FashionForm';
import ResultDisplay from './ResultDisplay';
import { fileToBase64 } from '../utils/fileUtils';

interface PoseGeneratorProps {
    onImageClick: (imageUrl: string) => void;
    onSaveToGallery: (imageUrl: string) => void;
    savedStatus: Record<string, boolean>;
}

const PoseGenerator: React.FC<PoseGeneratorProps> = ({ onImageClick, onSaveToGallery, savedStatus }) => {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [formData, setFormData] = useState<FashionFormData>({
    fashionType: 'High Fashion',
    backgroundStyle: 'Studio pastel hồng',
    numVariations: 2,
    aspectRatio: '4:5',
  });
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpscaling, setIsUpscaling] = useState<number | null>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const { base64, mimeType } = await fileToBase64(file);
      setUploadedImage({
        data: base64,
        mimeType: mimeType,
        preview: URL.createObjectURL(file),
      });
      setGeneratedImages(null);
      setError(null);
    } catch (err) {
      setError('Không thể tải ảnh lên. Vui lòng thử lại.');
      console.error(err);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!uploadedImage) {
      setError('Vui lòng tải ảnh lên trước.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);

    try {
      const resultBase64Array = await generateFashionImage(uploadedImage, formData);
      setGeneratedImages(resultBase64Array.map(base64 => `data:image/png;base64,${base64}`));
    } catch (err) {
      console.error('API Error:', err);
      setError('Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, formData]);

  const handleUpscale = useCallback(async (index: number) => {
    if (!generatedImages || !generatedImages[index]) return;

    setIsUpscaling(index);
    setError(null);

    try {
      const imageToUpscale = generatedImages[index];
      const base64Data = imageToUpscale.split(',')[1];
      
      const upscaledBase64 = await upscaleImage(base64Data);

      setGeneratedImages(currentImages => {
        if (!currentImages) return null;
        const newImages = [...currentImages];
        newImages[index] = `data:image/png;base64,${upscaledBase64}`;
        return newImages;
      });

    } catch (err) {
      console.error('Upscale API Error:', err);
      setError('Không thể upscale ảnh. Vui lòng thử lại.');
    } finally {
      setIsUpscaling(null);
    }
  }, [generatedImages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-lg">
        <ImageUploader
          onImageUpload={handleImageUpload}
          previewUrl={uploadedImage?.preview ?? null}
        />
        <FashionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isImageUploaded={!!uploadedImage}
        />
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

export default PoseGenerator;