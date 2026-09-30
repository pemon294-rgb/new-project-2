import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface RotateResult {
  file: File;
  totalPages: number;
  rotatedPages: number;
  rotationAngle: number;
  fileSize: number;
}

export default function RotatePdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotateMode, setRotateMode] = useState<'all' | 'selected'>('all');
  const [rotationAngle, setRotationAngle] = useState(90);
  const [selectedPages, setSelectedPages] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<RotateResult | null>(null);
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
      setSelectedPages('');
      setResult(null);
    } catch (e) {
      setErrorMsg('Error reading PDF: file may be corrupted or password-protected.');
    }
  };

  const parsePageSelection = (input: string, maxPages: number): number[] => {
    if (!input.trim()) return [];

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

  const getRotationSummary = (): string => {
    if (rotateMode === 'all') {
      return `All ${pageCount} pages will be rotated ${rotationAngle}°`;
    } else {
      try {
        if (!selectedPages.trim()) return '';
        const pages = parsePageSelection(selectedPages, pageCount);
        return `${pages.length} page${pages.length !== 1 ? 's' : ''} will be rotated ${rotationAngle}°`;
      } catch (e) {
        return '';
      }
    }
  };

  const rotatePdf = async () => {
    if (!pdfFile) {
      setErrorMsg('Please upload a PDF first.');
      return;
    }

    if (rotateMode === 'selected' && !selectedPages.trim()) {
      setErrorMsg('Please enter page numbers to rotate.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      let pagesToRotate: number[] = [];

      if (rotateMode === 'all') {
        pagesToRotate = Array.from({ length: pageCount }, (_, i) => i);
      } else {
        try {
          pagesToRotate = parsePageSelection(selectedPages, pageCount);
        } catch (e) {
          setErrorMsg(e instanceof Error ? e.message : 'Invalid page selection.');
          setLoading(false);
          return;
        }
      }

      const pages = pdfDoc.getPages();

      // Apply rotation to selected pages
      pagesToRotate.forEach(pageIdx => {
        if (pageIdx < pages.length) {
          const page = pages[pageIdx];
          const currentRotation = page.getRotation().angle || 0;
          const newRotation = (currentRotation + rotationAngle) % 360;
          page.setRotation({ angle: newRotation });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newFile = new File([blob], 'rotated.pdf', { type: 'application/pdf' });

      setResult({
        file: newFile,
        totalPages: pageCount,
        rotatedPages: pagesToRotate.length,
        rotationAngle,
        fileSize: blob.size
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('password')) {
        setErrorMsg('This PDF is password-protected and cannot be rotated.');
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
    setSelectedPages('');
    setResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

          {/* Rotation Mode */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Rotation Mode</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={rotateMode === 'all'}
                  onChange={() => setRotateMode('all')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Rotate all pages</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={rotateMode === 'selected'}
                  onChange={() => setRotateMode('selected')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Rotate selected pages only</span>
              </label>
            </div>
          </div>

          {/* Page Selection */}
          {rotateMode === 'selected' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page numbers (e.g. "1,3,5" or "1-3")</label>
              <input
                type="text"
                value={selectedPages}
                onChange={(e) => setSelectedPages(e.target.value)}
                placeholder="e.g. 1,3,5 or 1-3"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Enter individual pages or ranges</p>
            </div>
          )}

          {/* Rotation Angle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rotation Angle</label>
            <div className="flex gap-3">
              {[90, 180, 270].map(angle => (
                <button
                  key={angle}
                  onClick={() => setRotationAngle(angle)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    rotationAngle === angle
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {angle}°
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {rotationAngle === 90 ? 'Clockwise 90°' : rotationAngle === 180 ? 'Upside down 180°' : 'Counter-clockwise 90°'}
            </p>
          </div>

          {/* Summary */}
          {getRotationSummary() && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">📄 {getRotationSummary()}</p>
            </div>
          )}

          {errorMsg && <p className="text-red-500 font-medium text-sm">{errorMsg}</p>}

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Rotating PDF...</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ PDF rotated successfully</p>
                <p className="text-sm text-green-700 mt-1">{result.totalPages} pages • {(result.fileSize / 1024).toFixed(1)} KB</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={URL.createObjectURL(result.file)}
                  download="rotated.pdf"
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
              onClick={rotatePdf}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Rotate PDF
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
