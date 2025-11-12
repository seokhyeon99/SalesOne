import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Newspaper, Lightbulb, Target, TrendingUp, XCircle, CheckCircle, MinusCircle, Building, Factory, ShoppingBag } from "lucide-react";

// AI 에이전트가 분석한 기업 데이터 예시
const companies = [
  {
    name: "아모레퍼시픽",
    logo: "https://images.unsplash.com/photo-1620786236988-3a05a2a29363?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    industry: "화장품 및 미용",
    icon: <ShoppingBag className="w-4 h-4" />,
    opportunityScore: 92,
    scoreColor: "bg-green-100 text-green-800",
    signals: [
      "신제품 '타임 레스폰스' 라인 런칭, 대규모 마케팅 캠페인 예상",
      "인플루언서 협업 콘텐츠 다수 생성, 관련 검색량 증가",
      "공식 온라인몰 프로모션 활발, 직접 판매(D2C) 강화 의지 확인",
    ],
    analysis: [
      { text: "경쟁이 치열한 화장품 시장으로, 신제품 홍보를 위한 즉각적인 광고 니즈가 매우 높음.[4]", status: "positive" },
      { text: "네이버 쇼핑은 화장품 카테고리의 주요 판매 채널 중 하나임.[3]", status: "positive" },
      { text: "자사몰 트래픽 유도를 위한 '쇼핑몰 상품형' CPC 광고 효율이 높을 것으로 기대됨.[1]", status: "positive" },
    ],
    recommendation: "네이버 '쇼핑 브랜드형' 및 '쇼핑몰 상품형' 광고를 즉시 제안하여 초기 시장 선점 지원 전략 제시.",
    statusIcon: <CheckCircle className="w-8 h-8 text-green-500" />
  },
  {
    name: "한샘",
    logo: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    industry: "가구 및 인테리어",
    icon: <Building className="w-4 h-4" />,
    opportunityScore: 58,
    scoreColor: "bg-yellow-100 text-yellow-800",
    signals: [
      "수도권 대형 플래그십 스토어 오픈, '오프라인 경험' 강화에 집중",
      "온라인몰 리뉴얼 완료했으나, 주요 마케팅은 오프라인 매장 연계 이벤트",
      "계절별 인테리어 기획전 진행, 특정 키워드에 대한 광고 집행 가능성 존재",
    ],
    analysis: [
      { text: "가구/인테리어는 고관여 제품으로, 온라인 클릭이 즉시 구매로 이어질 확률이 상대적으로 낮음.", status: "neutral" },
      { text: "주요 마케팅 예산이 오프라인 경험 강화에 집중되어 있어 온라인 CPC 광고 비중이 낮을 수 있음.", status: "neutral" },
      { text: "네이버 쇼핑 카탈로그형 광고는 가능하나, 전환율 예측이 어려워 소극적일 가능성.[3]", status: "negative" },
    ],
    recommendation: "브랜드 인지도 유지를 위한 최소한의 '브랜드 검색'을 제안하되, CPC 효율보다는 장기적 관점의 파트너십으로 접근.",
    statusIcon: <MinusCircle className="w-8 h-8 text-yellow-500" />
  },
  {
    name: "포스코",
    logo: "https://images.unsplash.com/photo-1665697444583-659e94262cc2?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    industry: "철강 제조 (B2B)",
    icon: <Factory className="w-4 h-4" />,
    opportunityScore: 5,
    scoreColor: "bg-red-100 text-red-800",
    signals: [
      "차세대 친환경 제강 기술 개발에 대규모 투자 발표",
      "해외 플랜트 수주 관련 뉴스 다수",
      "주요 활동이 기업 간 거래(B2B) 및 정부 파트너십에 집중",
    ],
    analysis: [
      { text: "주력 사업이 B2B 철강으로, 일반 소비자를 대상으로 한 온라인 상품 판매가 없음.", status: "negative" },
      { text: "네이버 쇼핑 광고의 타겟 고객과 전혀 무관함.[1]", status: "negative" },
      { text: "CPC 광고를 통한 사업적 이익 발생 가능성이 없음.", status: "negative" },
    ],
    recommendation: "광고 제안 대상 아님. 영업 리소스 투입 불필요.",
    statusIcon: <XCircle className="w-8 h-8 text-red-500" />
  },
];

const AnalysisItem = ({ text, status }: { text: string; status: 'positive' | 'neutral' | 'negative' }) => {
  const Icon = status === 'positive' ? CheckCircle : status === 'neutral' ? MinusCircle : XCircle;
  const color = status === 'positive' ? 'text-green-600' : status === 'neutral' ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <li className="flex items-start gap-3">
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
      <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
    </li>
  );
};


export default function SalesOpportunityPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-lg mb-4">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            AI 에이전트 기반 영업 기회 분석
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            네이버 쇼핑 CPC 광고주 발굴을 위해 AI가 실시간 데이터를 분석하여 잠재 고객의 '기회 점수'를 도출합니다.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company) => (
            <Card key={company.name} className="flex flex-col transform hover:scale-105 transition-transform duration-300 dark:bg-gray-800/50 shadow-lg hover:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={company.logo} alt={`${company.name} logo`} />
                    <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-bold">{company.name}</CardTitle>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1 mt-1">
                      {company.icon}
                      <span>{company.industry}</span>
                    </div>
                  </div>
                </div>
                 <Badge className={`text-lg font-bold px-3 py-1 ${company.scoreColor}`}>
                  {company.opportunityScore}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="space-y-4 flex-grow">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-primary" />
                      최신 뉴스 / 영업 시그널
                    </h4>
                    <ul className="space-y-1.5 pl-4">
                      {company.signals.map((signal, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-300 list-disc list-outside">
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      AI 분석 및 기회 점수 근거
                    </h4>
                    <ul className="space-y-3">
                      {company.analysis.map((item, index) => (
                         <AnalysisItem key={index} text={item.text} status={item.status as 'positive' | 'neutral' | 'negative'} />
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                   <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      영업 전략 제안
                    </h4>
                  <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 p-3 rounded-md">
                    {company.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>이 인포그래픽은 AI 에이전트의 데이터 기반 분석 예시입니다.</p>
          <p>기회 점수는 실시간 뉴스, 기업 활동, 시장 트렌드를 종합하여 동적으로 계산됩니다.[5][7]</p>
        </footer>
      </div>
    </div>
  );
}
