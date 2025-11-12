import useSWR from "swr"
import { fetcher } from "@/lib/utils"

export interface ClientEmail {
  id: string;
  subject: string;
  content: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'opened' | 'clicked';
  sender: {
    id: string;
    email: string;
  };
  recipient: {
    email: string;
    name: string;
  };
  attachments?: {
    id: string;
    name: string;
    size: number;
    url: string;
  }[];
}

// 더미 데이터
const dummyEmails: ClientEmail[] = [
  {
    id: '1',
    subject: '제품 소개 및 견적 안내',
    content: `안녕하세요, 

저희 제품에 관심을 가져주셔서 감사합니다. 
요청하신 제품의 견적서를 첨부하여 보내드립니다.

자세한 사항은 첨부된 파일을 참고해 주시기 바랍니다.

추가 문의사항이 있으시다면 언제든 연락 주시기 바랍니다.

감사합니다.`,
    sent_at: '2024-03-15T09:30:00Z',
    status: 'opened',
    sender: {
      id: '1',
      email: 'sales@salesone.com'
    },
    recipient: {
      email: 'client@company.com',
      name: '김고객'
    },
    attachments: [
      {
        id: '1',
        name: '제품견적서_2024.pdf',
        size: 245000,
        url: '/files/quote.pdf'
      }
    ]
  },
  {
    id: '2',
    subject: '미팅 일정 확인',
    content: `안녕하세요, 김고객님

다음 주 화요일 오후 2시 미팅 일정 확인 부탁드립니다.

아래 링크를 통해 일정을 확인하실 수 있습니다.
[일정 확인하기]

감사합니다.`,
    sent_at: '2024-03-14T15:20:00Z',
    status: 'clicked',
    sender: {
      id: '1',
      email: 'sales@salesone.com'
    },
    recipient: {
      email: 'client@company.com',
      name: '김고객'
    }
  },
  {
    id: '3',
    subject: '계약서 검토 요청',
    content: `안녕하세요,

계약서 초안을 작성하여 보내드립니다.
검토 후 의견 주시면 감사하겠습니다.

첨부된 파일을 확인해 주시기 바랍니다.

감사합니다.`,
    sent_at: '2024-03-13T11:00:00Z',
    status: 'sent',
    sender: {
      id: '1',
      email: 'sales@salesone.com'
    },
    recipient: {
      email: 'client@company.com',
      name: '김고객'
    },
    attachments: [
      {
        id: '2',
        name: '계약서_초안_v1.docx',
        size: 158000,
        url: '/files/contract.docx'
      }
    ]
  }
];

export function useClientEmails(clientId: string) {
  const { data: emails, error, isLoading } = useSWR<ClientEmail[]>(
    `/api/clients/clients/${clientId}/emails`,
    () => Promise.resolve(dummyEmails) // 더미 데이터 반환
  );

  return {
    emails,
    isLoading,
    error,
  };
} 