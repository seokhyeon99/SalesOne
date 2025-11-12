import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

export interface ClientFile {
  id: string;
  name: string;
  size: number;
  url: string;
  created_at: string;
  client: string;
}

export function useClientFiles(clientId: string) {
  const { data: files, error, isLoading, mutate } = useSWR<ClientFile[]>(
    `/api/clients/clients/${clientId}/files`,
    fetcher
  );

  const uploadFile = async (file: File, name: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('client', clientId);

    const response = await fetch('/api/clients/client-files', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload file');
    }

    await mutate();
    return response.json();
  };

  const deleteFile = async (fileId: string) => {
    const response = await fetch(`/api/clients/client-files/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    await mutate();
  };

  return {
    files,
    isLoading,
    error,
    uploadFile,
    deleteFile,
  };
} 