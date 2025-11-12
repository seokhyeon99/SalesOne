"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Database, 
  Brain, 
  TrendingUp, 
  Star, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  Users,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Search,
  Zap,
  Target,
  ArrowRight,
  Eye,
  Clock,
  Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sample company data for the infographic
const exampleCompanies = [
  {
    id: 1,
    name: "대동고려삼",
    category: "건강기능식품",
    score: 92,
    rating: "높음",
    color: "bg-green-500",
    website: "ddkorea.com",
    revenue: "120억원",
    employees: "85명",
    onlinePresence: "강함",
    digitalReadiness: "높음",
    reasoning: [
      "기존 온라인 스토어 운영 중",
      "건강기능식품 시장 성장세",
      "네이버 쇼핑 진출 이력",
      "브랜드 인지도 높음",
      "타겟 고객층 명확"
    ],
    evidence: {
      websiteTraffic: "월 45만 방문자",
      socialMedia: "네이버 블로그 활성화",
      competition: "중간 경쟁도",
      searchVolume: "월 12,000회",
      conversionPotential: "높음"
    }
  },
  {
    id: 2,
    name: "GNM자연의품격",
    category: "건강 및 웰니스",
    score: 78,
    rating: "중간",
    color: "bg-yellow-500",
    website: "gnmkorea.co.kr",
    revenue: "85억원",
    employees: "62명",
    onlinePresence: "보통",
    digitalReadiness: "중간",
    reasoning: [
      "400여개 PB 브랜드 보유",
      "건강 플랫폼 운영",
      "디지털 전환 필요",
      "시장 잠재력 높음",
      "투자 의향 있음"
    ],
    evidence: {
      websiteTraffic: "월 28만 방문자",
      socialMedia: "SNS 활동 부족",
      competition: "높은 경쟁도",
      searchVolume: "월 8,500회",
      conversionPotential: "중간"
    }
  },
  {
    id: 3,
    name: "행남자기",
    category: "전통 공예품",
    score: 45,
    rating: "낮음",
    color: "bg-red-500",
    website: "hangnampottery.com",
    revenue: "32억원",
    employees: "24명",
    onlinePresence: "약함",
    digitalReadiness: "낮음",
    reasoning: [
      "디지털 경험 부족",
      "전통적 고객층",
      "온라인 매출 비중 낮음",
      "네이버 쇼핑 미진출",
      "디지털 투자 소극적"
    ],
    evidence: {
      websiteTraffic: "월 3,200 방문자",
      socialMedia: "거의 없음",
      competition: "낮은 경쟁도",
      searchVolume: "월 890회",
      conversionPotential: "낮음"
    }
  }
]

const dataCollectionSteps = [
  {
    icon: Globe,
    title: "웹사이트 분석",
    description: "기업 웹사이트 구조, 성능, SEO 상태 분석",
    details: ["페이지 로딩 속도", "모바일 반응성", "SEO 최적화 수준", "사용자 경험"]
  },
  {
    icon: Search,
    title: "검색 동향 분석",
    description: "네이버 검색량, 키워드 트렌드 분석",
    details: ["브랜드 검색량", "상품 관련 키워드", "계절성 트렌드", "경쟁사 분석"]
  },
  {
    icon: ShoppingCart,
    title: "이커머스 데이터",
    description: "온라인 쇼핑몰 현황 및 매출 추정",
    details: ["온라인 매출 비중", "상품 카테고리", "가격대 분석", "배송 인프라"]
  },
  {
    icon: Users,
    title: "소셜미디어 활동",
    description: "SNS 활동, 고객 참여도 분석",
    details: ["팔로워 수", "포스팅 빈도", "참여율", "브랜드 언급량"]
  }
]

const analysisFactors = [
  {
    name: "디지털 준비도",
    weight: 25,
    description: "온라인 인프라 및 디지털 역량"
  },
  {
    name: "시장 잠재력",
    weight: 20,
    description: "업종별 성장성 및 시장 규모"
  },
  {
    name: "경쟁 환경",
    weight: 20,
    description: "경쟁사 현황 및 시장 포화도"
  },
  {
    name: "고객 도달성",
    weight: 15,
    description: "타겟 고객의 온라인 활동 패턴"
  },
  {
    name: "예산 추정",
    weight: 10,
    description: "광고 예산 규모 및 투자 의향"
  },
  {
    name: "전환 가능성",
    weight: 10,
    description: "네이버 CPC 광고 성과 예측"
  }
]

