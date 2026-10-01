import React, { useState, useRef } from 'react';
import Dropzone from './Dropzone';
import { loadImg, captureCanvas } from '../../utils/imageUtils';

interface ImageConverterProps {
  defaultFromFormat?: string;
  defaultToFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const FORMAT_OPTIONS = [
  { mime: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { mime: 'image/png', label: 'PNG', ext: 'png' },
  { mime: 'image/webp', label: 'WebP', ext: 'webp' }
];

export default function ImageConverter({ defaultToFormat = 'image/webp' }: ImageConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [originalImg, setOriginalImg] = useState<HTMLImageElement | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState<string | null>(null);

  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [previewConverted, setPreviewConverted] = useState<string | null>(null);

  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>(defaultToFormat);
  const [quality, setQuality] = useState(0.85);
  const [useResize, setUseResize] = useState(false);
  const [resizeW, setResizeW] = useState<string>('');
  const [resizeH, setResizeH] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [dims, setDims] = useState<{orig: {w:number, h:number}, conv: {w:number, h:number}}>({orig:{w:0,h:0}, conv:{w:0,h:0}});

  const reset = () => {
    setFile(null);
    setOriginalImg(null);
    setPreviewOriginal(null);
    setConvertedFile(null);
    setPreviewConverted(null);
    setErrorMsg(null);
    setUseResize(false);
    setResizeW('');
    setResizeH('');
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    const objUrl = URL.createObjectURL(selectedFile);
    setPreviewOriginal(objUrl);
    setErrorMsg(null);

    try {
      const img = await loadImg(selectedFile);
      setOriginalImg(img);
      setDims(prev => ({...prev, orig: {w: img.width, h: img.height}}));
      if (!resizeW && !resizeH) {
        setResizeW(img.width.toString());
        setResizeH(img.height.toString());
      }
    } catch(e) {
      setErrorMsg('Failed to load image.');
    }
  };

  const convertImage = async () => {
    if (!originalImg || !file) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      let targetW = originalImg.width;
      let targetH = originalImg.height;

      if (useResize) {
        targetW = parseInt(resizeW) || originalImg.width;
        targetH = parseInt(resizeH) || originalImg.height;
        if (targetW <= 0 || targetH <= 0) {
          setErrorMsg('Please provide valid resize dimensions.');
          setLoading(false);
          return;
        }
      }

      const blob = await captureCanvas(originalImg, targetW, targetH, outputFormat, quality, false, false);

      if (blob) {
        const formatInfo = FORMAT_OPTIONS.find(f => f.mime === outputFormat);
        const ext = formatInfo?.ext || 'jpg';
        const fromExt = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
        const newFileName = `converted-${fromExt}-to-${ext}.${ext}`;
        const newFile = new File([blob], newFileName, { type: outputFormat });

        setConvertedFile(newFile);
        setPreviewConverted(URL.createObjectURL(blob));
        setDims(prev => ({...prev, conv: {w: targetW, h: targetH}}));
      } else {
        setErrorMsg('Error converting image.');
      }
    } catch(e) {
      setErrorMsg('Unexpected error during conversion.');
    } finally {
      setLoading(false);
    }
  };

  const showQualitySlider = outputFormat === 'image/jpeg' || outputFormat === 'image/webp';
  const isConvertingToJpg = outputFormat === 'image/jpeg';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {!file ? (
        <Dropzone onFileSelect={handleFileSelect} targetInfo="Convert to JPG, PNG, or WebP" />
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
            {/* Original Format Info */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">Original format:</span> {file.type || 'unknown'} ({(file.size / 1024).toFixed(1)} KB)
            </div>

            {/* Output Format Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Output Format</label>
              <div className="grid grid-cols-3 gap-3">
                {FORMAT_OPTIONS.map(opt => (
                  <button
                    key={opt.mime}
                    onClick={() => setOutputFormat(opt.mime as any)}
                    className={`py-2 px-3 rounded-lg font-medium border-2 transition-all ${
                      outputFormat === opt.mime
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {isConvertingToJpg && file.type === 'image/png' && (
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  ℹ️ Converting PNG to JPG: transparent areas will become white.
                </p>
              )}
            </div>

            {/* Quality Slider */}
            {showQualitySlider && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Quality</label>
                  <span className="text-sm text-gray-500">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            {/* Resize Options */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useResize}
                  onChange={(e) => setUseResize(e.target.checked)}
                  className="text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Resize while converting</span>
              </label>
              {useResize && (
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                    <input
                      type="number"
                      min="1"
                      value={resizeW}
                      onChange={(e) => setResizeW(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <span className="text-gray-400">×</span>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                    <input
                      type="number"
                      min="1"
                      value={resizeH}
                      onChange={(e) => setResizeH(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={convertImage}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loading ? 'Converting...' : 'Convert Image'}
              </button>
              <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-4 py-2 bg-gray-100 rounded-lg">
                Try another
              </button>
            </div>
          </div>

          {errorMsg && <p className="text-red-500 font-medium text-center">{errorMsg}</p>}

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Converting image...</p>
            </div>
          ) : previewOriginal && previewConverted && convertedFile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Original */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                  Original
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </h3>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                  <img src={previewOriginal} alt="Original" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Format: {file.type || 'unknown'}</p>
                  <p>Dimensions: {dims.orig.w} × {dims.orig.h} px</p>
                </div>
              </div>

              {/* Converted */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                  Converted
                  <span className="text-sm bg-green-500 text-white px-2 py-1 rounded">
                    {(convertedFile.size / 1024).toFixed(1)} KB
                  </span>
                </h3>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                  <img src={previewConverted} alt="Converted" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Format: {FORMAT_OPTIONS.find(f => f.mime === outputFormat)?.label}</p>
                  <p>Dimensions: {dims.conv.w} × {dims.conv.h} px</p>
                </div>
              </div>
            </div>
          ) : null}

          {!loading && convertedFile && (
            <div className="flex justify-center pt-8 border-t border-gray-100">
              <a
                href={previewConverted!}
                download={convertedFile.name}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:-translate-y-1 transition-all text-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Download {FORMAT_OPTIONS.find(f => f.mime === outputFormat)?.label}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
