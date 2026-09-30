import React, { useState, useEffect, useRef } from 'react';
import Dropzone from './Dropzone';
import { loadImg, captureCanvas, compressToTargetKB, getDpiMultiplier } from '../../utils/imageUtils';

interface ImageResizerProps {
  defaultMode?: 'pixels' | 'preset';
  defaultPreset?: string;
}

const PRESETS = [
  { label: '200 x 230 px', unit: 'px', w: 200, h: 230 },
  { label: '35mm x 45mm', unit: 'mm', w: 35, h: 45 },
  { label: '51mm x 51mm', unit: 'mm', w: 51, h: 51 },
];

export default function ImageResizer({ defaultMode = 'pixels', defaultPreset = PRESETS[0].label }: ImageResizerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [originalImg, setOriginalImg] = useState<HTMLImageElement | null>(null);
  const [previewOriginal, setPreviewOriginal] = useState<string | null>(null);

  const [resizedFile, setResizedFile] = useState<File | null>(null);
  const [previewResized, setPreviewResized] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings
  const [mode, setMode] = useState<'pixels' | 'preset'>(defaultMode);
  const [preset, setPreset] = useState(defaultPreset);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  // Custom pixel inputs
  const [widthPx, setWidthPx] = useState<string>('');
  const [heightPx, setHeightPx] = useState<string>('');
  const [keepAspect, setKeepAspect] = useState(true);

  // Optional target KB
  const [useTargetKB, setUseTargetKB] = useState(false);
  const [targetKB, setTargetKB] = useState<string>('');

  const [dims, setDims] = useState<{orig: {w:number, h:number}, res: {w:number, h:number}}>({orig:{w:0,h:0}, res:{w:0,h:0}});

  const reset = () => {
    setFile(null);
    setOriginalImg(null);
    setPreviewOriginal(null);
    setResizedFile(null);
    setPreviewResized(null);
    setErrorMsg(null);
    // don't reset inputs
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

      // Init inputs if empty
      if (mode === 'pixels' && !widthPx && !heightPx) {
        setWidthPx(img.width.toString());
        setHeightPx(img.height.toString());
      }
    } catch(e) {
      setErrorMsg('Failed to load image.');
    }
  };

  // If aspect ratio is on, updating width updates height and vice versa
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const w = e.target.value;
    setWidthPx(w);
    if (keepAspect && originalImg) {
      const wNum = parseInt(w);
      if (!isNaN(wNum) && wNum > 0) {
        setHeightPx(Math.round(wNum * (originalImg.height / originalImg.width)).toString());
      }
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = e.target.value;
    setHeightPx(h);
    if (keepAspect && originalImg) {
      const hNum = parseInt(h);
      if (!isNaN(hNum) && hNum > 0) {
        setWidthPx(Math.round(hNum * (originalImg.width / originalImg.height)).toString());
      }
    }
  };

  const calculateTargetDimensions = () => {
    if (mode === 'preset') {
      const p = PRESETS.find(x => x.label === preset);
      if (!p) return { w: 0, h: 0 };
      if (p.unit === 'mm') {
        const mult = getDpiMultiplier('mm');
        return { w: Math.round(p.w * mult), h: Math.round(p.h * mult) };
      }
      return { w: p.w, h: p.h };
    } else {
      return { w: parseInt(widthPx) || 0, h: parseInt(heightPx) || 0 };
    }
  };

  const processImage = async () => {
    if (!originalImg || !file) return;
    const { w: targetW, h: targetH } = calculateTargetDimensions();

    if (targetW <= 0 || targetH <= 0) {
      setErrorMsg('Please provide valid target dimensions above 0.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      let bestBlob: Blob | null = null;
      let finalW = targetW;
      let finalH = targetH;

      const cropCentered = !keepAspect || mode === 'preset'; // if user unlinks aspect or uses preset, we crop-to-fill.

      if (useTargetKB && parseFloat(targetKB) > 0) {
        // Compress logic
        bestBlob = await compressToTargetKB(originalImg, targetW, targetH, format, parseFloat(targetKB), cropCentered);
      } else {
        // Just capture at top quality (.95)
        bestBlob = await captureCanvas(originalImg, targetW, targetH, format, 0.95, cropCentered);
      }

      if (bestBlob) {
        const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
        const newFileName = `resized-${targetW}x${targetH}.${ext}`;
        const newFile = new File([bestBlob], newFileName, { type: format });
        setResizedFile(newFile);

        const resUrl = URL.createObjectURL(bestBlob);
        setPreviewResized(resUrl);
        setDims(prev => ({...prev, res: {w: targetW, h: targetH}}));
      } else {
        setErrorMsg('Error processing image.');
      }
    } catch(e) {
      setErrorMsg('Unexpected error while resizing.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-process on select if we already have the image and user clicked apply,
  // but it's better to process via an explicit button when inputs exist.

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {!file ? (
        <Dropzone onFileSelect={handleFileSelect} />
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">

              <div className="space-y-4 flex-grow max-w-lg">
                <div className="flex items-center gap-4 border-b border-gray-200 pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="pixels" checked={mode === 'pixels'} onChange={() => setMode('pixels')} className="text-blue-600" />
                    <span className="text-sm font-medium">By pixels</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="preset" checked={mode === 'preset'} onChange={() => setMode('preset')} className="text-blue-600" />
                    <span className="text-sm font-medium">By preset</span>
                  </label>
                </div>

                {mode === 'pixels' ? (
                  <div className="space-y-3">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                        <input type="number" min="1" value={widthPx} onChange={handleWidthChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                      </div>
                      <span className="text-gray-400 mt-5">×</span>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                        <input type="number" min="1" value={heightPx} onChange={handleHeightChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} className="text-blue-600 rounded" />
                      <span className="text-sm text-gray-700">Keep aspect ratio {(!keepAspect) && <span className="text-gray-400 text-xs ml-1">(Image will crop to fill)</span>}</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Select Size Preset</label>
                    <select value={preset} onChange={(e) => setPreset(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
                      {PRESETS.map((p) => (
                        <option key={p.label} value={p.label}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-2">
                   <label className="block text-xs text-gray-500 mb-1">Output Format</label>
                   <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto">
                    <option value="image/jpeg">JPG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={useTargetKB} onChange={(e) => setUseTargetKB(e.target.checked)} className="text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Compress to target KB (optional)</span>
                  </label>
                  {useTargetKB && (
                    <input type="number" placeholder="Enter KB (e.g. 50)" value={targetKB} onChange={(e) => setTargetKB(e.target.value)}
                           className="w-full sm:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  )}
                </div>

              </div>

              <div className="flex flex-col gap-3 shrink-0 self-start md:self-end">
                <button onClick={processImage} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors whitespace-nowrap">
                   {loading ? 'Processing...' : 'Apply Resizing'}
                </button>
                <button onClick={reset} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
                  Try another image
                </button>
              </div>

            </div>
          </div>

          {errorMsg && <p className="text-red-500 font-medium text-center">{errorMsg}</p>}

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Resizing image...</p>
            </div>
          ) : previewOriginal && previewResized && resizedFile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
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
                  Resized Image
                  <span className="text-sm bg-green-500 text-white px-2 py-1 rounded">
                    {(resizedFile.size / 1024).toFixed(1)} KB
                  </span>
                </h3>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                  <img src={previewResized} alt="Resized output" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Dimensions: {dims.res.w} × {dims.res.h} px</p>
                  {(() => {
                    const presetMatch = mode === 'preset' && PRESETS.find(x => x.label === preset);
                    if (presetMatch && presetMatch.unit === 'mm') {
                      return <p className="text-blue-600 font-medium">~ {presetMatch.w}mm × {presetMatch.h}mm (at 300 DPI)</p>;
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          ) : null}

          {!loading && resizedFile && (
            <div className="flex justify-center pt-8 border-t border-gray-100">
              <a
                href={previewResized!}
                download={resizedFile.name}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:-translate-y-1 transition-all text-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Image
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
