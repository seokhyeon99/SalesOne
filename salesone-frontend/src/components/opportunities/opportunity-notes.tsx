"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface OpportunityNotesProps {
  opportunityId: string;
}

export function OpportunityNotes({ opportunityId }: OpportunityNotesProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">노트</h3>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          노트 추가
        </Button>
      </div>
      <div className="text-muted-foreground text-sm">
        이 잠재고객에 대한 노트가 여기에 표시됩니다.
      </div>
    </Card>
  );
} 