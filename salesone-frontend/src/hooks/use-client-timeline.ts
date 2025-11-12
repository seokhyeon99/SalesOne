import useSWR from 'swr';
import { TimelineItem } from '@/types/client';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useClientTimeline(clientId: string) {
  const { data, error, isLoading, mutate } = useSWR<TimelineItem[]>(
    clientId ? `/api/clients/clients/${clientId}/timeline/` : null,
    fetcher
  );

  return {
    timeline: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
} 