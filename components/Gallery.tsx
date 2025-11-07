import React from 'react';

interface GalleryProps {
  images: string[];
  onImageClick: (imageUrl: string) => void;
  onRemove: (index: number) => void;
}

const EmptyGallery: React.FC = () => (
  <div className="text-center text-slate-500 py-16">
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <h3 className="mt-4 text-xl font-semibold text-slate-300">Thư viện của bạn trống</h3>
    <p className="mt-2">Hãy bắt đầu tạo và lưu những tác phẩm AI của bạn!</p>
  </div>
);


const Gallery: React.FC<GalleryProps> = ({ images, onImageClick, onRemove }) => {
  if (images.length === 0) {
    return <EmptyGallery />;
  }

  return (
    <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((imageSrc, index) => (
            <div key={index} className="relative group aspect-square">
            <img
                src={imageSrc}
                alt={`Saved creation ${index + 1}`}
                className="w-full h-full object-cover rounded-lg cursor-pointer"
                onClick={() => onImageClick(imageSrc)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button 
                    onClick={() => onImageClick(imageSrc)}
                    className="text-white p-2"
                    aria-label="Enlarge image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                 </button>
            </div>
            <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                aria-label="Remove from gallery"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            </div>
        ))}
        </div>
    </div>
  );
};

export default Gallery;