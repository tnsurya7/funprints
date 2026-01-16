'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface LogoUploadProps {
  onLogoSelect: (logoUrl: string) => void;
  currentLogo?: string;
}

export default function LogoUpload({ onLogoSelect, currentLogo }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onLogoSelect(result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onLogoSelect('');
  };

  return (
    <div className="mt-4 p-4 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="w-5 h-5 text-purple-600" />
        <h4 className="font-semibold text-purple-900">Add Your Logo (Optional)</h4>
      </div>
      <p className="text-sm text-purple-700 mb-3">
        Upload your logo to print on this t-shirt
      </p>

      {preview ? (
        <div className="relative">
          <div className="relative w-32 h-32 bg-white rounded-lg border-2 border-purple-300 overflow-hidden">
            <Image
              src={preview}
              alt="Logo preview"
              fill
              className="object-contain p-2"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm text-green-600 mt-2 font-semibold">✓ Logo uploaded</p>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-purple-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-sm text-purple-600 font-semibold">
              {uploading ? 'Uploading...' : 'Click to upload'}
            </p>
            <p className="text-xs text-purple-500 mt-1">PNG, JPG, SVG (Max 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
