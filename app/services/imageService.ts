export function useImageService() {
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

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
