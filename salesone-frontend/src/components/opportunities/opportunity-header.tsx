"use client";

import { Opportunity } from "@/types/opportunity";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, Calendar, CreditCard, Mail, Phone, User } from "lucide-react";

interface OpportunityHeaderProps {
  opportunity: Opportunity;
}

export function OpportunityHeader({ opportunity }: OpportunityHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{opportunity.name}</h2>
            <div className="flex items-center text-muted-foreground mt-1">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>{opportunity.company}</span>
            </div>
          </div>
          <Badge className="ml-2 text-sm px-3 py-1">
            {opportunity.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{opportunity.contactName}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <a href={`mailto:${opportunity.contactEmail}`} className="text-blue-600 hover:underline">
              {opportunity.contactEmail}
            </a>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{opportunity.contactPhone}</span>
          </div>
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{formatCurrency(opportunity.value)}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>생성일: {formatDate(opportunity.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>수정일: {formatDate(opportunity.updatedAt)}</span>
          </div>
        </div>

        {opportunity.description && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">설명</h3>
            <p className="text-sm text-muted-foreground">{opportunity.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 