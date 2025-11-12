import { useClient } from '@/hooks/use-clients';
import { Client } from '@/types/client';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { ClientTimeline } from './client-timeline';
import { ClientTasks } from './client-tasks';
import { ClientNotes } from './client-notes';
import { ClientFiles } from './client-files';
import { ClientHeader } from '@/components/clients/client-header';
import { ClientEmails } from '@/components/clients/client-emails';
import { ClientCalendar } from '@/components/clients/client-calendar';

interface ClientDrawerProps {
  clientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDrawer({ clientId, open, onOpenChange }: ClientDrawerProps) {
  if (!clientId) return null;

  const { client, isLoading } = useClient(clientId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[48rem] p-7 overflow-y-auto" onPointerDownOutside={() => onOpenChange(false)}>
        <SheetHeader className="mb-8">
          <SheetTitle>고객 상세</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : !client ? (
          <div>고객을 찾을 수 없습니다.</div>
        ) : (
          <div className="space-y-8">
            <ClientHeader client={client} />
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList>
                <TabsTrigger value="timeline">타임라인</TabsTrigger>
                <TabsTrigger value="tasks">할일</TabsTrigger>
                <TabsTrigger value="notes">노트</TabsTrigger>
                <TabsTrigger value="files">파일</TabsTrigger>
                <TabsTrigger value="emails">이메일</TabsTrigger>
                <TabsTrigger value="calendar">캘린더</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline">
                <ClientTimeline clientId={client.id} />
              </TabsContent>
              <TabsContent value="tasks">
                <ClientTasks clientId={client.id} />
              </TabsContent>
              <TabsContent value="notes">
                <ClientNotes clientId={client.id} />
              </TabsContent>
              <TabsContent value="files">
                <ClientFiles clientId={client.id} />
              </TabsContent>
              <TabsContent value="emails">
                <ClientEmails clientId={client.id} />
              </TabsContent>
              <TabsContent value="calendar">
                <ClientCalendar clientId={client.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 