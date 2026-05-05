export function useDebounce<T extends (...args: never[]) => void>(callback: T, delay = 350) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => callback(...args), delay);
  };
}