export default function AIOpportunityScoringPage() {
  const [selectedCompany, setSelectedCompany] = useState(exampleCompanies[0])
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">AI 기반 영업 기회 분석</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          SalesOne의 AI 에이전트가 수집한 기업 데이터를 분석하여 
          네이버 CPC 광고 영업 기회를 자동으로 점수화합니다
        </p>
      </div>

      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" style={{ color: "#7DC9A5" }} />
            AI 분석 워크플로우
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {["데이터 수집", "AI 분석", "점수 산출", "기회 도출"].map((step, index) => (
              <div key={index} className="text-center">
                <div 
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
                    index <= activeStep ? "text-white" : "bg-gray-100 text-gray-400"
                  )}
                  style={{ backgroundColor: index <= activeStep ? "#7DC9A5" : undefined }}
                >
                  {index + 1}
                </div>
                <h3 className="font-medium mb-1">{step}</h3>
                <p className="text-sm text-gray-500">
                  {index === 0 && "다양한 소스에서 기업 정보 수집"}
                  {index === 1 && "AI가 수집된 데이터를 종합 분석"}
                  {index === 2 && "영업 기회 점수 자동 계산"}
                  {index === 3 && "맞춤형 영업 전략 제안"}
                </p>
                {index < 3 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-auto mt-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="collection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collection">데이터 수집</TabsTrigger>
          <TabsTrigger value="analysis">AI 분석</TabsTrigger>
          <TabsTrigger value="results">결과 예시</TabsTrigger>
        </TabsList>

        {/* Data Collection Tab */}
        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" style={{ color: "#A8DBC3" }} />
                자동 데이터 수집 과정
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dataCollectionSteps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="h-6 w-6" style={{ color: "#7DC9A5" }} />
                        <h3 className="font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{step.description}</p>
                      <ul className="space-y-1">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="text-sm text-gray-500 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle>실시간 데이터 소스</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "네이버 비즈니스", status: "연결됨", color: "text-green-600" },
                  { name: "공시정보", status: "연결됨", color: "text-green-600" },
                  { name: "소셜미디어", status: "분석중", color: "text-yellow-600" },
                  { name: "뉴스/언론", status: "연결됨", color: "text-green-600" },
                ].map((source, index) => (
                  <div key={index} className="p-3 border rounded text-center">
                    <div className="text-sm font-medium">{source.name}</div>
                    <div className={cn("text-xs", source.color)}>{source.status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" style={{ color: "#A8DBC3" }} />
                AI 분석 알고리즘
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{factor.name}</div>
                      <div className="text-sm text-gray-500">{factor.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{factor.weight}%</div>
                      <Progress value={factor.weight} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" style={{ color: "#7DC9A5" }} />
                AI 인사이트 생성
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#CEE8DC" }}>
                  <TrendingUp className="h-6 w-6 mb-2" style={{ color: "#7DC9A5" }} />
                  <h3 className="font-semibold mb-1">시장 트렌드 분석</h3>
                  <p className="text-sm">업종별 성장률, 계절성, 경쟁 현황 종합 분석</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#CEE8DC" }}>
                  <Target className="h-6 w-6 mb-2" style={{ color: "#7DC9A5" }} />
                  <h3 className="font-semibold mb-1">타겟팅 최적화</h3>
                  <p className="text-sm">고객 행동 패턴 기반 최적 타겟 그룹 식별</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: "#CEE8DC" }}>
                  <DollarSign className="h-6 w-6 mb-2" style={{ color: "#7DC9A5" }} />
                  <h3 className="font-semibold mb-1">ROI 예측</h3>
                  <p className="text-sm">광고 투자 대비 예상 수익률 계산</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {/* Company Examples */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {exampleCompanies.map((company) => (
              <Card 
                key={company.id} 
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  selectedCompany.id === company.id ? "ring-2 ring-blue-500" : "hover:shadow-md"
                )}
                onClick={() => setSelectedCompany(company)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <Badge variant="secondary">{company.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", company.color)}></div>
                    <span className="text-sm font-medium">기회도: {company.rating}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{company.score}/100</span>
                      <Progress value={company.score} className="flex-1 ml-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>매출: {company.revenue}</div>
                      <div>직원: {company.employees}</div>
                      <div>온라인: {company.onlinePresence}</div>
                      <div>디지털: {company.digitalReadiness}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analysis of Selected Company */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" style={{ color: "#A8DBC3" }} />
                {selectedCompany.name} 상세 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scoring Rationale */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" style={{ color: "#7DC9A5" }} />
                    점수 산출 근거
                  </h3>
                  <ul className="space-y-2">
                    {selectedCompany.reasoning.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4" style={{ color: "#7DC9A5" }} />
                    실증 데이터
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(selectedCompany.evidence).map(([key, value], index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">
                          {key === 'websiteTraffic' && '웹사이트 트래픽'}
                          {key === 'socialMedia' && '소셜미디어'}
                          {key === 'competition' && '경쟁 강도'}
                          {key === 'searchVolume' && '검색량'}
                          {key === 'conversionPotential' && '전환 가능성'}
                        </span>
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "#CEE8DC" }}>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" style={{ color: "#7DC9A5" }} />
                  추천 액션
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCompany.score >= 80 && (
                    <>
                      <div className="text-sm">• 즉시 컨택 및 미팅 제안</div>
                      <div className="text-sm">• 네이버 쇼핑 진출 전략 프레젠테이션</div>
                      <div className="text-sm">• 맞춤형 광고 예산 제안서 작성</div>
                      <div className="text-sm">• 성공 사례 기반 ROI 시뮬레이션</div>
                    </>
                  )}
                  {selectedCompany.score >= 60 && selectedCompany.score < 80 && (
                    <>
                      <div className="text-sm">• 디지털 전환 필요성 교육</div>
                      <div className="text-sm">• 작은 규모 파일럿 프로젝트 제안</div>
                      <div className="text-sm">• 경쟁사 성공 사례 공유</div>
                      <div className="text-sm">• 단계적 접근 전략 수립</div>
                    </>
                  )}
                  {selectedCompany.score < 60 && (
                    <>
                      <div className="text-sm">• 장기적 관계 구축 전략</div>
                      <div className="text-sm">• 디지털 마케팅 교육 세미나 초대</div>
                      <div className="text-sm">• 업계 트렌드 정보 정기 제공</div>
                      <div className="text-sm">• 기본 디지털 인프라 구축 지원</div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" style={{ color: "#A8DBC3" }} />
                AI 분석 성과 지표
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "#CEE8DC" }}>
                  <div className="text-2xl font-bold" style={{ color: "#7DC9A5" }}>87%</div>
                  <div className="text-sm text-gray-600">예측 정확도</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "#CEE8DC" }}>
                  <div className="text-2xl font-bold" style={{ color: "#7DC9A5" }}>3.2배</div>
                  <div className="text-sm text-gray-600">전환율 개선</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "#CEE8DC" }}>
                  <div className="text-2xl font-bold" style={{ color: "#7DC9A5" }}>65%</div>
                  <div className="text-sm text-gray-600">시간 절약</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "#CEE8DC" }}>
                  <div className="text-2xl font-bold" style={{ color: "#7DC9A5" }}>2.1배</div>
                  <div className="text-sm text-gray-600">매출 증대</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card>
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">AI 영업 기회 분석으로 성과를 극대화하세요</h2>
          <p className="text-gray-600 mb-4">
            SalesOne의 AI 에이전트가 24시간 시장을 모니터링하여 
            최적의 영업 기회를 찾아드립니다
          </p>
          <Button size="lg" style={{ backgroundColor: "#7DC9A5" }}>
            <Clock className="h-4 w-4 mr-2" />
            무료 AI 분석 체험하기
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 