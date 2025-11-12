"use client";

import { Opportunity, OpportunityStatus } from "@/types/opportunity";
import { OpportunityCard } from "./opportunity-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

interface OpportunityColumnProps {
  title: string;
  status: OpportunityStatus;
  opportunities: Opportunity[];
  onSelect: (opportunityId: string) => void;
  count: number;
  totalValue: number;
}

// Map status to color
const statusColors: Record<OpportunityStatus, string> = {
  '상담 전': 'bg-blue-500',
  '온보딩': 'bg-amber-500',
  '협상': 'bg-purple-500',
  '구매': 'bg-green-500',
};

export function OpportunityColumn({
  title,
  status,
  opportunities,
  onSelect,
  count,
  totalValue,
}: OpportunityColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      status,
    },
  });

  return (
    <Card 
      className={`min-h-[80vh] border-0 shadow-lg ${isOver ? 'ring-2 ring-primary' : ''} bg-white bg-opacity-90 backdrop-blur-sm transition-all`}
      ref={setNodeRef}
    >
      <div className={`h-1.5 w-full ${statusColors[status]} rounded-t-lg`} />
      <CardHeader className="pb-2 pt-5">
        <CardTitle className="text-base font-medium flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${statusColors[status]} mr-2`} />
            <span className="text-gray-800">{title}</span>
          </div>
          <span className="text-sm font-normal py-0.5 px-2 rounded-full bg-gray-100 text-gray-600">
            {count}개
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm font-medium mb-4 pb-3 border-b border-gray-100">
          총 <span className="text-gray-800">{formatCurrency(totalValue)}</span>
        </div>
        {count === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            이 단계에 잠재고객이 없습니다.<br />
            카드를 드래그하여 이동할 수 있습니다.
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(80vh-140px)] overflow-y-auto pr-1 -mr-1 pt-1">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onClick={() => onSelect(opportunity.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 