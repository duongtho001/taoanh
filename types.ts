export interface UploadedImage {
  data: string; // base64 encoded
  mimeType: string;
  preview: string; // Object URL for preview
}

export interface FashionFormData {
  fashionType: string;
  backgroundStyle: string;
  numVariations: number;
  aspectRatio: string;
}