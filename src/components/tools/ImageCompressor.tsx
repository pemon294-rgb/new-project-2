import React, { useState } from 'react';
import Dropzone from './Dropzone';
import { loadImg, compressToTargetKB } from '../../utils/imageUtils';

interface ImageCompressorProps {
  targetKB: number;
}

export default function ImageCompressor({ targetKB }: ImageCompressorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewCompressed, setPreviewCompressed] = useState<string | null>(null);

  const [format, setFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setPreviewOriginal(null);
    setCompressedFile(null);
    setPreviewCompressed(null);
    setErrorMsg(null);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setPreviewOriginal(URL.createObjectURL(selectedFile));
    compressImage(selectedFile, format);
  };

  const compressImage = async (inputFile: File, targetFormat: 'image/jpeg' | 'image/webp') => {
    setLoading(true);
    setCompressedFile(null);
    setPreviewCompressed(null);
    setErrorMsg(null);
    try {
      const img = await loadImg(inputFile);
      const bestBlob = await compressToTargetKB(img, img.width, img.height, targetFormat, targetKB, false);

      if (bestBlob) {
        const ext = targetFormat === 'image/jpeg' ? 'jpg' : 'webp';
        const newFileName = `compressed-${targetKB}kb.${ext}`;
        const newFile = new File([bestBlob], newFileName, { type: targetFormat });
        setCompressedFile(newFile);
        setPreviewCompressed(URL.createObjectURL(bestBlob));
      } else {
        setErrorMsg('Error processing image.');
      }
    } catch (e) {
      setErrorMsg('Error compressing image. File might be corrupted.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as 'image/jpeg' | 'image/webp';
    setFormat(val);
    if (file) {
      compressImage(file, val);
    }
  };

  const getDim = (src: string | null): Promise<{w: number, h: number}> => {
    return new Promise((resolve) => {
      if(!src) return resolve({w: 0, h: 0});
      const img = new Image();
      img.onload = () => resolve({w: img.width, h: img.height});
      img.src = src;
    });
  }

  const [dims, setDims] = useState<{orig: {w:number, h:number}, comp: {w:number, h:number}}>({orig:{w:0,h:0}, comp:{w:0,h:0}});
  React.useEffect(() => {
    if(previewOriginal && previewCompressed) {
      Promise.all([getDim(previewOriginal), getDim(previewCompressed)]).then(res => {
        setDims({orig: res[0], comp: res[1]});
      });
    }
  }, [previewOriginal, previewCompressed]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {!file ? (
        <Dropzone onFileSelect={handleFileSelect} targetInfo={`Target size: ${targetKB} KB`} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Output Format:</label>
              <select value={format} onChange={handleFormatChange} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>
            <button onClick={reset} className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
              Try another image
            </button>
          </div>

          {errorMsg && <p className="text-red-500 font-medium text-center">{errorMsg}</p>}

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Compressing image...</p>
            </div>
          ) : previewOriginal && previewCompressed && compressedFile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                  Original Image
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </h3>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                  <img src={previewOriginal} alt="Original" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Dimensions: {dims.orig.w} × {dims.orig.h} px</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                  Compressed Image
                  <span className={`text-sm px-2 py-1 rounded text-white ${compressedFile.size <= targetKB * 1024 ? 'bg-green-500' : 'bg-red-500'}`}>
                    {(compressedFile.size / 1024).toFixed(1)} KB
                  </span>
                </h3>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                  <img src={previewCompressed} alt="Compressed" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Dimensions: {dims.comp.w} × {dims.comp.h} px</p>
                  <p className={compressedFile.size <= targetKB * 1024 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                    {compressedFile.size <= targetKB * 1024 ? `✓ Under target (${targetKB} KB)` : `✗ Could not reach target (${targetKB} KB)`}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {!loading && compressedFile && (
            <div className="flex justify-center pt-4">
              <a
                href={previewCompressed!}
                download={compressedFile.name}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:-translate-y-1 transition-all text-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
