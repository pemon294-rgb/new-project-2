import React, { useState } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { loadImg } from '../../utils/imageUtils';

interface ImageItem {
  id: string;
  file: File;
  img: HTMLImageElement;
  preview: string;
}

const PAGE_SIZES = {
  a4: { w: 210, h: 297, label: 'A4' },
  letter: { w: 215.9, h: 279.4, label: 'Letter' },
  auto: { w: 0, h: 0, label: 'Fit to image' }
};

export default function JpgToPdf() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'auto'>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<'none' | 'small'>('none');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<{file: File, pages: number, size: number} | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    setErrorMsg(null);

    if (images.length + files.length > 20) {
      setErrorMsg('Maximum 20 images per PDF. You can create multiple PDFs.');
      return;
    }

    let totalSize = images.reduce((sum, img) => sum + img.file.size, 0);
    const newFiles = Array.from(files);
    for (const file of newFiles) {
      totalSize += file.size;
    }

    if (totalSize > 50 * 1024 * 1024) {
      setErrorMsg('Total file size exceeds 50 MB. Please reduce the number of images.');
      return;
    }

    try {
      const newImages: ImageItem[] = [];
      for (const file of newFiles) {
        if (!file.type.startsWith('image/')) {
          setErrorMsg(`Skipped ${file.name}: not an image file.`);
          continue;
        }
        const img = await loadImg(file);
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          img,
          preview: URL.createObjectURL(file)
        });
      }
      setImages([...images, ...newImages]);
    } catch (e) {
      setErrorMsg('Error loading one or more images.');
    }
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    const idx = images.findIndex(img => img.id === id);
    if (direction === 'up' && idx > 0) {
      const newImages = [...images];
      [newImages[idx], newImages[idx - 1]] = [newImages[idx - 1], newImages[idx]];
      setImages(newImages);
    } else if (direction === 'down' && idx < images.length - 1) {
      const newImages = [...images];
      [newImages[idx], newImages[idx + 1]] = [newImages[idx + 1], newImages[idx]];
      setImages(newImages);
    }
  };

  const generatePdf = async () => {
    if (images.length === 0) {
      setErrorMsg('Please add at least one image.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setPdfResult(null);

    try {
      const pdfDoc = await PDFDocument.create();
      let pageCount = 0;

      for (const imgItem of images) {
        const img = imgItem.img;

        // Determine page dimensions
        let pdfW = PAGE_SIZES.a4.w;
        let pdfH = PAGE_SIZES.a4.h;

        if (pageSize === 'letter') {
          pdfW = PAGE_SIZES.letter.w;
          pdfH = PAGE_SIZES.letter.h;
        } else if (pageSize === 'auto') {
          pdfW = img.width * 0.264583; // pixels to mm at 96 DPI
          pdfH = img.height * 0.264583;
        }

        // Apply orientation
        if (orientation === 'portrait' && pdfW > pdfH) {
          [pdfW, pdfH] = [pdfH, pdfW];
        } else if (orientation === 'landscape' && pdfW < pdfH) {
          [pdfW, pdfH] = [pdfH, pdfW];
        }

        // Convert mm to points (1 mm = 2.834645669 points)
        const pageW = pdfW * 2.834645669;
        const pageH = pdfH * 2.834645669;

        // Calculate margin in points
        const marginPts = margin === 'small' ? 10 : 0;
        const contentW = pageW - marginPts * 2;
        const contentH = pageH - marginPts * 2;

        // Create canvas to draw image
        const canvas = document.createElement('canvas');
        const imgAspect = img.width / img.height;
        const contentAspect = contentW / contentH;

        let drawW = contentW;
        let drawH = contentW / imgAspect;

        if (drawH > contentH) {
          drawH = contentH;
          drawW = contentH * imgAspect;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        const imgData = canvas.toDataURL('image/png');

        // Add page to PDF
        const page = pdfDoc.addPage([pageW, pageH]);
        const embeddedImg = await pdfDoc.embedPng(imgData);

        const offsetX = marginPts + (contentW - drawW) / 2;
        const offsetY = marginPts + (contentH - drawH) / 2;

        page.drawImage(embeddedImg, {
          x: offsetX,
          y: pageH - offsetY - drawH,
          width: drawW,
          height: drawH
        });

        pageCount++;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const file = new File([blob], 'images-to-pdf.pdf', { type: 'application/pdf' });

      setPdfResult({
        file,
        pages: pageCount,
        size: blob.size
      });
    } catch (e) {
      setErrorMsg('Error generating PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImages([]);
    setPdfResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {images.length === 0 && !pdfResult ? (
        <div
          className="border-2 border-dashed rounded-xl p-10 text-center border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            handleFileSelect(e.dataTransfer.files);
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          <p className="font-medium text-lg text-gray-700 mb-1">Click or Drag & Drop images here</p>
          <p className="text-sm text-gray-500">Supports JPG, PNG (up to 20 images, 50MB total)</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Image List */}
          {images.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Images ({images.length})</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {images.map((img, idx) => (
                  <div key={img.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <img src={img.preview} alt="preview" className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{img.file.name}</p>
                      <p className="text-xs text-gray-500">{img.img.width} × {img.img.height}px</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveImage(img.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveImage(img.id, 'down')}
                        disabled={idx === images.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium p-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                + Add more images
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          )}

          {/* Settings */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Size</label>
                <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="auto">Fit to image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                <select value={orientation} onChange={(e) => setOrientation(e.target.value as any)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                  <option value="auto">Auto</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
                <select value={margin} onChange={(e) => setMargin(e.target.value as any)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                  <option value="none">No margin</option>
                  <option value="small">Small margin</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
              <p>📄 {images.length} image{images.length !== 1 ? 's' : ''} → {images.length} page{images.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {errorMsg && <p className="text-red-500 font-medium">{errorMsg}</p>}

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Generating PDF...</p>
            </div>
          )}

          {pdfResult ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ PDF created successfully</p>
                <p className="text-sm text-green-700 mt-1">{pdfResult.pages} pages, {(pdfResult.size / 1024).toFixed(1)} KB</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={URL.createObjectURL(pdfResult.file)}
                  download="images-to-pdf.pdf"
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
          ) : !loading && images.length > 0 ? (
            <button
              onClick={generatePdf}
              disabled={images.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Generate PDF
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
