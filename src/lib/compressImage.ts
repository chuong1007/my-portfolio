/**
 * Client-side image compression using Canvas API
 * Resizes large images and converts to WebP (or JPEG fallback)
 * for smaller file sizes while maintaining visual quality.
 */

type CompressOptions = {
  maxWidth?: number;   // Max pixel width (default: 1920)
  maxHeight?: number;  // Max pixel height (default: 1920)
  quality?: number;    // 0-1, output quality (default: 0.82)
  maxSizeMB?: number;  // Target max file size in MB (default: 1)
};

/**
 * Check if browser supports WebP encoding
 */
function supportsWebP(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    maxSizeMB = 1,
  } = options;

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Hard limit for Supabase Storage free tier is 5MB. 
  // We aim for 4MB to be safe and leave room for metadata.
  const SUPABASE_FREE_LIMIT_BYTES = 4.5 * 1024 * 1024; 
  const targetBytes = Math.min(maxSizeBytes, SUPABASE_FREE_LIMIT_BYTES);

  // Skip if file is already small AND under the Supabase limit
  if (file.size <= 200 * 1024 && file.size < SUPABASE_FREE_LIMIT_BYTES) {
    console.log(`[compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB — small enough, skipping`);
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const originalSize = file.size;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.warn("[compress] Canvas context not available, using original");
        resolve(file);
        return;
      }

      // Use better image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const cleanup = () => {
        canvas.width = 0;
        canvas.height = 0;
        URL.revokeObjectURL(url);
      };

      // Determiner function to try different quality settings and dimensions to hit size target
      const tryCompress = (currentQuality: number, currentScale: number) => {
        const scaledWidth = Math.round(width * currentScale);
        const scaledHeight = Math.round(height * currentScale);
        
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        
        const currentCtx = canvas.getContext("2d");
        if (!currentCtx) {
          cleanup();
          resolve(file);
          return;
        }

        currentCtx.imageSmoothingEnabled = true;
        currentCtx.imageSmoothingQuality = "high";
        currentCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

        canvas.toBlob((blob) => {
          if (!blob) {
            cleanup();
            resolve(file);
            return;
          }

          // SUCCESS: Under all limits
          if (blob.size <= targetBytes) {
            const baseName = file.name.replace(/\.[^.]+$/, "");
            const newFile = new File([blob], `${baseName}.${ext}`, {
              type: outputType,
              lastModified: Date.now(),
            });

            console.log(`[compress] ${file.name}: ${(originalSize / 1024).toFixed(0)}KB → ${(newFile.size / 1024).toFixed(0)}KB (Quality: ${currentQuality.toFixed(2)}, Scale: ${currentScale.toFixed(2)}, ${ext})`);
            cleanup();
            resolve(newFile);
          } 
          // FAIL: Still too large, try reducing quality
          else if (currentQuality > 0.4) {
            tryCompress(currentQuality - 0.15, currentScale);
          } 
          // FAIL: Quality low, try reducing resolution
          else if (currentScale > 0.4) {
            tryCompress(0.7, currentScale - 0.2); // Reset quality, drop resolution
          } 
          // FINAL FAIL: Give up and return original if it's less than free limit, 
          // otherwise return a tiny blank/fallback to avoid total error?
          // For now, return original and let storage handle the 413 error.
          else {
            console.warn(`[compress] Failed to hit target size for ${file.name}, using original`);
            cleanup();
            resolve(file);
          }
        }, outputType, currentQuality);
      };

      // Determine output format
      const useWebP = supportsWebP();
      const outputType = useWebP ? "image/webp" : "image/jpeg";
      const ext = useWebP ? "webp" : "jpg";

      // Start recursive compression attempt
      tryCompress(quality, 1.0);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      console.warn("[compress] Image load error, using original");
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options?: CompressOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}
