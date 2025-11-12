"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCampaigns } from "@/lib/mock/campaigns";
import { ArrowLeft, BarChart3, Mail, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaign = mockCampaigns.find((c) => c.id === params.id);

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  const { stats } = campaign;
  const openRate = ((stats.opened / stats.sent) * 100).toFixed(1);
  const clickRate = ((stats.clicked / stats.opened) * 100).toFixed(1);

  const barChartData = [
    {
      name: "발송됨",
      value: stats.sent,
    },
    {
      name: "오픈",
      value: stats.opened,
    },
    {
      name: "클릭",
      value: stats.clicked,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Mail className="w-4 h-4" />
              이메일 발송
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-sm text-muted-foreground">총 {stats.total}개</p>
            <Progress
              value={(stats.sent / stats.total) * 100}
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Users className="w-4 h-4" />
              오픈율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate}%</div>
            <p className="text-sm text-muted-foreground">
              {stats.opened}명이 이메일을 열었습니다
            </p>
            <Progress value={parseFloat(openRate)} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <BarChart3 className="w-4 h-4" />
              클릭율
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clickRate}%</div>
            <p className="text-sm text-muted-foreground">
              {stats.clicked}명이 링크를 클릭했습니다
            </p>
            <Progress value={parseFloat(clickRate)} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">타임라인</TabsTrigger>
              <TabsTrigger value="overview">개요</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={campaign.dailyStats}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="opens"
                      name="오픈"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      name="클릭"
                      stroke="#16a34a"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="overview" className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 