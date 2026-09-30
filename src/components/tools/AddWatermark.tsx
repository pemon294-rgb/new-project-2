import React, { useState } from 'react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

interface WatermarkResult {
  file: File;
  totalPages: number;
  appliedTo: number;
  fileSize: number;
}

type WatermarkType = 'text' | 'image';
type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tiled';

export default function AddWatermark() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');

  // Text watermark
  const [watermarkText, setWatermarkText] = useState('WATERMARK');
  const [textFontSize, setTextFontSize] = useState(60);
  const [textColor, setTextColor] = useState('#000000');
  const [textRotation, setTextRotation] = useState(45);
  const [textOpacity, setTextOpacity] = useState(30);

  // Image watermark
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [imageScale, setImageScale] = useState(100);
  const [imageOpacity, setImageOpacity] = useState(30);

  // Common
  const [position, setPosition] = useState<WatermarkPosition>('center');
  const [applyTo, setApplyTo] = useState<'all' | 'range'>('all');
  const [pageRange, setPageRange] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<WatermarkResult | null>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const handlePdfSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const file = files[0];
    if (file.type !== 'application/pdf') {
      setErrorMsg('Please upload a valid PDF file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('PDF file exceeds 50 MB. Please use a smaller file.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const count = pdfDoc.getPageCount();

      setPdfFile(file);
      setPageCount(count);
      setResult(null);
    } catch (e) {
      setErrorMsg('Error reading PDF: file may be corrupted or password-protected.');
    }
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const file = files[0];
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setErrorMsg('Please upload a PNG or JPG image.');
      return;
    }

    setWatermarkImage(file);
  };

  const parsePageRange = (input: string, maxPages: number): number[] => {
    if (!input.trim()) return Array.from({ length: maxPages }, (_, i) => i);

    const pages: number[] = [];
    const parts = input.split(',').map(s => s.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(s => parseInt(s.trim()) - 1);
        if (isNaN(start) || isNaN(end) || start < 0 || end >= maxPages || start > end) {
          throw new Error(`Invalid range: ${part}`);
        }
        for (let i = start; i <= end; i++) pages.push(i);
      } else {
        const pageNum = parseInt(part) - 1;
        if (isNaN(pageNum) || pageNum < 0 || pageNum >= maxPages) {
          throw new Error(`Invalid page number: ${part}`);
        }
        pages.push(pageNum);
      }
    }

    return pages;
  };

  const getPageIndicesToApply = (): number[] => {
    if (applyTo === 'all') {
      return Array.from({ length: pageCount }, (_, i) => i);
    } else {
      try {
        return parsePageRange(pageRange, pageCount);
      } catch {
        return [];
      }
    }
  };

  const getCoordinates = (width: number, height: number): [number, number] => {
    const margin = 50;
    let x = width / 2;
    let y = height / 2;

    switch (position) {
      case 'top-left':
        x = margin;
        y = height - margin;
        break;
      case 'top-right':
        x = width - margin;
        y = height - margin;
        break;
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'bottom-right':
        x = width - margin;
        y = margin;
        break;
      case 'center':
      case 'tiled':
        x = width / 2;
        y = height / 2;
        break;
    }

    return [x, y];
  };

  const addWatermark = async () => {
    if (!pdfFile) {
      setErrorMsg('Please upload a PDF first.');
      return;
    }

    if (watermarkType === 'text' && !watermarkText.trim()) {
      setErrorMsg('Please enter watermark text.');
      return;
    }

    if (watermarkType === 'image' && !watermarkImage) {
      setErrorMsg('Please upload an image for the watermark.');
      return;
    }

    const pagesToApply = getPageIndicesToApply();
    if (pagesToApply.length === 0) {
      setErrorMsg('Invalid page range.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Convert color hex to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255] : [0, 0, 0];
      };

      if (watermarkType === 'text') {
        const [r, g, b] = hexToRgb(textColor);
        const opacityVal = textOpacity / 100;

        for (const pageIdx of pagesToApply) {
          if (pageIdx < pages.length) {
            const page = pages[pageIdx];
            const { width, height } = page.getSize();

            if (position === 'tiled') {
              // Tiled watermark (3x3 grid)
              const tileWidth = width / 3;
              const tileHeight = height / 3;

              for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                  const x = tileWidth * col + tileWidth / 2;
                  const y = tileHeight * row + tileHeight / 2;

                  page.drawText(watermarkText, {
                    x,
                    y,
                    size: textFontSize * 0.4,
                    color: rgb(r, g, b),
                    opacity: opacityVal,
                    rotate: degrees(textRotation),
                    font: await pdfDoc.embedFont('Helvetica')
                  });
                }
              }
            } else {
              const [x, y] = getCoordinates(width, height);

              page.drawText(watermarkText, {
                x,
                y,
                size: textFontSize,
                color: rgb(r, g, b),
                opacity: opacityVal,
                rotate: degrees(textRotation),
                font: await pdfDoc.embedFont('Helvetica')
              });
            }
          }
        }
      } else if (watermarkType === 'image' && watermarkImage) {
        const imageArrayBuffer = await watermarkImage.arrayBuffer();
        const mimeType = watermarkImage.type === 'image/png' ? 'image/png' : 'image/jpeg';
        let embeddedImage;

        if (mimeType === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(imageArrayBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imageArrayBuffer);
        }

        const { width: imgWidth, height: imgHeight } = embeddedImage;
        const scale = imageScale / 100;
        const scaledWidth = imgWidth * scale * 0.3; // Scale down for watermark
        const scaledHeight = imgHeight * scale * 0.3;
        const opacityVal = imageOpacity / 100;

        for (const pageIdx of pagesToApply) {
          if (pageIdx < pages.length) {
            const page = pages[pageIdx];
            const { width, height } = page.getSize();

            if (position === 'tiled') {
              // Tiled watermark (3x3 grid)
              const tileWidth = width / 3;
              const tileHeight = height / 3;

              for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                  const x = tileWidth * col + (tileWidth - scaledWidth) / 2;
                  const y = tileHeight * row + (tileHeight - scaledHeight) / 2;

                  page.drawImage(embeddedImage, {
                    x,
                    y,
                    width: scaledWidth,
                    height: scaledHeight,
                    opacity: opacityVal
                  });
                }
              }
            } else {
              let [x, y] = getCoordinates(width, height);
              x -= scaledWidth / 2;
              y -= scaledHeight / 2;

              page.drawImage(embeddedImage, {
                x,
                y,
                width: scaledWidth,
                height: scaledHeight,
                opacity: opacityVal
              });
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newFile = new File([blob], 'watermarked.pdf', { type: 'application/pdf' });

      setResult({
        file: newFile,
        totalPages: pages.length,
        appliedTo: pagesToApply.length,
        fileSize: blob.size
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('password')) {
        setErrorMsg('This PDF is password-protected and cannot be edited.');
      } else {
        setErrorMsg('Error processing PDF. File may be corrupted.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setPageCount(0);
    setWatermarkImage(null);
    setResult(null);
    setErrorMsg(null);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const pagesToApply = getPageIndicesToApply();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {!pdfFile ? (
        <div
          className="border-2 border-dashed rounded-xl p-10 text-center border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => pdfInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handlePdfSelect(e.dataTransfer.files);
          }}
        >
          <input
            type="file"
            ref={pdfInputRef}
            className="hidden"
            accept=".pdf,application/pdf"
            onChange={(e) => handlePdfSelect(e.target.files)}
          />
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="font-medium text-lg text-gray-700 mb-1">Click or Drag & Drop a PDF here</p>
          <p className="text-sm text-gray-500">Upload a PDF file (max 50 MB)</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">{pdfFile.name}</p>
            <p className="text-xs text-blue-700 mt-1">{pageCount} page{pageCount !== 1 ? 's' : ''} • {(pdfFile.size / 1024).toFixed(1)} KB</p>
          </div>

          {/* Watermark Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Watermark type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={watermarkType === 'text'}
                  onChange={() => setWatermarkType('text')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Text watermark</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={watermarkType === 'image'}
                  onChange={() => setWatermarkType('image')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Image watermark</span>
              </label>
            </div>
          </div>

          {/* Text Watermark Options */}
          {watermarkType === 'text' && (
            <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Watermark text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font size: {textFontSize}pt</label>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    value={textFontSize}
                    onChange={(e) => setTextFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opacity: {textOpacity}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={textOpacity}
                    onChange={(e) => setTextOpacity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rotation: {textRotation}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={textRotation}
                    onChange={(e) => setTextRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Image Watermark Options */}
          {watermarkType === 'image' && (
            <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {watermarkImage ? watermarkImage.name : 'Upload watermark image (PNG or JPG)'}
                </label>
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/png,image/jpeg"
                  onChange={(e) => handleImageSelect(e.target.files)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scale: {imageScale}%</label>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    value={imageScale}
                    onChange={(e) => setImageScale(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opacity: {imageOpacity}%</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={imageOpacity}
                    onChange={(e) => setImageOpacity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'tiled'] as const).map(pos => (
                <label key={pos} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={position === pos}
                    onChange={() => setPosition(pos)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {pos === 'center' && 'Center'}
                    {pos === 'top-left' && 'Top-left'}
                    {pos === 'top-right' && 'Top-right'}
                    {pos === 'bottom-left' && 'Bottom-left'}
                    {pos === 'bottom-right' && 'Bottom-right'}
                    {pos === 'tiled' && 'Tiled'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply To */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Apply to</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={applyTo === 'all'}
                  onChange={() => setApplyTo('all')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">All pages</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={applyTo === 'range'}
                  onChange={() => setApplyTo('range')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Specific pages</span>
              </label>
              {applyTo === 'range' && (
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1-3,5,7-9"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm ml-6"
                />
              )}
            </div>
          </div>

          {/* Summary */}
          {pagesToApply.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                📄 Watermark will be applied to {pagesToApply.length} page{pagesToApply.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {errorMsg && <p className="text-red-500 font-medium text-sm">{errorMsg}</p>}

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Adding watermark...</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ Watermark added successfully</p>
                <p className="text-sm text-green-700 mt-1">
                  {result.totalPages} page{result.totalPages !== 1 ? 's' : ''} • {(result.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={URL.createObjectURL(result.file)}
                  download="watermarked.pdf"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transform hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download PDF
                </a>
                <button
                  onClick={reset}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-full transition-all"
                >
                  Start over
                </button>
              </div>
            </div>
          ) : !loading && pdfFile ? (
            <button
              onClick={addWatermark}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Add Watermark
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
