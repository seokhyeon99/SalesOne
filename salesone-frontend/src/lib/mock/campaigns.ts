type CampaignStatus = "active" | "completed" | "draft";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    total: number;
  };
  dailyStats: Array<{
    date: string;
    opens: number;
    clicks: number;
  }>;
}

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "2024 봄 시즌 건강기능식품 프로모션",
    description: "건강기능식품 업체 대상 봄 시즌 프로모션 캠페인",
    status: "active",
    stats: {
      sent: 1872,
      opened: 397,
      clicked: 214,
      total: 2134,
    },
    dailyStats: [
      { date: "03-01", opens: 82, clicks: 43 },
      { date: "03-02", opens: 75, clicks: 39 },
      { date: "03-03", opens: 91, clicks: 52 },
      { date: "03-04", opens: 71, clicks: 37 },
      { date: "03-05", opens: 78, clicks: 43 },
    ],
  },
  {
    id: "2",
    name: "IT 서비스 기업 타겟 캠페인",
    description: "클라우드 서비스 소개 및 데모 신청 캠페인",
    status: "completed",
    stats: {
      sent: 3241,
      opened: 683,
      clicked: 392,
      total: 3567,
    },
    dailyStats: [
      { date: "02-25", opens: 142, clicks: 82 },
      { date: "02-26", opens: 156, clicks: 91 },
      { date: "02-27", opens: 128, clicks: 73 },
      { date: "02-28", opens: 134, clicks: 78 },
      { date: "02-29", opens: 123, clicks: 68 },
    ],
  },
  {
    id: "3",
    name: "스타트업 대상 마케팅 솔루션",
    description: "초기 스타트업을 위한 통합 마케팅 솔루션 소개",
    status: "active",
    stats: {
      sent: 892,
      opened: 187,
      clicked: 108,
      total: 1024,
    },
    dailyStats: [
      { date: "03-01", opens: 42, clicks: 24 },
      { date: "03-02", opens: 38, clicks: 21 },
      { date: "03-03", opens: 35, clicks: 19 },
      { date: "03-04", opens: 37, clicks: 22 },
      { date: "03-05", opens: 35, clicks: 22 },
    ],
  },
  {
    id: "4",
    name: "대기업 구매담당자 타겟 캠페인",
    description: "기업용 솔루션 소개 및 상담 신청 캠페인",
    status: "draft",
    stats: {
      sent: 0,
      opened: 0,
      clicked: 0,
      total: 4231,
    },
    dailyStats: [],
  },
  {
    id: "5",
    name: "교육기관 대상 이러닝 솔루션",
    description: "온라인 교육 플랫폼 소개 캠페인",
    status: "active",
    stats: {
      sent: 723,
      opened: 156,
      clicked: 89,
      total: 847,
    },
    dailyStats: [
      { date: "03-01", opens: 34, clicks: 19 },
      { date: "03-02", opens: 31, clicks: 18 },
      { date: "03-03", opens: 29, clicks: 16 },
      { date: "03-04", opens: 32, clicks: 19 },
      { date: "03-05", opens: 30, clicks: 17 },
    ],
  },
];

export const mockEmailTemplates = [
  {
    id: "1",
    name: "기본 프로모션 템플릿",
    subject: "{{company.name}}님을 위한 특별한 제안",
    thumbnail: "/template1.jpg",
    content: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>안녕하세요, {{company.owner}}님</h2>
          <p>{{company.name}}에 특별한 제안을 드립니다.</p>
          <p>{{llm_generation}}</p>
          <div style="text-align: center;">
            <a href="{{cta_link}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              자세히 보기
            </a>
          </div>
        </body>
      </html>
    `,
  },
  {
    id: "2",
    name: "뉴스레터 템플릿",
    subject: "{{company.name}} - 이번 주 산업 동향",
    thumbnail: "/template2.jpg",
    content: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>{{company.name}} 주간 뉴스레터</h2>
          <p>안녕하세요, {{company.owner}}님</p>
          <p>이번 주 {{company.industry}} 산업의 주요 동향을 공유드립니다.</p>
          <p>{{llm_generation}}</p>
        </body>
      </html>
    `,
  },
]; 