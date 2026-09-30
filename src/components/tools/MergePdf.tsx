import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PdfItem {
  id: string;
  file: File;
  pages: number;
  pageRange: string;
}

export default function MergePdf() {
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mergeResult, setMergeResult] = useState<{file: File, pages: number, size: number} | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    setErrorMsg(null);

    if (pdfs.length + files.length > 20) {
      setErrorMsg('Maximum 20 PDF files per merge. You can merge multiple times.');
      return;
    }

    let totalSize = pdfs.reduce((sum, pdf) => sum + pdf.file.size, 0);
    const newFiles = Array.from(files);
    for (const file of newFiles) {
      totalSize += file.size;
    }

    if (totalSize > 100 * 1024 * 1024) {
      setErrorMsg('Total file size exceeds 100 MB. Please reduce the number of files.');
      return;
    }

    try {
      const newPdfs: PdfItem[] = [];
      for (const file of newFiles) {
        if (file.type !== 'application/pdf') {
          setErrorMsg(`Skipped ${file.name}: not a PDF file.`);
          continue;
        }

        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pageCount = pdfDoc.getPageCount();

          newPdfs.push({
            id: Math.random().toString(36).substr(2, 9),
            file,
            pages: pageCount,
            pageRange: 'all'
          });
        } catch (e) {
          setErrorMsg(`Error reading ${file.name}: file may be corrupted or password-protected.`);
        }
      }
      setPdfs([...pdfs, ...newPdfs]);
    } catch (e) {
      setErrorMsg('Error processing one or more files.');
    }
  };

  const removePdf = (id: string) => {
    setPdfs(pdfs.filter(pdf => pdf.id !== id));
  };

  const movePdf = (id: string, direction: 'up' | 'down') => {
    const idx = pdfs.findIndex(pdf => pdf.id === id);
    if (direction === 'up' && idx > 0) {
      const newPdfs = [...pdfs];
      [newPdfs[idx], newPdfs[idx - 1]] = [newPdfs[idx - 1], newPdfs[idx]];
      setPdfs(newPdfs);
    } else if (direction === 'down' && idx < pdfs.length - 1) {
      const newPdfs = [...pdfs];
      [newPdfs[idx], newPdfs[idx + 1]] = [newPdfs[idx + 1], newPdfs[idx]];
      setPdfs(newPdfs);
    }
  };

  const updatePageRange = (id: string, range: string) => {
    setPdfs(pdfs.map(pdf => pdf.id === id ? {...pdf, pageRange: range} : pdf));
  };

  const parsePageRange = (range: string, maxPages: number): number[] => {
    if (range.toLowerCase() === 'all') {
      return Array.from({length: maxPages}, (_, i) => i);
    }

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

  const mergePdfs = async () => {
    if (pdfs.length === 0) {
      setErrorMsg('Please add at least one PDF.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setMergeResult(null);

    try {
      const mergedPdf = await PDFDocument.create();
      let totalPages = 0;

      for (const pdfItem of pdfs) {
        try {
          const arrayBuffer = await pdfItem.file.arrayBuffer();
          const sourcePdf = await PDFDocument.load(arrayBuffer);
          let pagesToCopy: number[] = [];

          if (pdfItem.pageRange.toLowerCase() === 'all') {
            pagesToCopy = Array.from({length: sourcePdf.getPageCount()}, (_, i) => i);
          } else {
            pagesToCopy = parsePageRange(pdfItem.pageRange, sourcePdf.getPageCount());
          }

          const copiedPages = await mergedPdf.copyPages(sourcePdf, pagesToCopy);
          copiedPages.forEach(page => mergedPdf.addPage(page));
          totalPages += copiedPages.length;
        } catch (e) {
          setErrorMsg(`Error merging ${pdfItem.file.name}: ${e instanceof Error ? e.message : 'unknown error'}`);
          setLoading(false);
          return;
        }
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const file = new File([blob], 'merged.pdf', { type: 'application/pdf' });

      setMergeResult({
        file,
        pages: totalPages,
        size: blob.size
      });
    } catch (e) {
      setErrorMsg('Error merging PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPdfs([]);
    setMergeResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getTotalPages = () => {
    return pdfs.reduce((sum, pdf) => {
      try {
        const pages = parsePageRange(pdf.pageRange, pdf.pages);
        return sum + pages.length;
      } catch {
        return sum;
      }
    }, 0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {pdfs.length === 0 && !mergeResult ? (
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
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="font-medium text-lg text-gray-700 mb-1">Click or Drag & Drop PDFs here</p>
          <p className="text-sm text-gray-500">Upload up to 20 PDFs, max 100MB total</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* PDF List */}
          {pdfs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">PDFs ({pdfs.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pdfs.map((pdf, idx) => (
                  <div key={pdf.id} className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{pdf.file.name}</p>
                        <p className="text-xs text-gray-500">{pdf.pages} pages • {(pdf.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => movePdf(pdf.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => movePdf(pdf.id, 'down')}
                          disabled={idx === pdfs.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removePdf(pdf.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Page range (e.g. "1-3" or "all")</label>
                      <input
                        type="text"
                        value={pdf.pageRange}
                        onChange={(e) => updatePageRange(pdf.id, e.target.value)}
                        placeholder="all"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium p-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                + Add more PDFs
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,application/pdf"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </div>
          )}

          {/* Summary */}
          {pdfs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                📄 {pdfs.length} file{pdfs.length !== 1 ? 's' : ''} → {getTotalPages()} page{getTotalPages() !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {errorMsg && <p className="text-red-500 font-medium text-sm">{errorMsg}</p>}

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Merging PDFs...</p>
            </div>
          )}

          {mergeResult ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ PDFs merged successfully</p>
                <p className="text-sm text-green-700 mt-1">{mergeResult.pages} pages, {(mergeResult.size / 1024).toFixed(1)} KB</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={URL.createObjectURL(mergeResult.file)}
                  download="merged.pdf"
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
          ) : !loading && pdfs.length > 0 ? (
            <button
              onClick={mergePdfs}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Merge PDFs
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
