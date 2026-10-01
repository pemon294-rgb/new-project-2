import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PageInfo {
  index: number;
  deleted: boolean;
}

interface OrganizeResult {
  file: File;
  originalPages: number;
  finalPages: number;
  fileSize: number;
}

export default function OrganizePdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<OrganizeResult | null>(null);
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
      setPages(Array.from({ length: count }, (_, i) => ({ index: i, deleted: false })));
      setResult(null);
    } catch (e) {
      setErrorMsg('Error reading PDF: file may be corrupted or password-protected.');
    }
  };

  const toggleDeletePage = (pageIdx: number) => {
    const newPages = [...pages];
    newPages[pageIdx].deleted = !newPages[pageIdx].deleted;
    setPages(newPages);
  };

  const movePageUp = (pageIdx: number) => {
    if (pageIdx <= 0) return;
    const newPages = [...pages];
    [newPages[pageIdx - 1], newPages[pageIdx]] = [newPages[pageIdx], newPages[pageIdx - 1]];
    setPages(newPages);
  };

  const movePageDown = (pageIdx: number) => {
    if (pageIdx >= pages.length - 1) return;
    const newPages = [...pages];
    [newPages[pageIdx], newPages[pageIdx + 1]] = [newPages[pageIdx + 1], newPages[pageIdx]];
    setPages(newPages);
  };

  const remainingPages = pages.filter(p => !p.deleted).length;
  const originalOrder = pages.filter(p => !p.deleted).map(p => p.index + 1).join(', ');

  const applyChanges = async () => {
    if (!pdfFile) {
      setErrorMsg('Please upload a PDF first.');
      return;
    }

    if (remainingPages === 0) {
      setErrorMsg('Cannot save a PDF with no pages. Please keep at least one page.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Copy pages in order, skipping deleted ones
      for (const pageInfo of pages) {
        if (!pageInfo.deleted) {
          const [copiedPage] = await newPdf.copyPages(srcPdf, [pageInfo.index]);
          newPdf.addPage(copiedPage);
        }
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newFile = new File([blob], 'organized.pdf', { type: 'application/pdf' });

      setResult({
        file: newFile,
        originalPages: pageCount,
        finalPages: remainingPages,
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
    setPages([]);
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

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Edit your pages:</strong> Click the delete button (✕) to remove a page, or use up/down arrows to reorder. {remainingPages} page{remainingPages !== 1 ? 's' : ''} remaining.
            </p>
          </div>

          {/* Pages List */}
          <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
            {pages.map((pageInfo, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  pageInfo.deleted
                    ? 'bg-red-50 border-red-200 opacity-50'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Page Number */}
                <div className="min-w-12 text-center">
                  <div className="text-xs font-bold text-gray-600">Page</div>
                  <div className="text-lg font-bold text-gray-800">{pageInfo.index + 1}</div>
                </div>

                {/* Status */}
                <div className="flex-1">
                  {pageInfo.deleted ? (
                    <span className="text-sm text-red-600 font-medium">Marked for deletion</span>
                  ) : (
                    <span className="text-sm text-gray-600">
                      Position {pages.filter((p, i) => i <= idx && !p.deleted).length}
                    </span>
                  )}
                </div>

                {/* Arrow Controls */}
                <div className="flex gap-1">
                  <button
                    onClick={() => movePageUp(idx)}
                    disabled={pageInfo.deleted || idx === 0 || pages.slice(0, idx).every(p => p.deleted)}
                    className="p-2 rounded bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => movePageDown(idx)}
                    disabled={pageInfo.deleted || idx === pages.length - 1 || pages.slice(idx + 1).every(p => p.deleted)}
                    className="p-2 rounded bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => toggleDeletePage(idx)}
                  disabled={!pageInfo.deleted && remainingPages === 1}
                  className={`p-2 rounded font-bold transition-all ${
                    pageInfo.deleted
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                      : 'bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-30 disabled:cursor-not-allowed'
                  }`}
                  title={remainingPages === 1 && !pageInfo.deleted ? 'Cannot delete the last page' : 'Delete this page'}
                >
                  {pageInfo.deleted ? '↩' : '✕'}
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          {remainingPages !== pageCount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                📄 {pageCount} pages → {remainingPages} pages (removed {pageCount - remainingPages})
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && <p className="text-red-500 font-medium text-sm">{errorMsg}</p>}

          {/* Loading */}
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Organizing PDF...</p>
            </div>
          )}

          {/* Result */}
          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ PDF organized successfully</p>
                <p className="text-sm text-green-700 mt-1">
                  {result.originalPages} pages → {result.finalPages} pages • {(result.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={URL.createObjectURL(result.file)}
                  download="organized.pdf"
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
              onClick={applyChanges}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
