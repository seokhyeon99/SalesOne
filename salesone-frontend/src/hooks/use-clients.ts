import useSWR from 'swr';
import { Client } from '@/types/client';

interface ClientsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Client[];
}

export function useClients() {
  const { data, error, isLoading, mutate } = useSWR<ClientsResponse>(
    '/api/clients/clients/',
    async (url: string | URL | Request) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    }
  );

  return {
    clients: data?.results,
    totalCount: data?.count,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useClient(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Client>(
    id ? `/api/clients/clients/${id}/` : null,
    async (url: string | URL | Request) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch client');
      }
      return response.json();
    }
  );

  return {
    client: data,
    isLoading,
    isError: error,
    mutate,
  };
} 