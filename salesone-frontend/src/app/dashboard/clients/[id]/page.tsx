"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientHeader } from "@/components/clients/client-header"
import { ClientTimeline } from "@/components/clients/client-timeline"
import { ClientFiles } from "@/components/clients/client-files"
import { ClientEmails } from "@/components/clients/client-emails"
import { ClientCalendar } from "@/components/clients/client-calendar"
import { ClientNotes } from "@/components/clients/client-notes"
import { ClientTasks } from "@/components/clients/client-tasks"
import { useClient } from "@/hooks/use-clients"
import { Skeleton } from "@/components/ui/skeleton"

interface ClientPageProps {
  params: {
    id: string
  }
}

export default function ClientPage({ params }: ClientPageProps) {
  const { client, isLoading } = useClient(params.id)

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!client) {
    return <div>고객을 찾을 수 없습니다.</div>
  }

  return (
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
  )
} 