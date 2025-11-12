"use client";

import { Opportunity } from "@/types/opportunity";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Briefcase, Calendar } from "lucide-react";

// Map status to color
const statusColors: Record<string, string> = {
  '상담 전': 'bg-blue-500 border-blue-500',
  '온보딩': 'bg-amber-500 border-amber-500',
  '협상': 'bg-purple-500 border-purple-500',
  '구매': 'bg-green-500 border-green-500',
};

interface OpportunityDragOverlayProps {
  opportunity: Opportunity;
}

export function OpportunityDragOverlay({ opportunity }: OpportunityDragOverlayProps) {
  // Get the color for the current status
  const colorClass = statusColors[opportunity.status] || 'border-gray-300';

  return (
    <Card className={`p-4 cursor-grabbing shadow-xl border-2 ${colorClass} bg-white rotate-1 scale-105`}>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 truncate">{opportunity.name}</h3>
          <Badge variant="outline" className="ml-2 shrink-0 font-medium border-gray-200 bg-gray-50">
            {formatCurrency(opportunity.value)}
          </Badge>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
          <span className="truncate">{opportunity.company}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2 mt-2">
          <div className="text-gray-600 font-medium">{opportunity.contactName}</div>
          <div className="flex items-center text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(opportunity.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
} 