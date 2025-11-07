
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  previewUrl: string | null;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        1. Tải ảnh của bạn
      </label>
      <div
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md cursor-pointer h-64 bg-slate-800 hover:bg-slate-700 transition-colors"
        onClick={handleClick}
      >
        <div className="space-y-1 text-center flex flex-col items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
          ) : (
            <>
              <UploadIcon />
              <div className="flex text-sm text-slate-400">
                <p className="pl-1">Nhấp để tải lên hoặc kéo và thả</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, WEBP</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUploader;
