"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface CampaignCardProps {
  campaign: {
    id: string;
    name: string;
    description: string;
    status: "active" | "completed" | "draft";
    stats: {
      sent: number;
      opened: number;
      clicked: number;
      total: number;
    };
    dailyStats: Array<{
      date: string;
      opens: number;
      clicks: number;
    }>;
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { stats } = campaign;
  const openRate = ((stats.opened / stats.sent) * 100).toFixed(1);
  const clickRate = ((stats.clicked / stats.opened) * 100).toFixed(1);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{campaign.name}</CardTitle>
          <Badge
            variant={
              campaign.status === "active"
                ? "default"
                : campaign.status === "completed"
                ? "secondary"
                : "outline"
            }
          >
            {campaign.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{campaign.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">발송됨</p>
              <p className="text-xl font-medium">{stats.sent}</p>
            </div>
            <div>
              <p className="text-muted-foreground">총 리드</p>
              <p className="text-xl font-medium">{stats.total}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>오픈율</span>
              <span>{openRate}%</span>
            </div>
            <Progress value={parseFloat(openRate)} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>클릭율</span>
              <span>{clickRate}%</span>
            </div>
            <Progress value={parseFloat(clickRate)} className="h-2" />
          </div>
          <div className="h-[100px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={campaign.dailyStats}>
                <XAxis
                  dataKey="date"
                  hide
                  padding={{ left: 10, right: 10 }}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="opens"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 