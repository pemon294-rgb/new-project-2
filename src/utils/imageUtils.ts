export const loadImg = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = objectUrl;
  });
};

export const captureCanvas = (
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  mimeType: string,
  quality: number,
  cropCentered: boolean = false,
  cleanBg: boolean = false
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    // white bg for transparent converting to JPG or clean bg mode
    if (mimeType === 'image/jpeg' || cleanBg) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetW, targetH);
    }

    if (cropCentered) {
      const srcRatio = img.width / img.height;
      const dstRatio = targetW / targetH;
      let sWidth = img.width;
      let sHeight = img.height;
      let sx = 0;
      let sy = 0;

      if (srcRatio > dstRatio) {
        sWidth = img.height * dstRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / dstRatio;
        sy = (img.height - sHeight) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
    } else {
      ctx.drawImage(img, 0, 0, targetW, targetH);
    }

    if (cleanBg) {
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        // threshold for near white/cream/grey backgrounds
        if (data[i] > 160 && data[i+1] > 160 && data[i+2] > 160) {
          data[i] = 255;
          data[i+1] = 255;
          data[i+2] = 255;
          data[i+3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
};

export const compressToTargetKB = async (
  img: HTMLImageElement,
  startW: number,
  startH: number,
  targetFormat: 'image/jpeg' | 'image/webp' | 'image/png',
  targetKB: number,
  cropCentered: boolean = false,
  cleanBg: boolean = false
): Promise<Blob | null> => {
  const targetBytes = targetKB * 1024;
  let bestBlob: Blob | null = null;

  // If target format is PNG, we can't really binary search quality natively as canvas PNG doesn't use quality param
  // but if it's required for targetKB, we just rely on resizing.
  // Actually, standard target KB logic mainly uses jpeg/webp.

  let currentScale = 1.0;
  let attempt = 0;

  while (currentScale > 0.1 && attempt < 10) {
    let minQ = 0.1;
    let maxQ = 0.95;
    let q = 0.8;

    let localBestBlob: Blob | null = null;
    let localBestDiff = Infinity;
    let foundUnderTarget = false;

    // For PNG, just resize (since quality is ignored).
    const isLossless = targetFormat === 'image/png';
    const iterations = isLossless ? 1 : 7;

    for (let i = 0; i < iterations; i++) {
      const blob = await captureCanvas(
        img,
        startW * currentScale,
        startH * currentScale,
        targetFormat,
        q,
        cropCentered,
        cleanBg
      );
      if (!blob) break;

      if (blob.size <= targetBytes) {
        foundUnderTarget = true;
        const diff = targetBytes - blob.size;
        if (diff < localBestDiff) {
          localBestDiff = diff;
          localBestBlob = blob;
        }
        minQ = q;
        q = (q + maxQ) / 2;
      } else {
        maxQ = q;
        q = (minQ + q) / 2;
      }
    }

    if (foundUnderTarget && localBestBlob) {
      bestBlob = localBestBlob;
      break;
    } else {
      currentScale *= 0.8;
      attempt++;
    }
  }

  if (!bestBlob) {
    bestBlob = await captureCanvas(img, startW * currentScale, startH * currentScale, targetFormat, 0.1, cropCentered, cleanBg);
  }


  return bestBlob;
};

export const getDpiMultiplier = (unit: 'mm' | 'cm' | 'in', targetDpi = 300) => {
  if (unit === 'mm') {
    return targetDpi / 25.4;
  }
  if (unit === 'cm') {
    return targetDpi / 2.54;
  }
  return targetDpi; // inches to pixels is just DPI
};


