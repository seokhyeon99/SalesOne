"use client";

import { useState } from 'react';
import { useCompanyResearch } from '@/hooks/use-company-research';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Building, Newspaper, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface OpportunityResearchProps {
  companyName: string;
}

export function OpportunityResearch({ companyName }: OpportunityResearchProps) {
  const { research, isLoading, startResearch } = useCompanyResearch(companyName);
  const [hasStartedResearch, setHasStartedResearch] = useState(false);

  const handleStartResearch = async () => {
    setHasStartedResearch(true);
    await startResearch();
  };

  if (!hasStartedResearch) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Building className="h-16 w-16 text-muted-foreground mb-6" />
        <h2 className="text-xl font-semibold mb-2">회사 정보 조사하기</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          이 회사에 대한 추가 정보를 조사합니다. 요약, 상세 정보, 최신 뉴스 등을 확인할 수 있습니다.
        </p>
        <Button onClick={handleStartResearch} className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          조사하기
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-4">정보를 조사하고 있습니다...</div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    );
  }

  if (!research) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center py-4 text-muted-foreground">
          정보를 찾을 수 없습니다.
        </div>
        <Button onClick={handleStartResearch} variant="outline" className="mt-4">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div>
        <h3 className="text-lg font-medium mb-2">요약</h3>
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">{research.summary}</p>
        </div>
      </div>

      {/* Company Details */}
      <div>
        <h3 className="text-lg font-medium mb-2">회사 정보</h3>
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div>
              <div className="text-sm font-medium">대표자</div>
              <div className="text-sm text-muted-foreground">{research.details.representative}</div>
            </div>
            <div>
              <div className="text-sm font-medium">사업자번호</div>
              <div className="text-sm text-muted-foreground">{research.details.businessNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium">주소</div>
              <div className="text-sm text-muted-foreground">{research.details.address}</div>
            </div>
            <div>
              <div className="text-sm font-medium">사업유형</div>
              <div className="text-sm text-muted-foreground">{research.details.businessType}</div>
            </div>
            <div>
              <div className="text-sm font-medium">과세유형</div>
              <div className="text-sm text-muted-foreground">{research.details.taxationType}</div>
            </div>
            <div>
              <div className="text-sm font-medium">계산서발행</div>
              <div className="text-sm text-muted-foreground">{research.details.invoiceIssue}</div>
            </div>
            <div>
              <div className="text-sm font-medium">설립일</div>
              <div className="text-sm text-muted-foreground">{research.details.establishment || '정보 없음'}</div>
            </div>
            <div>
              <div className="text-sm font-medium">직원 수</div>
              <div className="text-sm text-muted-foreground">{research.details.employees || '정보 없음'}</div>
            </div>
            <div>
              <div className="text-sm font-medium">매출</div>
              <div className="text-sm text-muted-foreground">{research.details.revenue || '정보 없음'}</div>
            </div>
            <div>
              <div className="text-sm font-medium">주요 사업</div>
              <div className="text-sm text-muted-foreground">{research.details.mainBusiness || '정보 없음'}</div>
            </div>
            <div>
              <div className="text-sm font-medium">웹사이트</div>
              <div className="text-sm text-muted-foreground">{research.details.website || '정보 없음'}</div>
            </div>
            <div>
              <div className="text-sm font-medium">기타 정보</div>
              <div className="text-sm text-muted-foreground">{research.details.otherDetails || '정보 없음'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* News */}
      <div>
        <h3 className="text-lg font-medium mb-2">최신 뉴스</h3>
        <div className="space-y-4">
          {research.news.length > 0 ? (
            research.news.map((newsItem) => (
              <Card key={newsItem.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base">{newsItem.title}</CardTitle>
                  <CardDescription>
                    {newsItem.date} • {newsItem.source}
                  </CardDescription>
                </CardHeader>
                {newsItem.imageUrl && (
                  <div className="relative h-48 mx-4 mb-4 overflow-hidden rounded-md">
                    {/* Next.js Image component for optimization */}
                    <img 
                      src={newsItem.imageUrl} 
                      alt={newsItem.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {newsItem.content.length > 300
                      ? `${newsItem.content.substring(0, 300)}...`
                      : newsItem.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <a
                    href={newsItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    기사 원문 읽기
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              최신 뉴스를 찾을 수 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 