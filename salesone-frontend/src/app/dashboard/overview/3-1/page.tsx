"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  BrainIcon,
  DatabaseIcon,
  TrendingUpIcon,
  FilterIcon,
  TargetIcon,
  BoltIcon,
  ArrowRightIcon,
  BuildingIcon,
  UsersIcon,
  DollarSignIcon,
  NewspaperIcon,
  ContactIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from "lucide-react"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { OrbitingCircles } from "@/components/magicui/orbiting-circles"
import { useRef } from "react"

// Mock data for the infographic
const aiCollectionSteps = [
  {
    icon: DatabaseIcon,
    title: "데이터 수집",
    description: "5백만+ 기업 데이터베이스에서 실시간 정보 수집",
    metrics: "99.8% 정확도",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: BrainIcon,
    title: "AI 분석",
    description: "머신러닝을 통한 패턴 분석 및 인사이트 생성",
    metrics: "< 3초 처리",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: TargetIcon,
    title: "기회 점수 산출",
    description: "전환 가능성 및 우선순위 점수 자동 계산",
    metrics: "85% 예측 정확도",
    color: "bg-green-100 text-green-600"
  },
  {
    icon: FilterIcon,
    title: "ICP 필터링",
    description: "이상 고객 프로필 기준으로 자동 분류",
    metrics: "78% 매칭률",
    color: "bg-orange-100 text-orange-600"
  }
]

const dataCollectionTypes = [
  { icon: BuildingIcon, label: "기업 정보", value: 95 },
  { icon: UsersIcon, label: "직원 수", value: 88 },
  { icon: DollarSignIcon, label: "매출 데이터", value: 82 },
  { icon: NewspaperIcon, label: "최근 뉴스", value: 75 },
  { icon: ContactIcon, label: "핵심 연락처", value: 90 },
  { icon: ActivityIcon, label: "영업 신호", value: 93 }
]

const opportunityScores = [
  { company: "㈜테크이노베이션", score: 92, probability: 85, status: "고확률" },
  { company: "디지털솔루션스", score: 87, probability: 78, status: "중상" },
  { company: "그린에너지코리아", score: 75, probability: 65, status: "중간" },
  { company: "스마트팩토리", score: 68, probability: 58, status: "저중" }
]

