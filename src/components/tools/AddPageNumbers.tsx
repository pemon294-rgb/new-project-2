import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

interface AddNumbersResult {
  file: File;
  totalPages: number;
  fileSize: number;
}

type Position = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
type NumberFormat = 'plain' | 'page' | 'of-total';

export default function AddPageNumbers() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('plain');
  const [fontSize, setFontSize] = useState(12);
  const [skipFirstPage, setSkipFirstPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AddNumbersResult | null>(null);
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
    } catch (e) {
      setErrorMsg('Error reading PDF: file may be corrupted or password-protected.');
    }
  };

  const getNumberText = (pageNum: number, totalPages: number): string => {
    switch (numberFormat) {
      case 'plain':
        return pageNum.toString();
      case 'page':
        return `Page ${pageNum}`;
      case 'of-total':
        return `${pageNum} of ${totalPages}`;
      default:
        return pageNum.toString();
    }
  };

  const getCoordinates = (width: number, height: number, textWidth: number): [number, number] => {
    const margin = 30;
    let x = 0;
    let y = 0;

    // Horizontal positioning
    if (position.includes('center')) {
      x = width / 2 - textWidth / 2;
    } else if (position.includes('right')) {
      x = width - textWidth - margin;
    } else if (position.includes('left')) {
      x = margin;
    }

    // Vertical positioning
    if (position.includes('bottom')) {
      y = margin;
    } else if (position.includes('top')) {
      y = height - margin;
    }

    return [x, y];
  };

  const addPageNumbers = async () => {
    if (!pdfFile) {
      setErrorMsg('Please upload a PDF first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        // Skip first page if checkbox is enabled
        if (skipFirstPage && i === 0) continue;

        const page = pages[i];
        const { width, height } = page.getSize();

        // Calculate page number based on starting number and index
        const pageNum = startNumber + (skipFirstPage ? Math.max(0, i) : i);
        const numberText = getNumberText(pageNum, pages.length);

        // Estimate text width (rough approximation: ~6 pixels per character at fontSize 12)
        const estimatedWidth = (numberText.length * fontSize * 0.6);
        const [x, y] = getCoordinates(width, height, estimatedWidth);

        // Draw text on page
        page.drawText(numberText, {
          x,
          y,
          size: fontSize,
          color: rgb(0, 0, 0),
          font: await pdfDoc.embedFont('Helvetica')
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newFile = new File([blob], 'numbered.pdf', { type: 'application/pdf' });

      setResult({
        file: newFile,
        totalPages: pages.length,
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSettingsSummary = (): string => {
    const positionLabels: Record<Position, string> = {
      'bottom-center': 'Bottom center',
      'bottom-right': 'Bottom right',
      'bottom-left': 'Bottom left',
      'top-center': 'Top center',
      'top-right': 'Top right',
      'top-left': 'Top left'
    };

    const formatLabels: Record<NumberFormat, string> = {
      'plain': 'Plain (1, 2, 3...)',
      'page': 'Page label (Page 1, Page 2...)',
      'of-total': 'Total reference (1 of 10, 2 of 10...)'
    };

    return `${positionLabels[position]} • ${formatLabels[numberFormat]} • ${fontSize}pt${skipFirstPage ? ' • Skip first page' : ''}`;
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

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page number position</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const).map(pos => (
                <label key={pos} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={position === pos}
                    onChange={() => setPosition(pos)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {pos === 'top-left' && '↖ Top left'}
                    {pos === 'top-center' && '⬆ Top center'}
                    {pos === 'top-right' && '↗ Top right'}
                    {pos === 'bottom-left' && '↙ Bottom left'}
                    {pos === 'bottom-center' && '⬇ Bottom center'}
                    {pos === 'bottom-right' && '↘ Bottom right'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Number Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number format</label>
            <div className="space-y-2">
              {(['plain', 'page', 'of-total'] as const).map(fmt => (
                <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={numberFormat === fmt}
                    onChange={() => setNumberFormat(fmt)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    {fmt === 'plain' && 'Plain (1, 2, 3...)'}
                    {fmt === 'page' && 'Page label (Page 1, Page 2...)'}
                    {fmt === 'of-total' && `Total reference (1 of ${pageCount}, 2 of ${pageCount}...)`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font size: {fontSize}pt</label>
            <input
              type="range"
              min="8"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">8pt to 24pt</p>
          </div>

          {/* Starting Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start from page number</label>
            <input
              type="number"
              min="1"
              max="999"
              value={startNumber}
              onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Useful if your PDF is part of a larger document</p>
          </div>

          {/* Skip First Page */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipFirstPage}
              onChange={(e) => setSkipFirstPage(e.target.checked)}
              className="text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Skip first page (common for cover pages)</span>
          </label>

          {/* Settings Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">📄 {getSettingsSummary()}</p>
          </div>

          {errorMsg && <p className="text-red-500 font-medium text-sm">{errorMsg}</p>}

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Adding page numbers...</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ Page numbers added successfully</p>
                <p className="text-sm text-green-700 mt-1">
                  {result.totalPages} page{result.totalPages !== 1 ? 's' : ''} numbered • {(result.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={URL.createObjectURL(result.file)}
                  download="numbered.pdf"
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
              onClick={addPageNumbers}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Add Page Numbers
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
