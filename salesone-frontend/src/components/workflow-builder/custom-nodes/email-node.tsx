import { Handle, Position, NodeProps } from "reactflow";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EmailNodeData {
  to: string;
  subject: string;
  body: string;
  onChange?: (data: EmailNodeData) => void;
}

export function EmailNode({ data, isConnectable }: NodeProps<EmailNodeData>) {
  return (
    <Card className="w-[300px] p-4">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-4 h-4" />
        <h3 className="font-medium">이메일 전송</h3>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>받는 사람</Label>
          <Input
            value={data.to}
            onChange={(e) =>
              data.onChange?.({ ...data, to: e.target.value })
            }
            placeholder="이메일 주소"
          />
        </div>

        <div className="grid gap-2">
          <Label>제목</Label>
          <Input
            value={data.subject}
            onChange={(e) =>
              data.onChange?.({ ...data, subject: e.target.value })
            }
            placeholder="이메일 제목"
          />
        </div>

        <div className="grid gap-2">
          <Label>내용</Label>
          <Textarea
            value={data.body}
            onChange={(e) =>
              data.onChange?.({ ...data, body: e.target.value })
            }
            placeholder="이메일 내용"
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