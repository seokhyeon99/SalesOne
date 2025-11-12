"use client";

import { CampaignCard } from "@/components/campaigns/campaign-card";
import { Button } from "@/components/ui/button";
import { mockCampaigns } from "@/lib/mock/campaigns";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">캠페인</h1>
          <p className="text-muted-foreground">
            이메일 캠페인을 생성하고 관리하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/campaigns/new">
            <PlusIcon className="w-4 h-4 mr-2" />
            새 캠페인
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCampaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/dashboard/campaigns/${campaign.id}`}
            className="block"
          >
            <CampaignCard campaign={campaign} />
          </Link>
        ))}
      </div>
    </div>
  );
} 