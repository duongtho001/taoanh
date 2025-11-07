import React, { useState, useEffect, useCallback } from 'react';
import Nav from './components/Nav';
import PoseGenerator from './components/PoseGenerator';
import BackgroundChanger from './components/BackgroundChanger';
import PoseTransfer from './components/PoseTransfer';
import ExpressionChanger from './components/ExpressionChanger';
import Gallery from './components/Gallery';
import ImageModal from './components/ImageModal';
import ApiSettings from './components/ApiSettings'; // Import mới
import { loadImages, saveImages } from './utils/galleryUtils';
import { apiKeyManager } from './services/apiKeyManager'; // Import mới

type Tab = 'pose-generator' | 'background-changer' | 'pose-transfer' | 'expression-changer' | 'gallery' | 'api-settings'; // Thêm tab mới

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('pose-generator');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadImages();
    setGalleryImages(loaded);
    const status = loaded.reduce((acc, img) => ({ ...acc, [img]: true }), {});
    setSavedStatus(status);
    // Initialize the API key manager when the app loads
    apiKeyManager.loadKeys();
  }, []);
  
  const handleSaveToGallery = useCallback((imageUrl: string) => {
    setGalleryImages(prevImages => {
      if (prevImages.includes(imageUrl)) return prevImages;
      const newImages = [imageUrl, ...prevImages];
      saveImages(newImages);
      return newImages;
    });
    setSavedStatus(prev => ({ ...prev, [imageUrl]: true }));
  }, []);

  const handleRemoveFromGallery = useCallback((indexToRemove: number) => {
    const imageUrlToRemove = galleryImages[indexToRemove];
    setGalleryImages(prevImages => {
        const newImages = prevImages.filter((_, index) => index !== indexToRemove);
        saveImages(newImages);
        return newImages;
    });
    setSavedStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[imageUrlToRemove];
        return newStatus;
    });
  }, [galleryImages]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pose-generator':
        return <PoseGenerator onImageClick={handleImageClick} onSaveToGallery={handleSaveToGallery} savedStatus={savedStatus} />;
      case 'background-changer':
        return <BackgroundChanger onImageClick={handleImageClick} onSaveToGallery={handleSaveToGallery} savedStatus={savedStatus} />;
      case 'pose-transfer':
        return <PoseTransfer onImageClick={handleImageClick} onSaveToGallery={handleSaveToGallery} savedStatus={savedStatus} />;
      case 'expression-changer':
        return <ExpressionChanger onImageClick={handleImageClick} onSaveToGallery={handleSaveToGallery} savedStatus={savedStatus} />;
      case 'gallery':
        return <Gallery images={galleryImages} onImageClick={handleImageClick} onRemove={handleRemoveFromGallery} />;
      case 'api-settings': // Thêm case mới
        return <ApiSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Đường Thọ App
          </h1>
          <p className="text-slate-400 mt-2">
            Tạo ra những bức ảnh thời trang độc đáo với sức mạnh của AI
          </p>
        </header>
        
        <Nav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-8">
          {renderContent()}
        </div>

        {selectedImage && <ImageModal imageUrl={selectedImage} onClose={handleCloseModal} />}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm space-y-2">
        <p>
            App của Đường Thọ -{' '}
            <a 
                href="https://zalo.me/g/sgkzgk550" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline"
            >
                Tham gia nhóm của Thọ
            </a>
        </p>
        <p>Powered by Google Gemini. Not an official Google product.</p>
      </footer>
    </div>
  );
};

export default App;