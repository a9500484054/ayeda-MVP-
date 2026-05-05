export const useNotificationsStore = defineStore("notifications", () => {
  const unreadCount = ref(0);
  const enabled = ref(true);

  function markAllRead() {
    unreadCount.value = 0;
  }

  return { unreadCount, enabled, markAllRead };
});
