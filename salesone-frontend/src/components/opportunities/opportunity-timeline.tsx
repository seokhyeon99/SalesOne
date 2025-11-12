"use client";

import { useOpportunityTimeline } from '@/hooks/use-opportunity-timeline';
import { TimelineItem } from '@/types/opportunity-details';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Paperclip, CheckCircle2, ArrowRightCircle } from 'lucide-react';

interface OpportunityTimelineProps {
  opportunityId: string;
}

export function OpportunityTimeline({ opportunityId }: OpportunityTimelineProps) {
  const { timeline, isLoading } = useOpportunityTimeline(opportunityId);

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

  // Sort timeline by date, most recent first
  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedTimeline.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0 mt-1">
            {getTimelineIcon(item)}
          </div>
          <div className="flex-grow space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">
                {getTimelineTitle(item)}
              </h4>
              <time className="text-sm text-gray-500">
                {formatDate(item.created_at)}
              </time>
            </div>
            {getTimelineContent(item)}
            <p className="text-sm text-gray-500 mt-2">
              작성자: {item.created_by}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to get the appropriate icon based on the timeline item type
function getTimelineIcon(item: TimelineItem) {
  switch (item.type) {
    case 'note':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'file':
      return <Paperclip className="h-5 w-5 text-green-500" />;
    case 'task':
      return <CheckCircle2 className="h-5 w-5 text-purple-500" />;
    case 'status_change':
      return <ArrowRightCircle className="h-5 w-5 text-amber-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}

// Helper function to get the title based on the timeline item type
function getTimelineTitle(item: TimelineItem) {
  switch (item.type) {
    case 'note':
      return item.title;
    case 'file':
      return item.name;
    case 'task':
      return item.title;
    case 'status_change':
      return '상태 변경';
    default:
      return '';
  }
}

// Helper function to get the content based on the timeline item type
function getTimelineContent(item: TimelineItem) {
  switch (item.type) {
    case 'note':
      return item.content && (
        <p className="text-sm text-gray-600 whitespace-pre-line">{item.content}</p>
      );
    case 'file':
      return item.description && (
        <p className="text-sm text-gray-600">{item.description}</p>
      );
    case 'task':
      return (
        <p className="text-sm text-gray-600">
          {item.status === 'completed' ? '작업 완료됨' : '작업 생성됨'}
        </p>
      );
    case 'status_change':
      return (
        <p className="text-sm text-gray-600">
          <span className="text-gray-800">{item.oldStatus}</span>에서{' '}
          <span className="text-gray-800">{item.newStatus}</span>로 변경되었습니다.
        </p>
      );
    default:
      return null;
  }
} 