import useMongoCrud from "~/composables/useMongoCrud";
import { useImageService } from "./imageService";

export interface OrganizationMember {
  id: string;
  name: string;
  position: string;
  photo: string | null;
  order_number: number;
}

export function useMemberService() {
  const crud = useMongoCrud<OrganizationMember>("organization_members");
  const { uploadImage, deleteImage } = useImageService();

  const fetchAllOrdered = async () => {
    return await crud.fetchAll("order_number", true);
  };

  const reorder = async (items: { id: string; order_number: number }[]) => {
    const promises = items.map((item) =>
      crud.update(item.id, { order_number: item.order_number } as any),
    );
    await Promise.all(promises);
  };

  const removeMember = async (id: string, photoUrl?: string | null) => {
    return await crud.remove(id, photoUrl);
  };

  return {
    ...crud,
    remove: removeMember,
    fetchAllOrdered,
    reorder,
    uploadPhoto: uploadImage,
    deleteImage,
  };
}
