import { useState, useEffect } from 'react';
import { OpportunityNote } from '@/types/opportunity-details';

// Mock notes data
const generateMockNotesData = (opportunityId: string): OpportunityNote[] => [
  {
    id: '1',
    title: '초기 미팅 노트',
    content: '고객사 CTO와 첫 미팅을 진행함. 현재 사용 중인 시스템의 문제점과 요구사항에 대해 논의했으며, 우리 제품에 대한 관심이 높았음. 기술적인 부분에 대해 추가 자료 요청함.',
    opportunity: opportunityId,
    created_at: '2023-12-10T10:30:00Z',
    user: {
      id: '101',
      email: 'kim.yongsu@salesone.com',
    }
  },
  {
    id: '2',
    title: '요구사항 분석',
    content: '고객의 주요 요구사항:\n1. 실시간 데이터 동기화\n2. 모바일 대응\n3. 레거시 시스템과의 통합\n4. 맞춤형 대시보드\n\n기존 솔루션으로 1,2,4번 요구사항은 충족 가능하며, 3번은 추가 개발이 필요함.',
    opportunity: opportunityId,
    created_at: '2023-12-15T14:45:00Z',
    user: {
      id: '102',
      email: 'park.jieun@salesone.com',
    }
  },
  {
    id: '3',
    title: '가격 협상 회의',
    content: '고객사 구매 담당자와 가격 협상 진행. 초기 제안 금액에서 10% 할인을 요청했으며, 대신 계약 기간을 2년으로 연장하는 방안을 제안함. 추가 내부 논의 필요.',
    opportunity: opportunityId,
    created_at: '2023-12-20T16:00:00Z',
    user: {
      id: '103',
      email: 'lee.hyunwoo@salesone.com',
    }
  }
];

export function useOpportunityNotes(opportunityId: string | null) {
  const [notes, setNotes] = useState<OpportunityNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    const loadNotes = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set mock data
        const mockData = generateMockNotesData(opportunityId);
        setNotes(mockData);
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [opportunityId]);

  // Function to create a new note
  const createNote = (title: string, content: string) => {
    if (!opportunityId) return;
    
    const newNote: OpportunityNote = {
      id: `new-${Date.now()}`,
      title,
      content,
      opportunity: opportunityId,
      created_at: new Date().toISOString(),
      user: {
        id: '101', // Mock user ID
        email: 'kim.yongsu@salesone.com', // Mock user email
      }
    };

    setNotes(prev => [...prev, newNote]);
  };

  // Function to delete a note
  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  return {
    notes,
    isLoading,
    createNote,
    deleteNote,
  };
} 