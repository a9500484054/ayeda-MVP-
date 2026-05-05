export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: "success" | "info" | "warning" | "error";
}

export const useUiStore = defineStore("ui", () => {
  const sidebarOpen = ref(false);
  const toasts = ref<ToastMessage[]>([]);

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function notify(message: Omit<ToastMessage, "id">) {
    toasts.value.push({ id: crypto.randomUUID(), ...message });
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  return { sidebarOpen, toasts, toggleSidebar, notify, dismiss };
});
