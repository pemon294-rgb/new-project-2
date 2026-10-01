import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface ExtractResult {
  file: File;
  originalPages: number;
  extractedPages: number;
  fileSize: number;
}

export default function ExtractPages() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<string>('');
  const [useCheckboxes, setUseCheckboxes] = useState(false);
  const [checkedPages, setCheckedPages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResult | null>(null);
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
      setCheckedPages(new Set());
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

  const getSelectedPagesToExtract = (): number[] => {
    if (useCheckboxes) {
      return Array.from(checkedPages).sort((a, b) => a - b);
    } else {
      try {
        return parsePageSelection(selectedPages, pageCount);
      } catch {
        return [];
      }
    }
  };

  const pagesToExtract = getSelectedPagesToExtract();

  const toggleCheckbox = (pageNum: number) => {
    const newChecked = new Set(checkedPages);
    if (newChecked.has(pageNum)) {
      newChecked.delete(pageNum);
    } else {
      newChecked.add(pageNum);
    }
    setCheckedPages(newChecked);
  };

  const getSummary = (): string => {
    if (pagesToExtract.length === 0) return '';
    if (useCheckboxes) {
      return `${pagesToExtract.length} page${pagesToExtract.length !== 1 ? 's' : ''} will be extracted`;
    } else {
      try {
        if (!selectedPages.trim()) return '';
        return `${pagesToExtract.length} page${pagesToExtract.length !== 1 ? 's' : ''} will be extracted`;
      } catch (e) {
        return '';
      }
    }
  };

  const extractPages = async () => {
    if (!pdfFile) {
      setErrorMsg('Please upload a PDF first.');
      return;
    }

    const toExtract = getSelectedPagesToExtract();

    if (toExtract.length === 0) {
      setErrorMsg('Please select at least one page to extract.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const originalPages = pdfDoc.getPages();

      // Create new PDF with only extracted pages (in original document order)
      const newPdf = await PDFDocument.create();
      const sortedToExtract = Array.from(toExtract).sort((a, b) => a - b);

      for (const pageIdx of sortedToExtract) {
        if (pageIdx < originalPages.length) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIdx]);
          newPdf.addPage(copiedPage);
        }
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newFile = new File([blob], 'extracted-pages.pdf', { type: 'application/pdf' });

      setResult({
        file: newFile,
        originalPages: pageCount,
        extractedPages: sortedToExtract.length,
        fileSize: blob.size
      });
    } catch (e) {
      if (e instanceof Error && e.message.includes('password')) {
        setErrorMsg('This PDF is password-protected and cannot be read.');
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
    setCheckedPages(new Set());
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

          {/* Selection Mode Toggle */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Select pages to extract</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!useCheckboxes}
                  onChange={() => {
                    setUseCheckboxes(false);
                    setCheckedPages(new Set());
                  }}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Enter page numbers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={useCheckboxes}
                  onChange={() => {
                    setUseCheckboxes(true);
                    setSelectedPages('');
                  }}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Click checkboxes</span>
              </label>
            </div>
          </div>

          {/* Text Input Mode */}
          {!useCheckboxes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page numbers (e.g. "1,3,5-7")</label>
              <input
                type="text"
                value={selectedPages}
                onChange={(e) => setSelectedPages(e.target.value)}
                placeholder="e.g. 1,3,5-7"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Enter individual pages or ranges separated by commas</p>
            </div>
          )}

          {/* Checkbox Mode */}
          {useCheckboxes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Pages to extract:</label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Array.from({ length: pageCount }, (_, i) => i).map(pageIdx => (
                    <label key={pageIdx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkedPages.has(pageIdx)}
                        onChange={() => toggleCheckbox(pageIdx)}
                        className="text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Page {pageIdx + 1}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Extracted Pages Count */}
          {pagesToExtract.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                📄 {getSummary()} from {pageCount} total
              </p>
            </div>
          )}

          {errorMsg && <p className="text-red-500 font-medium text-sm">{errorMsg}</p>}

          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Extracting pages...</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ Pages extracted successfully</p>
                <p className="text-sm text-green-700 mt-1">
                  {result.extractedPages} page{result.extractedPages !== 1 ? 's' : ''} extracted • {(result.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={URL.createObjectURL(result.file)}
                  download="extracted-pages.pdf"
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
              onClick={extractPages}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Extract Pages
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
