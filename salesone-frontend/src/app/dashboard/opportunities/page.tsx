"use client";

import { useState } from "react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { OpportunityDrawer } from "@/components/opportunities/opportunity-drawer";
import { OpportunityDialog } from "@/components/opportunities/opportunity-dialog";
import { OpportunityColumn } from "@/components/opportunities/opportunity-column";
import { OpportunityDragOverlay } from "@/components/opportunities/opportunity-drag-overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Opportunity, OpportunityStatus } from "@/types/opportunity";
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay 
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";

export default function OpportunitiesPage() {
  const { statusGroups, isLoading, updateOpportunityStatus } = useOpportunities();
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeOpportunity, setActiveOpportunity] = useState<Opportunity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    })
  );

  const kanbanColumns: { key: OpportunityStatus; title: string }[] = [
    { key: "상담 전", title: "상담 전" },
    { key: "온보딩", title: "온보딩" },
    { key: "협상", title: "협상" },
    { key: "구매", title: "구매" },
  ];

  // Calculate total value for each column
  const getColumnTotal = (opportunities: Opportunity[]) => {
    return opportunities.reduce((total, opp) => total + opp.value, 0);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    
    setActiveId(id);
    
    // Find the opportunity being dragged
    const opportunity = Object.values(statusGroups)
      .flat()
      .find(opp => opp.id === id);
      
    if (opportunity) {
      setActiveOpportunity(opportunity);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveOpportunity(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the opportunity being dragged
    const activeOpportunity = Object.values(statusGroups)
      .flat()
      .find(opp => opp.id === activeId);
      
    if (!activeOpportunity) return;
    
    // Check if the over element is a column
    const isOverAColumn = kanbanColumns.some(col => col.key === overId);
    
    if (isOverAColumn && activeOpportunity.status !== overId) {
      // Update the opportunity status
      updateOpportunityStatus(activeId, overId as OpportunityStatus);
    }
  };

  return (
    <div 
      className="py-10 min-h-screen" 
      style={{ 
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
        backgroundPosition: '0 0',
      }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8 px-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">잠재고객 관리</h1>
            <p className="text-gray-500 mt-1">잠재고객을 단계별로 관리하고 진행 상황을 추적할 수 있습니다.</p>
          </div>
          <OpportunityDialog mode="create" />
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="grid grid-cols-4 gap-6 px-4">
            {isLoading
              ? kanbanColumns.map((column, index) => (
                  <Card key={index} className="min-h-[80vh] border-0 shadow-lg bg-white bg-opacity-70 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">
                        <Skeleton className="h-6 w-28" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-4">
                        <Skeleton className="h-4 w-full" />
                      </div>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full mb-3" />
                      ))}
                    </CardContent>
                  </Card>
                ))
              : kanbanColumns.map((column) => (
                  <SortableContext key={column.key} items={statusGroups[column.key].map(opp => opp.id)}>
                    <OpportunityColumn
                      title={column.title}
                      status={column.key}
                      opportunities={statusGroups[column.key]}
                      onSelect={setSelectedOpportunityId}
                      count={statusGroups[column.key].length}
                      totalValue={getColumnTotal(statusGroups[column.key])}
                    />
                  </SortableContext>
                ))}
          </div>
          
          <DragOverlay>
            {activeOpportunity && <OpportunityDragOverlay opportunity={activeOpportunity} />}
          </DragOverlay>
        </DndContext>
      </div>

      <OpportunityDrawer
        opportunityId={selectedOpportunityId}
        open={selectedOpportunityId !== null}
        onOpenChange={(open) => !open && setSelectedOpportunityId(null)}
      />
    </div>
  );
} 