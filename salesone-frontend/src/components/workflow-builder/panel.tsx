import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, BellIcon, MailIcon, MessageSquareIcon, GlobeIcon, GitForkIcon, ClockIcon } from "lucide-react";

export function NodePanel() {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, data: any = {}) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card className="w-60">
      <CardHeader>
        <CardTitle>노드</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <h3 className="mb-2 text-sm font-medium">트리거</h3>
          <div className="grid gap-2">
            <div
              className="flex cursor-grab items-center gap-2 rounded-md border p-3 transition-colors hover:bg-muted"
              draggable
              onDragStart={(e) => onDragStart(e, 'triggerNode', { type: 'client' })}
            >
              <UserIcon className="h-4 w-4" />
              <span className="text-sm">고객 트리거</span>
            </div>
            <div
              className="flex cursor-grab items-center gap-2 rounded-md border p-3 transition-colors hover:bg-muted"
              draggable
              onDragStart={(e) => onDragStart(e, 'triggerNode', { type: 'event' })}
            >
              <BellIcon className="h-4 w-4" />
              <span className="text-sm">이벤트 트리거</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">액션</h3>
          <div className="grid gap-2">
            <div
              className="flex cursor-grab items-center gap-2 rounded-md border p-3 transition-colors hover:bg-muted"
              draggable
              onDragStart={(e) => onDragStart(e, 'emailNode')}
            >
              <MailIcon className="h-4 w-4" />
              <span className="text-sm">이메일</span>
            </div>
            <div
              className="flex cursor-grab items-center gap-2 rounded-md border p-3 transition-colors hover:bg-muted"
              draggable
              onDragStart={(e) => onDragStart(e, 'slackNode')}
            >
              <MessageSquareIcon className="h-4 w-4" />
              <span className="text-sm">슬랙</span>
            </div>
            <div
              className="flex cursor-grab items-center gap-2 rounded-md border p-3 transition-colors hover:bg-muted"
              draggable
              onDragStart={(e) => onDragStart(e, 'webhookNode')}
            >
              <GlobeIcon className="h-4 w-4" />
              <span className="text-sm">웹훅</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">로직</h3>
          <div className="grid gap-2">
            <div
              className="flex cursor-grab items-center gap-2 rounded-md border p-3 transition-colors hover:bg-muted"
              draggable
              onDragStart={(e) => onDragStart(e, 'conditionNode')}
            >
              <GitForkIcon className="h-4 w-4" />
              <span className="text-sm">조건</span>
            </div>
            <div
              className="flex cursor-grab items-center gap-2 rounded-md border p-3 transition-colors hover:bg-muted"
              draggable
              onDragStart={(e) => onDragStart(e, 'delayNode')}
            >
              <ClockIcon className="h-4 w-4" />
              <span className="text-sm">지연</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 