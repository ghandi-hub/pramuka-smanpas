/**
 * Pre-compress and resize image file in browser before uploading to server.
 * Bypasses SVG files, scales raster images to max 1920px, and converts to WebP (fallback JPEG).
 */
export async function preCompressImage(file: File): Promise<File> {
  if (
    typeof window === "undefined" ||
    !file ||
    file.type === "image/svg+xml" ||
    !file.type.startsWith("image/")
  ) {
    return file;
  }

  try {
    let sourceWidth = 0;
    let sourceHeight = 0;
    let imageSource: CanvasImageSource | null = null;
    let cleanup: (() => void) | null = null;

    if (typeof createImageBitmap === "function") {
      try {
        const bmp = await createImageBitmap(file);
        sourceWidth = bmp.width;
        sourceHeight = bmp.height;
        imageSource = bmp;
        cleanup = () => bmp.close();
      } catch {
        imageSource = null;
      }
    }

    if (!imageSource) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      cleanup = () => URL.revokeObjectURL(objectUrl);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => reject(err);
        img.src = objectUrl;
      });

      sourceWidth = img.naturalWidth || img.width;
      sourceHeight = img.naturalHeight || img.height;
      imageSource = img;
    }

    if (!sourceWidth || !sourceHeight || !imageSource) {
      if (cleanup) cleanup();
      return file;
    }

    const MAX_DIMENSION = 1920;
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (sourceWidth > MAX_DIMENSION || sourceHeight > MAX_DIMENSION) {
      if (sourceWidth >= sourceHeight) {
        targetWidth = MAX_DIMENSION;
        targetHeight = Math.round((sourceHeight * MAX_DIMENSION) / sourceWidth);
      } else {
        targetHeight = MAX_DIMENSION;
        targetWidth = Math.round((sourceWidth * MAX_DIMENSION) / sourceHeight);
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      if (cleanup) cleanup();
      return file;
    }

    ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);
    if (cleanup) cleanup();

    // Export as WebP blob (fallback to JPEG if webp not supported) with quality 0.85
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob && webpBlob.type === "image/webp") {
            resolve(webpBlob);
          } else {
            canvas.toBlob(
              (jpegBlob) => resolve(jpegBlob),
              "image/jpeg",
              0.85
            );
          }
        },
        "image/webp",
        0.85
      );
    });

    if (!blob) {
      return file;
    }

    const baseName = file.name.replace(/\.[^/.]+$/, "") || "image";
    const isWebp = blob.type === "image/webp";
    const newFilename = `${baseName}.${isWebp ? "webp" : "jpg"}`;

    return new File([blob], newFilename, {
      type: blob.type || "image/webp",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("Client-side image pre-compression failed, using original file:", error);
    return file;
  }
}

export function useImageService() {
  const uploadImage = async (file: File): Promise<string> => {
    const fileToUpload = await preCompressImage(file);
    const formData = new FormData();
    formData.append("file", fileToUpload);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.statusMessage || data.message || "Failed to upload image",
      );
    }

    return data.url;
  };

  const deleteImage = async (imageUrl: string) => {
    if (!imageUrl) return;

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });
    } catch (error) {
      console.error("Failed to delete old image", error);
    }
  };

  return {
    uploadImage,
    deleteImage,
  };
}
