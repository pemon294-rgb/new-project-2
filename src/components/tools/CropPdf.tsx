import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface CropResult {
  file: File;
  totalPages: number;
  croppedPages: number;
  fileSize: number;
}

interface CropMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export default function CropPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [cropMargins, setCropMargins] = useState<CropMargins>({ top: 10, bottom: 10, left: 10, right: 10 });
  const [marginUnit, setMarginUnit] = useState<'mm' | 'percent'>('mm');
  const [applyTo, setApplyTo] = useState<'all' | 'range'>('all');
  const [pageRange, setPageRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<CropResult | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
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
      setPreviewReady(true);
    } catch (e) {
      setErrorMsg('Error reading PDF: file may be corrupted or password-protected.');
    }
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

  const updateMargin = (key: keyof CropMargins, value: number) => {
    setCropMargins(prev => ({ ...prev, [key]: Math.max(0, value) }));
  };

  const cropPdf = async () => {
    if (!pdfFile) {
      setErrorMsg('Please upload a PDF first.');
      return;
    }

    const pagesToCrop = getPageIndicesToApply();
    if (pagesToCrop.length === 0) {
      setErrorMsg('Invalid page range.');
      return;
    }

    // Validate margins aren't too large (rough check)
    if (marginUnit === 'percent') {
      if (cropMargins.left + cropMargins.right >= 100 || cropMargins.top + cropMargins.bottom >= 100) {
        setErrorMsg('Crop margins are too large. The crop box would be empty.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      for (const pageIdx of pagesToCrop) {
        if (pageIdx < pages.length) {
          const page = pages[pageIdx];
          const { width, height } = page.getSize();

          // Calculate crop box coordinates
          let cropLeft = 0;
          let cropBottom = 0;
          let cropRight = width;
          let cropTop = height;

          if (marginUnit === 'mm') {
            // Convert mm to points (1mm ≈ 2.834645669 points)
            const mmToPoints = 2.834645669;
            const leftPt = cropMargins.left * mmToPoints;
            const rightPt = cropMargins.right * mmToPoints;
            const topPt = cropMargins.top * mmToPoints;
            const bottomPt = cropMargins.bottom * mmToPoints;

            cropLeft = leftPt;
            cropBottom = bottomPt;
            cropRight = width - rightPt;
            cropTop = height - topPt;
          } else {
            // Percentage
            cropLeft = (width * cropMargins.left) / 100;
            cropRight = width - (width * cropMargins.right) / 100;
            cropTop = height - (height * cropMargins.top) / 100;
            cropBottom = (height * cropMargins.bottom) / 100;
          }

          // Validate crop box
          if (cropLeft >= cropRight || cropBottom >= cropTop) {
            setErrorMsg('Crop margins are too large for one or more pages.');
            setLoading(false);
            return;
          }

          // Apply crop box
          page.setCropBox(cropLeft, cropBottom, cropRight, cropTop);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newFile = new File([blob], 'cropped.pdf', { type: 'application/pdf' });

      setResult({
        file: newFile,
        totalPages: pages.length,
        croppedPages: pagesToCrop.length,
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
    setResult(null);
    setErrorMsg(null);
    setPreviewReady(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const pagesToApply = getPageIndicesToApply();

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {!pdfFile ? (
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
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileSelect(e.target.files)}
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

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Crop behavior may vary depending on the PDF viewer. Most modern viewers display the cropped area correctly.
            </p>
          </div>

          {/* Margin Unit Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Margin unit</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={marginUnit === 'mm'}
                  onChange={() => setMarginUnit('mm')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Millimeters (mm)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={marginUnit === 'percent'}
                  onChange={() => setMarginUnit('percent')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Percentage (%)</span>
              </label>
            </div>
          </div>

          {/* Crop Margins */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Crop margins {marginUnit === 'mm' ? '(mm)' : '(%)'}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Top</label>
                <input
                  type="number"
                  min="0"
                  max={marginUnit === 'percent' ? 50 : 200}
                  value={cropMargins.top}
                  onChange={(e) => updateMargin('top', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bottom</label>
                <input
                  type="number"
                  min="0"
                  max={marginUnit === 'percent' ? 50 : 200}
                  value={cropMargins.bottom}
                  onChange={(e) => updateMargin('bottom', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Left</label>
                <input
                  type="number"
                  min="0"
                  max={marginUnit === 'percent' ? 50 : 200}
                  value={cropMargins.left}
                  onChange={(e) => updateMargin('left', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Right</label>
                <input
                  type="number"
                  min="0"
                  max={marginUnit === 'percent' ? 50 : 200}
                  value={cropMargins.right}
                  onChange={(e) => updateMargin('right', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {marginUnit === 'mm' ? 'Enter millimeters to remove from each edge' : 'Enter percentage of page to remove from each edge'}
            </p>
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
                📄 Crop will be applied to {pagesToApply.length} page{pagesToApply.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Margins: {cropMargins.top}{marginUnit === 'mm' ? 'mm' : '%'} top, {cropMargins.bottom}{marginUnit === 'mm' ? 'mm' : '%'} bottom, {cropMargins.left}{marginUnit === 'mm' ? 'mm' : '%'} left, {cropMargins.right}{marginUnit === 'mm' ? 'mm' : '%'} right
              </p>
            </div>
          )}

          {errorMsg && <p className="text-red-500 font-medium text-sm">{errorMsg}</p>}

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Cropping PDF...</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ PDF cropped successfully</p>
                <p className="text-sm text-green-700 mt-1">
                  {result.totalPages} page{result.totalPages !== 1 ? 's' : ''} • {(result.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={URL.createObjectURL(result.file)}
                  download="cropped.pdf"
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
              onClick={cropPdf}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Crop PDF
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
