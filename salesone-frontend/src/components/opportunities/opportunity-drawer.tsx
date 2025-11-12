"use client";

import { useOpportunity } from '@/hooks/use-opportunities';
import { Opportunity } from '@/types/opportunity';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OpportunityHeader } from './opportunity-header';
import { OpportunityTimeline } from './opportunity-timeline';
import { OpportunityTasks } from './opportunity-tasks';
import { OpportunityNotes } from './opportunity-notes';
import { OpportunityFiles } from './opportunity-files';
import { OpportunityResearch } from './opportunity-research';
import { Info } from 'lucide-react';

interface OpportunityDrawerProps {
  opportunityId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpportunityDrawer({
  opportunityId,
  open,
  onOpenChange,
}: OpportunityDrawerProps) {
  if (!opportunityId) return null;

  const { opportunity, isLoading } = useOpportunity(opportunityId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[48rem] p-7 overflow-y-auto" onPointerDownOutside={() => onOpenChange(false)}>
        <SheetHeader className="mb-8">
          <SheetTitle>잠재고객 상세</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : !opportunity ? (
          <div>잠재고객을 찾을 수 없습니다.</div>
        ) : (
          <div className="space-y-8">
            <OpportunityHeader opportunity={opportunity} />
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList>
                <TabsTrigger value="timeline">타임라인</TabsTrigger>
                <TabsTrigger value="tasks">할일</TabsTrigger>
                <TabsTrigger value="notes">노트</TabsTrigger>
                <TabsTrigger value="files">파일</TabsTrigger>
                <TabsTrigger value="research" className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  정보
                </TabsTrigger>
              </TabsList>
              <TabsContent value="timeline">
                <OpportunityTimeline opportunityId={opportunity.id} />
              </TabsContent>
              <TabsContent value="tasks">
                <OpportunityTasks opportunityId={opportunity.id} />
              </TabsContent>
              <TabsContent value="notes">
                <OpportunityNotes opportunityId={opportunity.id} />
              </TabsContent>
              <TabsContent value="files">
                <OpportunityFiles opportunityId={opportunity.id} />
              </TabsContent>
              <TabsContent value="research">
                <OpportunityResearch companyName={opportunity.company} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 