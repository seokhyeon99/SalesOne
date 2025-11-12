"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { 
  ActivityIcon, 
  BarChart3Icon, 
  BoxIcon, 
  ListIcon, 
  UsersIcon, 
  TrendingUpIcon,
  MailIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from "lucide-react"
import Link from "next/link"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Mock data
const salesData = [
  { month: '1월', sales: 4000, leads: 2400 },
  { month: '2월', sales: 3000, leads: 1398 },
  { month: '3월', sales: 2000, leads: 9800 },
  { month: '4월', sales: 2780, leads: 3908 },
  { month: '5월', sales: 1890, leads: 4800 },
  { month: '6월', sales: 2390, leads: 3800 },
];

const campaignData = [
  { name: '이메일', value: 400 },
  { name: '전화', value: 300 },
  { name: '미팅', value: 300 },
  { name: '소셜', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentActivities = [
  { type: 'email', message: '신규 이메일 캠페인 시작', time: '10분 전', icon: MailIcon },
  { type: 'lead', message: '새로운 리드 5개 추가됨', time: '1시간 전', icon: UsersIcon },
  { type: 'success', message: '거래 성사 - 제로커뮤니케이션 기업', time: '2시간 전', icon: CheckCircleIcon },
  { type: 'alert', message: '미팅 일정 변경 필요', time: '3시간 전', icon: AlertCircleIcon },
];

// Custom heading component
const Heading = ({ title, description }: { title: string, description: string }) => (
  <div>
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground">{description}</p>
  </div>
)

const StatCard = ({ title, value, change, icon: Icon }: { title: string, value: string, change: string, icon: any }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <TrendingUpIcon className="h-3 w-3 text-green-500" />
        {change} 증가
      </p>
    </CardContent>
  </Card>
)

const ActivityItem = ({ activity }: { activity: any }) => {
  const Icon = activity.icon
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="p-2 rounded-full bg-muted">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{activity.message}</p>
        <p className="text-xs text-muted-foreground">{activity.time}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading 
          title="대시보드" 
          description="SalesOne 영업 현황 개요를 확인하세요." 
        />
      </div>
      
      <Separator />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="전체 상품" 
          value="24" 
          change="15%" 
          icon={BoxIcon}
        />
        <StatCard 
          title="총 잠재고객" 
          value="1,234" 
          change="32%" 
          icon={UsersIcon}
        />
        <StatCard 
          title="활성 캠페인" 
          value="12" 
          change="8%" 
          icon={ActivityIcon}
        />
        <StatCard 
          title="완료된 업무" 
          value="89" 
          change="24%" 
          icon={ListIcon}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>영업 & 리드 추이</CardTitle>
            <CardDescription>월별 영업 실적과 리드 획득 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="leads" stroke="#82ca9d" fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>최근 영업 활동 및 알림</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>캠페인 성과</CardTitle>
            <CardDescription>채널별 캠페인 성과 분석</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8884d8" />
                  <Bar dataKey="leads" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>채널 분포</CardTitle>
            <CardDescription>리드 획득 채널 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex flex-col">
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={campaignData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                    >
                      {campaignData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {campaignData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 