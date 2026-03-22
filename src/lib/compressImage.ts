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

  // Only skip if file is already very small (under 200KB)
  if (file.size <= 200 * 1024) {
    console.log(`[compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB — đã nhỏ, bỏ qua`);
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

      // Determine output format: WebP preferred, JPEG fallback
      const useWebP = supportsWebP();
      const outputType = useWebP ? "image/webp" : "image/jpeg";
      const ext = useWebP ? "webp" : "jpg";

      const processBlob = (blob: Blob | null) => {
        if (!blob) {
          console.warn("[compress] Blob creation failed, using original");
          resolve(file);
          return;
        }

        const baseName = file.name.replace(/\.[^.]+$/, "");
        const newFile = new File([blob], `${baseName}.${ext}`, {
          type: outputType,
          lastModified: Date.now(),
        });

        const savedPercent = Math.round((1 - newFile.size / originalSize) * 100);
        console.log(
          `[compress] ${file.name}: ${(originalSize / 1024).toFixed(0)}KB → ${(newFile.size / 1024).toFixed(0)}KB (giảm ${savedPercent}%, ${width}x${height}, ${ext})`
        );

        // If somehow the compressed version is larger, use original
        if (newFile.size >= originalSize) {
          console.log("[compress] Compressed larger than original, using original");
          resolve(file);
          return;
        }

        resolve(newFile);
      };

      // First attempt with target quality
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > maxSizeBytes) {
            // If still too large, try lower quality
            const lowerQuality = Math.max(0.5, quality - 0.2);
            console.log(`[compress] Still ${(blob.size / 1024).toFixed(0)}KB, retrying at quality ${lowerQuality}`);
            canvas.toBlob(processBlob, outputType, lowerQuality);
          } else {
            processBlob(blob);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      console.warn("[compress] Failed to load image, using original");
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
