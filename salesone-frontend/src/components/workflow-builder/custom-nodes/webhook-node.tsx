import { Handle, Position, NodeProps } from "reactflow";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WebhookNodeData {
  url: string;
  method: string;
  headers: string;
  body: string;
  onChange?: (data: WebhookNodeData) => void;
}

export function WebhookNode({ data, isConnectable }: NodeProps<WebhookNodeData>) {
  return (
    <Card className="w-[300px] p-4">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4" />
        <h3 className="font-medium">웹훅</h3>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>URL</Label>
          <Input
            value={data.url}
            onChange={(e) =>
              data.onChange?.({ ...data, url: e.target.value })
            }
            placeholder="https://api.example.com/webhook"
          />
        </div>

        <div className="grid gap-2">
          <Label>메소드</Label>
          <Select
            value={data.method}
            onValueChange={(value) =>
              data.onChange?.({ ...data, method: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="HTTP 메소드 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>헤더</Label>
          <Textarea
            value={data.headers}
            onChange={(e) =>
              data.onChange?.({ ...data, headers: e.target.value })
            }
            placeholder="Content-Type: application/json"
            rows={2}
          />
        </div>

        <div className="grid gap-2">
          <Label>바디</Label>
          <Textarea
            value={data.body}
            onChange={(e) =>
              data.onChange?.({ ...data, body: e.target.value })
            }
            placeholder="{ }"
            rows={4}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </Card>
  );
} 