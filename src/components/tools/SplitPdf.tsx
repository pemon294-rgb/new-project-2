import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

interface SplitResult {
  type: 'single' | 'multiple';
  files: { name: string; blob: Blob }[];
  totalPages: number;
  totalSize: number;
}

export default function SplitPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<'range' | 'individual' | 'at'>('range');
  const [pageInput, setPageInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
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

      if (count > 100) {
        setErrorMsg('Warning: PDF has over 100 pages. Processing may be slow.');
      }

      setPdfFile(file);
      setPageCount(count);
      setPageInput('');
      setSplitResult(null);
    } catch (e) {
      setErrorMsg('Error reading PDF: file may be corrupted or password-protected.');
    }
  };

  const parsePageRange = (range: string, maxPages: number): number[] => {
    const pages: number[] = [];
    const parts = range.split(',').map(s => s.trim());

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

  const getPreviewSummary = (): string => {
    try {
      if (splitMode === 'range') {
        if (!pageInput.trim()) return '';
        const pages = parsePageRange(pageInput, pageCount);
        return `1 file will be created with ${pages.length} page${pages.length !== 1 ? 's' : ''}`;
      } else if (splitMode === 'individual') {
        return `${pageCount} file${pageCount !== 1 ? 's' : ''} will be created (one per page)`;
      } else if (splitMode === 'at') {
        if (!pageInput.trim()) return '';
        const pageNum = parseInt(pageInput);
        if (isNaN(pageNum) || pageNum <= 1 || pageNum > pageCount) {
          return 'Invalid page number';
        }
        return `2 file${pageCount === 2 ? '' : 's'} will be created (pages 1-${pageNum - 1} and pages ${pageNum}-${pageCount})`;
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  const splitPdf = async () => {
    if (!pdfFile) {
      setErrorMsg('Please upload a PDF first.');
      return;
    }

    if (splitMode === 'range' && !pageInput.trim()) {
      setErrorMsg('Please enter a page range.');
      return;
    }

    if ((splitMode === 'at') && !pageInput.trim()) {
      setErrorMsg('Please enter a page number.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSplitResult(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const resultFiles: { name: string; blob: Blob }[] = [];

      if (splitMode === 'range') {
        try {
          const pages = parsePageRange(pageInput, pageCount);
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(sourcePdf, pages);
          copiedPages.forEach(page => newPdf.addPage(page));

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          resultFiles.push({
            name: 'extracted.pdf',
            blob
          });
        } catch (e) {
          setErrorMsg(e instanceof Error ? e.message : 'Invalid page range.');
          setLoading(false);
          return;
        }
      } else if (splitMode === 'individual') {
        for (let i = 0; i < pageCount; i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [i]);
          newPdf.addPage(page);

          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          resultFiles.push({
            name: `page-${i + 1}.pdf`,
            blob
          });
        }
      } else if (splitMode === 'at') {
        try {
          const pageNum = parseInt(pageInput);
          if (isNaN(pageNum) || pageNum <= 1 || pageNum > pageCount) {
            throw new Error(`Invalid page number. Must be between 2 and ${pageCount}.`);
          }

          // Create first PDF (pages 1 to pageNum-1)
          const pdf1 = await PDFDocument.create();
          const pages1 = Array.from({ length: pageNum - 1 }, (_, i) => i);
          const copied1 = await pdf1.copyPages(sourcePdf, pages1);
          copied1.forEach(page => pdf1.addPage(page));
          const bytes1 = await pdf1.save();
          resultFiles.push({
            name: `part-1-pages-1-to-${pageNum - 1}.pdf`,
            blob: new Blob([bytes1], { type: 'application/pdf' })
          });

          // Create second PDF (pages pageNum to end)
          const pdf2 = await PDFDocument.create();
          const pages2 = Array.from({ length: pageCount - pageNum + 1 }, (_, i) => pageNum - 1 + i);
          const copied2 = await pdf2.copyPages(sourcePdf, pages2);
          copied2.forEach(page => pdf2.addPage(page));
          const bytes2 = await pdf2.save();
          resultFiles.push({
            name: `part-2-pages-${pageNum}-to-${pageCount}.pdf`,
            blob: new Blob([bytes2], { type: 'application/pdf' })
          });
        } catch (e) {
          setErrorMsg(e instanceof Error ? e.message : 'Error splitting PDF.');
          setLoading(false);
          return;
        }
      }

      const totalSize = resultFiles.reduce((sum, f) => sum + f.blob.size, 0);

      setSplitResult({
        type: resultFiles.length === 1 ? 'single' : 'multiple',
        files: resultFiles,
        totalPages: pageCount,
        totalSize
      });
    } catch (e) {
      setErrorMsg('Error processing PDF.');
    } finally {
      setLoading(false);
    }
  };

  const downloadFiles = async () => {
    if (!splitResult) return;

    if (splitResult.type === 'single') {
      const file = splitResult.files[0];
      const url = URL.createObjectURL(file.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const zip = new JSZip();
      splitResult.files.forEach(f => {
        zip.file(f.name, f.blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'split-pdfs.zip';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const reset = () => {
    setPdfFile(null);
    setPageCount(0);
    setPageInput('');
    setSplitResult(null);
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

          {/* Split Mode */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Split Mode</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={splitMode === 'range'}
                  onChange={() => { setSplitMode('range'); setPageInput(''); }}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Extract page range (e.g. "1-3" or "1,3,5")</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={splitMode === 'individual'}
                  onChange={() => setSplitMode('individual')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Split into individual pages ({pageCount} files)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={splitMode === 'at'}
                  onChange={() => { setSplitMode('at'); setPageInput(''); }}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Split at page number (2 files)</span>
              </label>
            </div>
          </div>

          {/* Page Input */}
          {(splitMode === 'range' || splitMode === 'at') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {splitMode === 'range' ? 'Page range' : 'Split at page number'}
              </label>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={splitMode === 'range' ? 'e.g. 1-3 or 1,3,5' : `e.g. 5 (between 2 and ${pageCount})`}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {splitMode === 'range'
                  ? 'Enter page ranges like "1-3" or individual pages like "1,3,5"'
                  : `Enter a page number between 2 and ${pageCount}`}
              </p>
            </div>
          )}

          {/* Preview */}
          {getPreviewSummary() && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">📄 {getPreviewSummary()}</p>
            </div>
          )}

          {errorMsg && <p className="text-red-500 font-medium text-sm">{errorMsg}</p>}

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Processing PDF...</p>
            </div>
          )}

          {splitResult ? (
            <div className="space-y-4">
              <div className={`rounded-lg p-4 ${splitResult.type === 'single' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                <p className={`font-medium ${splitResult.type === 'single' ? 'text-green-800' : 'text-blue-800'}`}>
                  ✓ PDF split successfully
                </p>
                <p className={`text-sm mt-1 ${splitResult.type === 'single' ? 'text-green-700' : 'text-blue-700'}`}>
                  {splitResult.type === 'single'
                    ? `1 file, ${splitResult.files[0].blob.size / 1024 > 1024 ? (splitResult.files[0].blob.size / (1024 * 1024)).toFixed(1) + ' MB' : (splitResult.files[0].blob.size / 1024).toFixed(1) + ' KB'}`
                    : `${splitResult.files.length} file${splitResult.files.length !== 1 ? 's' : ''}, ${splitResult.totalSize / 1024 > 1024 ? (splitResult.totalSize / (1024 * 1024)).toFixed(1) + ' MB' : (splitResult.totalSize / 1024).toFixed(1) + ' KB'}`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadFiles}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transform hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download {splitResult.type === 'single' ? 'PDF' : 'ZIP'}
                </button>
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
              onClick={splitPdf}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Split PDF
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
