"use client";

import { Opportunity } from "@/types/opportunity";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Briefcase, Calendar } from "lucide-react";

// Define colors and classes for each status
const statusConfig: Record<string, { borderClass: string, hoverBorderClass: string, hoverTextClass: string }> = {
  '상담 전': {
    borderClass: 'border-blue-200',
    hoverBorderClass: 'group-hover:border-blue-300',
    hoverTextClass: 'group-hover:text-blue-700',
  },
  '온보딩': {
    borderClass: 'border-amber-200',
    hoverBorderClass: 'group-hover:border-amber-300',
    hoverTextClass: 'group-hover:text-amber-700',
  },
  '협상': {
    borderClass: 'border-purple-200',
    hoverBorderClass: 'group-hover:border-purple-300',
    hoverTextClass: 'group-hover:text-purple-700',
  },
  '구매': {
    borderClass: 'border-green-200',
    hoverBorderClass: 'group-hover:border-green-300',
    hoverTextClass: 'group-hover:text-green-700',
  },
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: () => void;
}

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: opportunity.id,
    data: {
      opportunity
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  // Get the configuration for this status
  const config = statusConfig[opportunity.status] || {
    borderClass: 'border-gray-200',
    hoverBorderClass: 'group-hover:border-gray-300',
    hoverTextClass: 'group-hover:text-gray-700',
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`p-4 mb-3 cursor-pointer border ${config.borderClass} ${config.hoverBorderClass} group transition-all 
                hover:shadow-md ${isDragging ? 'shadow-lg opacity-75' : 'shadow'} bg-white`}
      onClick={(e) => {
        // Only trigger onClick if the card is clicked, not when being dragged
        if (!isDragging) onClick();
      }}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className={`font-medium text-gray-800 truncate ${config.hoverTextClass} transition-colors`}>
            {opportunity.name}
          </h3>
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