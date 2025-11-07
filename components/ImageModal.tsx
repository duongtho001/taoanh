import React, { useEffect } from 'react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] p-4"
        onClick={e => e.stopPropagation()}
      >
        <img src={imageUrl} alt="Enlarged view" className="w-full h-full object-contain rounded-lg shadow-2xl" />
      </div>
       <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300 transition-colors"
        aria-label="Close image viewer"
      >
        &times;
      </button>
    </div>
  );
};

export default ImageModal;
