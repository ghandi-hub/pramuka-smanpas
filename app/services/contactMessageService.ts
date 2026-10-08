import useMongoCrud from "~/composables/useMongoCrud";

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

export function useContactMessageService() {
  const crud = useMongoCrud<ContactMessage>("contact_messages");

  const markAsRead = async (id: string) => {
    return await crud.update(id, { status: "read" });
  };

  return {
    ...crud,
    markAsRead,
  };
}
