import { Handle, Position, NodeProps } from "reactflow";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DelayNodeData {
  duration: string;
  unit: string;
  onChange?: (data: DelayNodeData) => void;
}

export function DelayNode({ data, isConnectable }: NodeProps<DelayNodeData>) {
  return (
    <Card className="w-[300px] p-4">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" />
        <h3 className="font-medium">지연</h3>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>시간</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={data.duration}
              onChange={(e) =>
                data.onChange?.({ ...data, duration: e.target.value })
              }
              placeholder="1"
              className="flex-1"
            />
            <Select
              value={data.unit}
              onValueChange={(value) =>
                data.onChange?.({ ...data, unit: value })
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="단위 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">분</SelectItem>
                <SelectItem value="hours">시간</SelectItem>
                <SelectItem value="days">일</SelectItem>
                <SelectItem value="weeks">주</SelectItem>
                <SelectItem value="months">개월</SelectItem>
              </SelectContent>
            </Select>
          </div>
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