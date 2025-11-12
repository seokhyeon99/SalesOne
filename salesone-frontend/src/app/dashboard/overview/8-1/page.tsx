import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// 데이터 구조화: 유지보수 및 가독성을 위해 데이터를 분리합니다.
const pricingData = [
  {
    category: '주요 기능',
    features: [
      { name: '월 구독료', free: '무료', beginner: '49,000원', business: '129,000원', enterprise: '399,000원+' },
      { name: '타겟 고객', free: '개인, 일반 사용자', beginner: '1~2인 영업사원', business: '3~10인 영업팀', enterprise: '10인 이상 혁신 기업' },
      { name: '총 사용자 수', free: '1명', beginner: '1명', business: '최대 5명 포함', enterprise: '최대 10명 포함' },
      { name: 'DB 리드 관리', free: '200개', beginner: '1,500개', business: '10,000개', enterprise: '무제한' },
      { name: '월간 이메일 발송', free: '100건', beginner: '1,000건', business: '5,000건', enterprise: '무제한' },
      { name: 'AI 크레딧 제공량', free: '100 /월', beginner: '1,000 /월', business: '5,000 /월', enterprise: '별도 협의' },
    ],
  },
  {
    category: '워크플로우',
    features: [
      { name: '기본 워크플로우', free: true, beginner: true, business: true, enterprise: true },
      { name: '자연어 워크플로우 생성', free: false, beginner: false, business: true, enterprise: true },
      { name: '팀 템플릿 공유', free: false, beginner: false, business: true, enterprise: true },
    ],
  },
  {
    category: 'AI 및 인사이트',
    features: [
      { name: 'AI 기본 컨설팅', free: false, beginner: true, business: true, enterprise: true },
      { name: 'AI 미팅 어시스턴트', free: false, beginner: false, business: true, enterprise: true },
      { name: '집단지성 예측 엔진', free: false, beginner: false, business: false, enterprise: true },
    ],
  },
  {
    category: '지원 및 기타',
    features: [
      { name: '고객 지원', free: '커뮤니티', beginner: '이메일 지원', business: '실시간 채팅 지원', enterprise: '전담 매니저' },
      { name: '외부 서비스 연동 API', free: false, beginner: false, business: false, enterprise: true },
    ],
  },
];

// O/X 또는 텍스트를 렌더링하는 헬퍼 컴포넌트
const FeatureCell = ({ value }: { value: string | boolean }) => {
  if (typeof value === 'boolean') {
    return value ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />;
  }
  return <span className="text-sm">{value}</span>;
};


export default function PricingPage() {
  const plans = ['free', 'beginner', 'business', 'enterprise'] as const;
  
  // 지정 색상
  const primaryColorLight = '#CEE8DC'; // Business 플랜 배경
  const primaryColorMedium = '#A8DBC3'; // Business 플랜 헤더
  const primaryColorDark = '#7DC9A5';   // Business 플랜 CTA 버튼 호버

  return (
    <div className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            귀사의 성장에 맞는 합리적인 플랜을 선택하세요
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            개인 영업사원부터 대규모 팀까지, 필요한 모든 기능을 제공합니다.
          </p>
        </header>

        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <Table className="bg-white dark:bg-gray-800">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[240px] text-base font-semibold text-gray-800 dark:text-gray-100 p-6">기능</TableHead>
                <TableHead className="text-center p-6"><span className="text-base font-semibold">Free</span></TableHead>
                <TableHead className="text-center p-6"><span className="text-base font-semibold">Beginner</span></TableHead>
                <TableHead 
                  className="text-center p-6 text-white relative"
                  style={{ backgroundColor: primaryColorMedium }}
                >
                  <Badge variant="destructive" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white">추천 플랜</Badge>
                  <span className="text-base font-semibold">Business</span>
                </TableHead>
                <TableHead className="text-center p-6"><span className="text-base font-semibold">Enterprise</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingData.map((section) => (
                <React.Fragment key={section.category}>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/60">
                    <TableCell colSpan={5} className="py-3 px-6">
                      <h3 className="font-semibold text-base text-gray-700 dark:text-gray-200">{section.category}</h3>
                    </TableCell>
                  </TableRow>
                  {section.features.map((feature) => (
                    <TableRow key={feature.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <TableCell className="font-medium text-gray-600 dark:text-gray-300 py-4 px-6">{feature.name}</TableCell>
                      {plans.map((plan) => (
                        <TableCell 
                          key={plan}
                          className={`text-center py-4 ${plan === 'business' ? 'font-medium' : ''}`}
                          style={{ backgroundColor: plan === 'business' ? primaryColorLight : 'transparent' }}
                        >
                          <FeatureCell value={feature[plan] as string | boolean} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
              <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-transparent">
                <TableCell className="p-6"></TableCell>
                <TableCell className="text-center p-6">
                  <Button variant="outline" className="w-full">플랜 시작하기</Button>
                </TableCell>
                <TableCell className="text-center p-6">
                  <Button variant="outline" className="w-full">플랜 시작하기</Button>
                </TableCell>
                <TableCell className="text-center p-6" style={{ backgroundColor: primaryColorLight }}>
                   <Button 
                    className="w-full text-white font-bold"
                    style={{ 
                      backgroundColor: primaryColorDark,
                    }}
                   >
                    플랜 시작하기
                  </Button>
                </TableCell>
                <TableCell className="text-center p-6">
                  <Button variant="outline" className="w-full">별도 문의</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
