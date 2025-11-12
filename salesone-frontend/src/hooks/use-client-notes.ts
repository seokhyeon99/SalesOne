import useSWR from 'swr';
import { ClientNote } from '@/types/client';
import { fetcher } from '@/lib/utils';

export function useClientNotes(clientId: string) {
  const { data, error, isLoading, mutate } = useSWR<ClientNote[]>(
    `/api/clients/clients/${clientId}/notes`,
    fetcher
  );

  const createNote = async (title: string, content: string) => {
    const response = await fetch('/api/clients/client-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client: clientId, title, content }),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    mutate();
  };

  const updateNote = async (noteId: string, title: string, content: string) => {
    const response = await fetch(`/api/clients/client-notes/${noteId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      throw new Error('Failed to update note');
    }

    mutate();
  };

  const deleteNote = async (noteId: string) => {
    const response = await fetch(`/api/clients/client-notes/${noteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }

    mutate();
  };

  return {
    notes: data,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
  };
} 