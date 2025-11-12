import { Handle, Position } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserIcon, BellIcon } from "lucide-react";

export interface TriggerNodeData {
  type: "client" | "event";
  eventType?: "task_created" | "task_updated" | "note_created" | "note_updated";
  onChange?: (data: Partial<TriggerNodeData>) => void;
}

export function TriggerNode({ data }: { data: TriggerNodeData }) {
  return (
    <Card className="w-[300px]">
      <CardHeader className="flex flex-row items-center gap-2 p-4">
        {data.type === "client" ? (
          <UserIcon className="h-5 w-5 text-primary" />
        ) : (
          <BellIcon className="h-5 w-5 text-primary" />
        )}
        <CardTitle className="text-base">
          {data.type === "client" ? "고객 트리거" : "이벤트 트리거"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label>트리거 유형</Label>
            <Select
              value={data.type}
              onValueChange={(value: "client" | "event") =>
                data.onChange?.({ type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">고객 트리거</SelectItem>
                <SelectItem value="event">이벤트 트리거</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.type === "event" && (
            <div className="grid gap-2">
              <Label>이벤트 유형</Label>
              <Select
                value={data.eventType}
                onValueChange={(value) =>
                  data.onChange?.({ eventType: value as TriggerNodeData["eventType"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task_created">할일 생성</SelectItem>
                  <SelectItem value="task_updated">할일 수정</SelectItem>
                  <SelectItem value="note_created">노트 생성</SelectItem>
                  <SelectItem value="note_updated">노트 수정</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {data.type === "client" && (
            <div className="text-sm text-muted-foreground">
              이 워크플로우는 고객 정보를 기반으로 실행됩니다.
              <br />
              고객의 모든 정보를 변수로 사용할 수 있습니다.
            </div>
          )}
        </div>
      </CardContent>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
} 