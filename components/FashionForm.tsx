import React, { useState } from 'react';
import { FashionFormData } from '../types';
import { getBackgroundSuggestions } from '../services/geminiService';
import AspectRatioSelector from './shared/AspectRatioSelector';

interface FashionFormProps {
  formData: FashionFormData;
  setFormData: React.Dispatch<React.SetStateAction<FashionFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
  isImageUploaded: boolean;
}

const fashionOptions = [
  "High Fashion", "Streetwear", "Vintage", "Luxury Evening", "Minimalist Casual"
];

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        {children}
    </div>
);

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


const FashionForm: React.FC<FashionFormProps> = ({ formData, setFormData, onSubmit, isLoading, isImageUploaded }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isRange = (e.target as HTMLInputElement).type === 'range';
    setFormData(prev => ({ ...prev, [name]: isRange ? parseInt(value, 10) : value }));
  };
  
  const handleAspectRatioChange = (value: string) => {
    setFormData(prev => ({ ...prev, aspectRatio: value }));
  };

  const handleGetSuggestions = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
        const result = await getBackgroundSuggestions(formData.fashionType);
        setSuggestions(result);
    } catch (error) {
        console.error("Failed to get suggestions:", error);
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, backgroundStyle: suggestion }));
    setSuggestions([]);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <FormField label="2. Chọn loại thời trang">
          <select
              name="fashionType"
              value={formData.fashionType}
              onChange={handleChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 text-white focus:ring-purple-500 focus:border-purple-500 transition"
          >
              {fashionOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
              ))}
          </select>
      </FormField>

      <FormField label="3. Mô tả phong cách nền mong muốn">
        <div className="relative">
            <input
              type="text"
              name="backgroundStyle"
              value={formData.backgroundStyle}
              onChange={handleChange}
              placeholder="Ví dụ: Đường phố Tokyo ban đêm..."
              className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm p-2 text-white focus:ring-purple-500 focus:border-purple-500 transition"
            />
             <button
              type="button"
              onClick={handleGetSuggestions}
              disabled={isSuggesting}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-purple-300 hover:text-purple-200 disabled:opacity-50"
            >
              {isSuggesting ? <SuggestionLoadingSpinner/> : <SuggestionIcon />}
              {isSuggesting ? 'Đang lấy...' : 'Gợi ý AI'}
            </button>
        </div>
        {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => handleSuggestionClick(s)}
                        className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-full text-xs text-slate-300 hover:bg-slate-600 hover:border-slate-500 transition-colors"
                    >
                        {s}
                    </button>
                ))}
            </div>
        )}
      </FormField>

      <AspectRatioSelector
          label="4. Chọn khung hình"
          value={formData.aspectRatio}
          onChange={handleAspectRatioChange}
       />

      <FormField label={`5. Số lượng biến thể: ${formData.numVariations}`}>
        <input
          type="range"
          name="numVariations"
          min="2"
          max="6"
          step="1"
          value={formData.numVariations}
          onChange={handleChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </FormField>


      <button
        type="submit"
        disabled={isLoading || !isImageUploaded}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </>
        ) : 'Tạo ảnh'}
      </button>
       {!isImageUploaded && <p className="text-xs text-center text-yellow-400 mt-2">Vui lòng tải ảnh lên để bắt đầu</p>}
    </form>
  );
};

export default FashionForm;