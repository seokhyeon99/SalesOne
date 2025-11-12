import { useClientTimeline } from '@/hooks/use-client-timeline';
import { TimelineItem } from '@/types/client';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Paperclip } from 'lucide-react';

interface ClientTimelineProps {
  clientId: string;
}

export function ClientTimeline({ clientId }: ClientTimelineProps) {
  const { timeline, isLoading } = useClientTimeline(clientId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        아직 기록된 활동이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="flex gap-4 p-4 border rounded-lg bg-card"
        >
          <div className="flex-shrink-0 mt-1">
            {item.type === 'note' ? (
              <FileText className="h-5 w-5 text-blue-500" />
            ) : (
              <Paperclip className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className="flex-grow space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                {item.type === 'note' ? item.title : item.name}
              </h4>
              <time className="text-sm text-muted-foreground">
                {formatDate(item.created_at)}
              </time>
            </div>
            {item.type === 'note' && item.content && (
              <p className="text-sm text-muted-foreground">{item.content}</p>
            )}
            {item.type === 'file' && item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              작성자: {item.created_by}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 