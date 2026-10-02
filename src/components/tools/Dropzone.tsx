import React, { useRef, useState } from 'react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  targetInfo?: string;
}

export default function Dropzone({ onFileSelect, targetInfo }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const handleFile = (selectedFile: File) => {
    setErrorMsg(null);
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMsg('Warning: Image is larger than 15MB. It might take longer to process.');
    }
    onFileSelect(selectedFile);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      ref={dropzoneRef}
      className="border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer"
      style={{
        borderColor: isDragOver ? '#3b82f6' : '#d1d5db',
        backgroundColor: isDragOver ? '#eff6ff' : 'transparent'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onTouchEnd={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <div className="text-gray-500 mb-3">
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
        </svg>
        <p className="font-medium text-lg text-gray-700">Click or Drag & Drop image here</p>
        <p className="text-sm">Supports JPG, PNG, WebP</p>
      </div>
      {targetInfo && <p className="text-sm text-gray-400">{targetInfo}</p>}
      {errorMsg && <p className="mt-4 text-red-500 font-medium">{errorMsg}</p>}
    </div>
  );
}