const WorkflowStep = ({ step, index, isLast }: { step: any, index: number, isLast: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const fromRef = useRef<HTMLDivElement>(null)
  const toRef = useRef<HTMLDivElement>(null)

  return (
    <div className="relative">
      <div ref={containerRef} className="flex items-center gap-4">
        <div ref={fromRef} className={`relative p-4 rounded-xl ${step.color} shadow-lg`}>
          <step.icon className="h-8 w-8" />
          
          {/* Orbiting circles for the AI brain step */}
          {index === 1 && (
            <OrbitingCircles
              className="size-[30px] border-none bg-transparent"
              duration={20}
              delay={20}
              radius={50}
            >
              <BoltIcon className="size-3 text-purple-500" />
            </OrbitingCircles>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <Badge variant="secondary" className="text-xs">
              {step.metrics}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
        
        {!isLast && (
          <div ref={toRef} className="p-2">
            <ArrowRightIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* Animated beam between steps */}
      {!isLast && containerRef.current && fromRef.current && toRef.current && (
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={fromRef}
          toRef={toRef}
          className="opacity-60"
        />
      )}
    </div>
  )
}

const DataCollectionItem = ({ item }: { item: any }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
    <div className="p-2 rounded-lg bg-primary/10">
      <item.icon className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{item.label}</span>
        <span className="text-xs text-muted-foreground">{item.value}%</span>
      </div>
      <Progress value={item.value} className="h-1.5" />
    </div>
  </div>
)

const OpportunityCard = ({ opportunity }: { opportunity: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "고확률": return "bg-green-100 text-green-700"
      case "중상": return "bg-blue-100 text-blue-700"
      case "중간": return "bg-yellow-100 text-yellow-700"
      case "저중": return "bg-gray-100 text-gray-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{opportunity.company}</h4>
        <Badge className={getStatusColor(opportunity.status)}>
          {opportunity.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>기회 점수</span>
          <div className="flex items-center gap-2">
            <NumberTicker value={opportunity.score} />
            <span>/100</span>
          </div>
        </div>
        <Progress value={opportunity.score} className="h-2" />
        
        <div className="flex items-center justify-between text-sm">
          <span>전환 확률</span>
          <div className="flex items-center gap-2">
            <NumberTicker value={opportunity.probability} />
            <span>%</span>
          </div>
        </div>
        <Progress value={opportunity.probability} className="h-2" />
      </div>
    </div>
  )
}

export default function AiWorkflowInfographic() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI 기반 리드 분석 워크플로우
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          인공지능이 5백만+ 기업 데이터를 실시간으로 분석하여 최적의 영업 기회를 발견합니다
        </p>
      </div>

      {/* Main Workflow */}
      <Card className="p-6">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <BrainIcon className="h-6 w-6 text-purple-600" />
            AI 분석 프로세스
          </CardTitle>
          <CardDescription>
            데이터 수집부터 기회 점수 산출까지 자동화된 AI 워크플로우
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {aiCollectionSteps.map((step, index) => (
              <WorkflowStep 
                key={index} 
                step={step} 
                index={index} 
                isLast={index === aiCollectionSteps.length - 1} 
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Collection Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseIcon className="h-5 w-5 text-blue-600" />
              데이터 수집 현황
            </CardTitle>
            <CardDescription>
              AI가 수집하는 기업 정보 유형별 정확도
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dataCollectionTypes.map((item, index) => (
                <DataCollectionItem key={index} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5 text-green-600" />
              기회 점수 대시보드
            </CardTitle>
            <CardDescription>
              AI가 분석한 잠재고객별 전환 가능성
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunityScores.map((opportunity, index) => (
                <OpportunityCard key={index} opportunity={opportunity} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ICP Filtering Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-orange-600" />
            ICP 필터링 & 우선순위 설정
          </CardTitle>
          <CardDescription>
            이상 고객 프로필(ICP) 기준으로 자동 분류 및 우선순위 설정
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">고확률 (90%+)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm">매출 10억+ 기업</span>
                  </div>
                  <NumberTicker value={847} className="text-sm font-medium" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm">직원 50명+ 규모</span>
                  </div>
                  <NumberTicker value={623} className="text-sm font-medium" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600">중확률 (60-89%)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <BarChart3Icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">성장 산업군</span>
                  </div>
                  <NumberTicker value={1205} className="text-sm font-medium" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">확장 단계</span>
                  </div>
                  <NumberTicker value={892} className="text-sm font-medium" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-orange-600">저확률 (60% 이하)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">소규모 기업</span>
                  </div>
                  <NumberTicker value={2341} className="text-sm font-medium" />
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">정체 산업군</span>
                  </div>
                  <NumberTicker value={1587} className="text-sm font-medium" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="text-center p-6">
          <div className="space-y-2">
            <DatabaseIcon className="h-8 w-8 mx-auto text-blue-600" />
            <div className="text-2xl font-bold">
              <NumberTicker value={5234000} />
            </div>
            <p className="text-sm text-muted-foreground">총 기업 데이터</p>
          </div>
        </Card>
        
        <Card className="text-center p-6">
          <div className="space-y-2">
            <BrainIcon className="h-8 w-8 mx-auto text-purple-600" />
            <div className="text-2xl font-bold">
              <NumberTicker value={99.8} />%
            </div>
            <p className="text-sm text-muted-foreground">AI 분석 정확도</p>
          </div>
        </Card>
        
        <Card className="text-center p-6">
          <div className="space-y-2">
            <TargetIcon className="h-8 w-8 mx-auto text-green-600" />
            <div className="text-2xl font-bold">
              <NumberTicker value={85} />%
            </div>
            <p className="text-sm text-muted-foreground">전환 예측 정확도</p>
          </div>
        </Card>
        
        <Card className="text-center p-6">
          <div className="space-y-2">
            <BoltIcon className="h-8 w-8 mx-auto text-yellow-600" />
            <div className="text-2xl font-bold">
              &lt;<NumberTicker value={3} />초
            </div>
            <p className="text-sm text-muted-foreground">실시간 분석 속도</p>
          </div>
        </Card>
      </div>
    </div>
  )
} 