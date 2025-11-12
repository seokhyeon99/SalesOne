import { Handle, Position, NodeProps } from "reactflow";
import { Card } from "@/components/ui/card";
import { GitBranch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConditionNodeData {
  field: string;
  operator: string;
  value: string;
  onChange?: (data: ConditionNodeData) => void;
}

export function ConditionNode({ data, isConnectable }: NodeProps<ConditionNodeData>) {
  return (
    <Card className="w-[300px] p-4">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4" />
        <h3 className="font-medium">조건</h3>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>필드</Label>
          <Input
            value={data.field}
            onChange={(e) =>
              data.onChange?.({ ...data, field: e.target.value })
            }
            placeholder="customer.email"
          />
        </div>

        <div className="grid gap-2">
          <Label>연산자</Label>
          <Select
            value={data.operator}
            onValueChange={(value) =>
              data.onChange?.({ ...data, operator: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="연산자 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">같음</SelectItem>
              <SelectItem value="not_equals">다름</SelectItem>
              <SelectItem value="contains">포함</SelectItem>
              <SelectItem value="not_contains">미포함</SelectItem>
              <SelectItem value="greater_than">초과</SelectItem>
              <SelectItem value="less_than">미만</SelectItem>
              <SelectItem value="is_empty">비어있음</SelectItem>
              <SelectItem value="is_not_empty">비어있지 않음</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>값</Label>
          <Input
            value={data.value}
            onChange={(e) =>
              data.onChange?.({ ...data, value: e.target.value })
            }
            placeholder="비교할 값"
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: "30%" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: "70%" }}
        isConnectable={isConnectable}
      />
    </Card>
  );
} 