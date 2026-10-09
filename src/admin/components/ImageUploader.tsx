import React, { useState, useRef } from 'react';
import { UploadCloud, X, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImageToSupabase, deleteImageFromSupabase } from '../../services/supabaseService';

interface ImageUploaderProps {
  bucket: 'banners' | 'categories' | 'products';
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  images = [],
  onChange,
  multiple = true,
  maxFiles = 6,
  label = 'Upload Images from Gallery',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadProgress(10);

    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const uploadList = multiple ? fileArray.slice(0, maxFiles - images.length) : [fileArray[0]];

    const newUploadedUrls: string[] = [];

    for (let i = 0; i < uploadList.length; i++) {
      const file = uploadList[i];
      try {
        const url = await uploadImageToSupabase(file, bucket);
        if (url) {
          newUploadedUrls.push(url);
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
      }
      setUploadProgress(Math.round(((i + 1) / uploadList.length) * 100));
    }

    if (multiple) {
      onChange([...images, ...newUploadedUrls]);
    } else {
      // Single image mode
      if (newUploadedUrls.length > 0) {
        onChange([newUploadedUrls[0]]);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const removedUrl = images[index];
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (removedUrl) {
      await deleteImageFromSupabase(bucket, removedUrl);
    }
  };

  const handleMove = (fromIndex: number, toIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-3">
      {label && (
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Upload Dropzone Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
          dragOver
            ? 'border-[#D4AF37] bg-[#FAF7EC]'
            : 'border-gray-300 hover:border-[#D4AF37] bg-gray-50/70 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {isUploading ? (
          <div className="py-3 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            <p className="text-xs font-bold text-[#06201A]">
              Compressing & Uploading ({uploadProgress}%)...
            </p>
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E8CE7A] transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-12 h-12 rounded-full bg-[#06201A] text-[#D4AF37] flex items-center justify-center shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#06201A]">
                Tap to Select from Gallery / Camera Roll
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                PNG, JPG, WEBP • Auto-compressed for high speed
              </p>
            </div>
            <span className="mt-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FAF7EC] text-[#AA820A] border border-[#D4AF37]/40">
              {multiple ? `Up to ${maxFiles} Images` : 'Single Main Image'}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails Gallery Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#D4AF37] bg-neutral-900 shadow-xs"
            >
              <img
                src={url}
                alt={`Uploaded ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Main Badge on First Image */}
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-[#D4AF37] text-[#06201A] text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5 z-10">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Main</span>
                </div>
              )}

              {/* Action Overlays */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1 z-20">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={(e) => handleMove(idx, idx - 1, e)}
                    className="p-1 rounded-full bg-white/90 text-gray-800 hover:bg-[#D4AF37] hover:text-[#06201A] transition-colors"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleMove(idx, idx + 1, e)}
                    className="p-1 rounded-full bg-white/90 text-gray-800 hover:bg-[#D4AF37] hover:text-[#06201A] transition-colors"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => handleRemove(idx, e)}
                  className="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
