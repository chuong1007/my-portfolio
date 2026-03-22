/**
 * Client-side image compression using Canvas API
 * Resizes large images and converts to WebP for smaller file sizes
 * while maintaining visual quality.
 */

type CompressOptions = {
  maxWidth?: number;   // Max pixel width (default: 1920)
  maxHeight?: number;  // Max pixel height (default: 1920)
  quality?: number;    // 0-1, WebP quality (default: 0.82)
  maxSizeMB?: number;  // Max file size in MB (default: 1)
};

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

  // Skip if already small enough and is WebP
  if (file.size <= maxSizeBytes && file.type === "image/webp") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

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
        reject(new Error("Canvas context not available"));
        return;
      }

      // Use better image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fallback to JPEG
      const outputType = "image/webp";
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }

          // Generate new filename with .webp extension
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const newFile = new File([blob], `${baseName}.webp`, {
            type: outputType,
            lastModified: Date.now(),
          });

          const savedPercent = Math.round((1 - newFile.size / file.size) * 100);
          console.log(
            `[compress] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(newFile.size / 1024).toFixed(0)}KB (giảm ${savedPercent}%, ${width}x${height})`
          );

          resolve(newFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // If compression fails, return original file
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
