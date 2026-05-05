interface UploadResponse {
  url: string;
}

import { useApi } from "./useApi";

export function useFileUpload() {
  const api = useApi();
  const isUploading = ref(false);

  async function upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    isUploading.value = true;

    try {
      return await api<UploadResponse>("/uploads", {
        method: "POST",
        body: formData,
      });
    } finally {
      isUploading.value = false;
    }
  }

  return { isUploading, upload };
}
