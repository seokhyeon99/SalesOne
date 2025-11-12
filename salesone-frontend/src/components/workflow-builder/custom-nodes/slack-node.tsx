import { Handle, Position, NodeProps } from "reactflow";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SlackNodeData {
  channel: string;
  message: string;
  onChange?: (data: Partial<SlackNodeData>) => void;
}

const defaultData: SlackNodeData = {
  channel: "",
  message: "",
};

export function SlackNode({ data, isConnectable }: NodeProps<SlackNodeData>) {
  // Ensure data has default values
  const nodeData = {
    ...defaultData,
    ...data,
  };

  return (
    <Card className="w-[300px] p-4">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4" />
        <h3 className="font-medium">슬랙 메시지</h3>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>채널</Label>
          <Input
            value={nodeData.channel}
            onChange={(e) =>
              data.onChange?.({ channel: e.target.value })
            }
            placeholder="#general"
          />
        </div>

        <div className="grid gap-2">
          <Label>메시지</Label>
          <Textarea
            value={nodeData.message}
            onChange={(e) =>
              data.onChange?.({ message: e.target.value })
            }
            placeholder="안녕하세요 {{customer.name}} 고객님!"
            rows={4}
          />
          <p className="text-sm text-muted-foreground">
            고객 변수는 &#123;&#123;customer.field&#125;&#125; 형식으로 사용할 수 있습니다.<br />
            예: &#123;&#123;customer.name&#125;&#125;, &#123;&#123;customer.email&#125;&#125;
          </p>
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