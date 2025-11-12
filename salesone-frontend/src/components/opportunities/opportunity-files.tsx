"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface OpportunityFilesProps {
  opportunityId: string;
}

export function OpportunityFiles({ opportunityId }: OpportunityFilesProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">파일</h3>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          파일 업로드
        </Button>
      </div>
      <div className="text-muted-foreground text-sm">
        이 잠재고객과 관련된 파일이 여기에 표시됩니다.
      </div>
    </Card>
  );
} 