import { apiClient } from './apiClient';

export const fileService = {
  async getUploadUrl(filename: string, fileType: string): Promise<{ uploadUrl: string; key: string }> {
    return apiClient.post<{ uploadUrl: string; key: string }>('/files/upload-url', {
      filename,
      fileType,
    });
  },

  async uploadFile(file: File): Promise<string> {
    const { uploadUrl, key } = await this.getUploadUrl(file.name, file.type);
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file to storage: ${response.statusText}`);
    }

    return key;
  },

  async getDownloadUrl(key: string): Promise<string> {
    const data = await apiClient.get<{ downloadUrl: string }>(`/files/download-url?key=${encodeURIComponent(key)}`);
    return data.downloadUrl;
  }
};
