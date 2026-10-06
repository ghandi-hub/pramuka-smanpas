import useSupabaseCrud from "~/composables/useSupabaseCrud";
import { useImageService } from "./imageService";

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  x: number;
  y: number;
  rotation: number;
  created_at: string;
}

export function useGalleryService() {
  const crud = useSupabaseCrud<GalleryItem>("galleries");
  const { uploadImage, deleteImage } = useImageService();

  const updatePosition = async (id: string, x: number, y: number) => {
    await crud.update(id, { x, y } as any);
  };

  const removeGalleryItem = async (id: string, imageUrl?: string | null) => {
    if (imageUrl) {
      await deleteImage(imageUrl);
    }
    return await crud.remove(id);
  };

  return {
    ...crud,
    remove: removeGalleryItem,
    uploadImage,
    updatePosition,
    deleteImage,
  };
}
