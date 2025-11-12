import { useState, useEffect } from 'react';
import { TimelineItem, TimelineItemType } from '@/types/opportunity-details';

// Mock timeline data
const generateMockTimelineData = (opportunityId: string): TimelineItem[] => [
  {
    id: '1',
    type: 'status_change',
    oldStatus: '상담 전',
    newStatus: '온보딩',
    created_at: '2023-12-20T09:30:00Z',
    created_by: '김영수',
    opportunity_id: opportunityId,
  },
  {
    id: '2',
    type: 'note',
    title: '초기 미팅 노트',
    content: '고객사와 첫 미팅을 진행함. 제품에 대한 관심이 높으며, 구현 가능성에 대해 질문이 많았음. 추가 기술 자료 전달 예정.',
    created_at: '2023-12-21T11:00:00Z',
    created_by: '박지은',
    opportunity_id: opportunityId,
  },
  {
    id: '3',
    type: 'file',
    name: '제안서_v1.pdf',
    description: '고객사 맞춤형 제안서 첫 버전',
    created_at: '2023-12-22T14:30:00Z',
    created_by: '이현우',
    opportunity_id: opportunityId,
  },
  {
    id: '4',
    type: 'task',
    title: '고객사 요구사항 분석',
    status: 'completed',
    created_at: '2023-12-23T10:15:00Z',
    created_by: '정민지',
    opportunity_id: opportunityId,
  },
  {
    id: '5',
    type: 'note',
    title: '기술 검토 회의',
    content: '개발팀과 함께 고객 요구사항 기술 검토를 진행함. 모든 요구사항 구현 가능하나 일부 기능은 추가 개발 기간 필요.',
    created_at: '2023-12-24T16:45:00Z',
    created_by: '한승현',
    opportunity_id: opportunityId,
  },
  {
    id: '6',
    type: 'status_change',
    oldStatus: '온보딩',
    newStatus: '협상',
    created_at: '2023-12-26T13:00:00Z',
    created_by: '김영수',
    opportunity_id: opportunityId,
  },
  {
    id: '7',
    type: 'file',
    name: '계약서_초안.docx',
    description: '법무팀 검토 후 계약서 초안',
    created_at: '2023-12-27T11:30:00Z',
    created_by: '최준영',
    opportunity_id: opportunityId,
  },
];

export function useOpportunityTimeline(opportunityId: string | null) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) {
      setTimeline([]);
      setIsLoading(false);
      return;
    }

    const loadTimeline = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set mock data
        const mockData = generateMockTimelineData(opportunityId);
        setTimeline(mockData);
      } catch (error) {
        console.error('Failed to load timeline:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeline();
  }, [opportunityId]);

  return {
    timeline,
    isLoading,
  };
} 