import { useSWRConfig } from 'swr';
import { Client } from '@/types/client';
import { toast } from 'sonner';

interface CreateClientData {
  name: string;
  representative_name: string;
  business_number?: string;
  emails: string[];
  phones: string[];
  address?: string;
  website?: string;
}

export function useClientActions() {
  const { mutate } = useSWRConfig();

  const createClient = async (data: CreateClientData): Promise<Client> => {
    try {
      const response = await fetch('/api/clients/clients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create client');
      }

      const client = await response.json();
      
      // Invalidate the clients list cache
      await mutate('/api/clients/clients/');
      
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, data: Partial<CreateClientData>): Promise<Client> => {
    try {
      const response = await fetch(`/api/clients/clients/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update client');
      }

      const client = await response.json();
      
      // Invalidate both the client detail and list caches
      await mutate(`/api/clients/clients/${id}/`);
      await mutate('/api/clients/clients/');
      
      return client;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/clients/clients/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      // Invalidate the clients list cache
      await mutate('/api/clients/clients/');
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  };

  return {
    createClient,
    updateClient,
    deleteClient,
  };
} 