import { useState, useEffect } from 'react';
import { Opportunity, OpportunityStatus } from '@/types/opportunity';

// Mock data
const mockOpportunities: Opportunity[] = [
  {
    id: '0',
    name: '온라인 마케팅 서비스 제안',
    company: '제로커뮤니케이션',
    contactName: '유창해',
    contactEmail: 'info@zerocommunication.co.kr',
    contactPhone: '032-123-4567',
    value: 45000000,
    status: '상담 전',
    description: '온라인 마케팅 및 광고 대행 서비스 제안. 네이버, 쿠팡, 카카오 등 다양한 플랫폼 활용 가능.',
    createdAt: '2024-05-25T09:00:00Z',
    updatedAt: '2024-05-25T09:00:00Z',
  },
  {
    id: '1',
    name: '클라우드 서비스 도입',
    company: '네오텍 솔루션',
    contactName: '김민수',
    contactEmail: 'minsu.kim@neotechsolutions.kr',
    contactPhone: '010-1234-5678',
    value: 15000000,
    status: '상담 전',
    description: '클라우드 서비스 도입을 위한 컨설팅 요청',
    createdAt: '2023-12-15T09:30:00Z',
    updatedAt: '2023-12-15T09:30:00Z',
  },
  {
    id: '2',
    name: '데이터 분석 솔루션',
    company: '디지털 인사이트',
    contactName: '박지영',
    contactEmail: 'jiyoung.park@digitalinsight.co.kr',
    contactPhone: '010-2345-6789',
    value: 25000000,
    status: '온보딩',
    description: '고객 데이터 분석을 위한 맞춤형 솔루션 구축',
    createdAt: '2023-12-10T14:00:00Z',
    updatedAt: '2023-12-14T11:45:00Z',
  },
  {
    id: '3',
    name: '보안 시스템 업그레이드',
    company: '세이프가드 코리아',
    contactName: '이준호',
    contactEmail: 'junho.lee@safeguard.kr',
    contactPhone: '010-3456-7890',
    value: 12000000,
    status: '협상',
    description: '기존 보안 시스템 업그레이드 및 추가 보안 솔루션 도입',
    createdAt: '2023-12-05T10:15:00Z',
    updatedAt: '2023-12-13T16:20:00Z',
  },
  {
    id: '4',
    name: '디지털 마케팅 프로젝트',
    company: '브랜드업',
    contactName: '최서연',
    contactEmail: 'seoyeon.choi@brandup.co.kr',
    contactPhone: '010-4567-8901',
    value: 8000000,
    status: '구매',
    description: '온라인 마케팅 캠페인 기획 및 실행',
    createdAt: '2023-12-01T11:00:00Z',
    updatedAt: '2023-12-12T14:30:00Z',
  },
  {
    id: '5',
    name: 'ERP 시스템 구축',
    company: '스마트비즈',
    contactName: '정도현',
    contactEmail: 'dohyun.jung@smartbiz.co.kr',
    contactPhone: '010-5678-9012',
    value: 35000000,
    status: '온보딩',
    description: '기업 전체 업무 프로세스 통합을 위한 ERP 시스템 구축',
    createdAt: '2023-12-08T13:45:00Z',
    updatedAt: '2023-12-11T09:10:00Z',
  },
  {
    id: '6',
    name: '모바일 앱 개발',
    company: '테크모바일',
    contactName: '한소희',
    contactEmail: 'sohee.han@techmobile.kr',
    contactPhone: '010-6789-0123',
    value: 18000000,
    status: '상담 전',
    description: '회사 서비스용 모바일 애플리케이션 개발',
    createdAt: '2023-12-14T15:30:00Z',
    updatedAt: '2023-12-14T15:30:00Z',
  },
  {
    id: '7',
    name: '웹사이트 리뉴얼',
    company: '디자인허브',
    contactName: '임재현',
    contactEmail: 'jaehyun.lim@designhub.co.kr',
    contactPhone: '010-7890-1234',
    value: 10000000,
    status: '협상',
    description: '기업 웹사이트 디자인 및 기능 개선',
    createdAt: '2023-12-07T09:00:00Z',
    updatedAt: '2023-12-10T13:15:00Z',
  },
  {
    id: '8',
    name: '인공지능 솔루션',
    company: 'AI테크',
    contactName: '송민아',
    contactEmail: 'mina.song@aitech.kr',
    contactPhone: '010-8901-2345',
    value: 40000000,
    status: '상담 전',
    description: '비즈니스 프로세스 자동화를 위한 AI 솔루션 도입',
    createdAt: '2023-12-13T11:20:00Z',
    updatedAt: '2023-12-13T11:20:00Z',
  },
  {
    id: '9',
    name: '클라우드 마이그레이션',
    company: '클라우드원',
    contactName: '권혁준',
    contactEmail: 'hyukjoon.kwon@cloudone.kr',
    contactPhone: '010-9012-3456',
    value: 30000000,
    status: '구매',
    description: '온프레미스 시스템에서 클라우드로의 마이그레이션',
    createdAt: '2023-11-30T10:00:00Z',
    updatedAt: '2023-12-09T16:45:00Z',
  }
];

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call with mock data
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 500));
        setOpportunities(mockOpportunities);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  // Update opportunity status
  const updateOpportunityStatus = (id: string, newStatus: OpportunityStatus) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === id 
          ? { ...opp, status: newStatus, updatedAt: new Date().toISOString() } 
          : opp
      )
    );
  };

  // Group opportunities by status
  const groupedOpportunities = opportunities.reduce((acc, opportunity) => {
    const status = opportunity.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(opportunity);
    return acc;
  }, {} as Record<OpportunityStatus, Opportunity[]>);

  // Ensure all status groups exist even if empty
  const statusGroups: Record<OpportunityStatus, Opportunity[]> = {
    '상담 전': groupedOpportunities['상담 전'] || [],
    '온보딩': groupedOpportunities['온보딩'] || [],
    '협상': groupedOpportunities['협상'] || [],
    '구매': groupedOpportunities['구매'] || [],
  };

  const getOpportunityById = (id: string) => {
    return opportunities.find(opportunity => opportunity.id === id) || null;
  };

  return {
    opportunities,
    isLoading,
    statusGroups,
    getOpportunityById,
    updateOpportunityStatus,
  };
}

export function useOpportunity(id: string | null) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setOpportunity(null);
      setIsLoading(false);
      return;
    }

    const loadOpportunity = async () => {
      try {
        setIsLoading(true);
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 300));
        const foundOpportunity = mockOpportunities.find(opp => opp.id === id) || null;
        setOpportunity(foundOpportunity);
      } catch (error) {
        console.error(`Failed to load opportunity with id ${id}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunity();
  }, [id]);

  return {
    opportunity,
    isLoading,
  };
} 