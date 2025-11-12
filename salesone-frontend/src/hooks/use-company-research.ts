import { useState } from 'react';
import { CompanyResearch } from '@/types/company-research';

// Mock data for 제로커뮤니케이션
const zeroCommMockData: CompanyResearch = {
  companyName: '제로커뮤니케이션',
  summary: '제로커뮤니케이션(대표 유창해)은 온라인 광고 및 마케팅 대행을 전문으로 하는 중소기업입니다. 다양한 플랫폼(네이버, 쿠팡, 카카오, 토스 등)을 활용한 광고, 바이럴 마케팅, 쇼핑몰 대상 마케팅에 특화되어 있으며, 2021년 설립 이후 빠르게 성장하고 있는 기업입니다.',
  details: {
    representative: '유창해',
    businessNumber: '562-87-02211',
    postalCode: '21330',
    address: '인천광역시 부평구 주부토로 236, 비동 4층 406,407호(갈산동, 인천테크노밸리유1센터)',
    businessType: '영리법인의 본점',
    taxpayerStatus: '계속사업자',
    taxationType: '부가가치세 일반과세자',
    invoiceIssue: '가능',
    commerceRegistration: '2021-인천부평-1711',
    items: '종합몰',
    website: 'zerocommunication.co.kr',
    establishment: '2021년 6월',
    mainBusiness: '광고 대행업, 전자상거래업, 홍보기획 및 제작·대행, 광고물 제작·설치·유통',
    employees: '약 5명',
    revenue: '2024년 기준 약 75억 원',
    otherDetails: '토스애즈 공식 에이전시, 누적 클라이언트 3,071명(2021~2024년), 벤처기업 인증, 4대 보험 등 기업 안정성 확보'
  },
  news: [
    {
      id: '1',
      title: '제로커뮤니케이션-토스애즈, 에이전시 계약체결',
      content: '2024년 5월 제로커뮤니케이션과 토스애즈가 에이전시 계약을 체결했다고 23일 밝혔다. 토스애즈는 토스의 광범위한 빅데이터를 기반으로 이용자의 소비 유형별 타깃 광고가 가능하다. 3,000만 규모의 데일리 PV노출이 가능한 동영상 광고를 시작으로 배너 광고, 라이브 쇼핑, 발송형 광고 \"머니알림\", 리워드 광고 상품 \"행운 퀴즈\", 이번 주 미션 등 유저 친화적인 광고 상품들을 다양한 형태로 서비스 중이다. 제로커뮤니케이션은 2021년 설립해 다양한 온라인 마케팅 서비스를 제공하고 있으며 네이버, 쿠팡, 카카오, N쇼핑라이브, 바이럴 광고 등 주로 온라인 쇼핑물을 대상으로 활동하고 있다. 현재 많은 클라이언트 분들이 함께하여 빠른 성장을 했으며 누적 클라이언트는 2021년부터 2024년까지 약 3071명에 클라이언트들이 함께하고 있다. 제로커뮤니케이션 유창해 대표이사는 \"국내 금융 수퍼앱 중 하나인 토스애즈의 에이전시가 된 만큼 다양한 업종의 광고 대행 경험과 전환 성과 분석을 통해 앞으로 더욱더 클라이언트들이 원하는 부분을 만족시키기 위해 토스애즈 와 긴밀한 협업을 이어가겠다\"고 말했다.',
      date: '2024-05-24',
      source: '대한금융신문',
      url: 'https://www.kbanker.co.kr/news/articleView.html?idxno=214716',
      imageUrl: 'https://cdn.kbanker.co.kr/news/photo/202405/214716_62265_141.jpg'
    }
  ],
  isLoading: false
};

export function useCompanyResearch(companyName: string | null) {
  const [research, setResearch] = useState<CompanyResearch | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startResearch = async () => {
    if (!companyName) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, we only have mock data for 제로커뮤니케이션
      if (companyName.includes('제로커뮤니케이션') || companyName.includes('제로 커뮤니케이션')) {
        setResearch(zeroCommMockData);
      } else {
        // For other companies, return null or create a generic response
        setResearch(null);
      }
    } catch (error) {
      console.error('Error researching company:', error);
      setResearch(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    research,
    isLoading,
    startResearch
  };
} 