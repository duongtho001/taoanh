const GALLERY_KEY = 'duong-tho-app-gallery-images';

export const loadImages = (): string[] => {
  try {
    const items = window.localStorage.getItem(GALLERY_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Failed to load images from localStorage", error);
    return [];
  }
};

export const saveImages = (images: string[]): void => {
  try {
    window.localStorage.setItem(GALLERY_KEY, JSON.stringify(images));
  } catch (error) {
    console.error("Failed to save images to localStorage", error);
  }
};