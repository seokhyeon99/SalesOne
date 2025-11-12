"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database, Workflow, Mail, Users, CheckCircle, BarChart3, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const handleWorkflowExecution = () => {
    // 실제로는 API 호출 등의 로직을 여기에 구현
    setTimeout(() => {
      toast.success("세금계산서 발급이 완료되었습니다", {
        description: "고객 이메일로 자동 발송되었습니다",
        duration: 5000,
      });
    }, 1500); // 1.5초 후에 완료 알림 (실행 중인 느낌을 주기 위함)
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="py-4 px-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">SalesOne</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/register">
              <Button>회원가입</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <h1 className="text-5xl font-bold leading-tight">
                영업의 <span className="text-primary">전 과정을</span> 통합하고 자동화하는 플랫폼
              </h1>
              <p className="text-xl">
                세일즈원으로 DB 확보부터 이메일 아웃리치, CRM 연동, 전환 분석까지 아우르는
                실행 중심의 End-to-End 영업 플랫폼을 경험하세요.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8">
                    무료로 시작하기
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  데모 요청하기
                </Button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-muted">
                <Image
                  src="/dashboard.png"
                  alt="세일즈원 대시보드"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-white p-4 rounded-lg shadow-lg">
                <p className="font-medium">고객 전환율</p>
                <p className="text-3xl font-bold">+300%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Database Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">22만개 이상의 방대한 양질의 데이터베이스</h2>
            <p className="text-xl max-w-3xl mx-auto">
              국세청, 공정위, 지방자치단체 등을 포함한 198개의 행정 및 신용 데이터를 통합하여 
              국내 법인 22만개에 대한 양질의 DB를 확보하였습니다.
            </p>
          </div>
          
          <div className="relative h-[500px] rounded-xl overflow-hidden border bg-card shadow-xl">
            <div className="absolute inset-0 p-6 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">고급 필터링으로 타겟팅 고객 찾기</h3>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4">
                <div className="bg-background rounded-lg p-4 border min-w-[180px] shadow-sm">
                  <p className="font-medium mb-2">업종</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border bg-primary/20"></div>
                      <span>IT 서비스</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border"></div>
                      <span>제조업</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border"></div>
                      <span>유통업</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border min-w-[180px] shadow-sm">
                  <p className="font-medium mb-2">연 매출</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border"></div>
                      <span>1억 미만</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border bg-primary/20"></div>
                      <span>1억 ~ 10억</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border bg-primary/20"></div>
                      <span>10억 이상</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border min-w-[180px] shadow-sm">
                  <p className="font-medium mb-2">직원 수</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border"></div>
                      <span>10명 미만</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border bg-primary/20"></div>
                      <span>10 ~ 50명</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border"></div>
                      <span>50명 이상</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border min-w-[180px] shadow-sm">
                  <p className="font-medium mb-2">지역</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border bg-primary/20"></div>
                      <span>서울</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border"></div>
                      <span>경기</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-sm border"></div>
                      <span>부산</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 bg-background rounded-lg border p-4 mt-4 overflow-hidden">
                <div className="flex justify-between items-center mb-4 sticky top-0 z-10">
                  <h4 className="font-semibold">검색 결과: 2,450개 기업</h4>
                  <Button size="sm">리드 리스트 생성</Button>
                </div>
                
                <div className="space-y-4 animate-scroll overflow-hidden">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="p-3 border rounded-lg bg-card flex justify-between items-center">
                      <div>
                        <p className="font-medium">{`(주)세일즈테크 ${i}`}</p>
                        <p className="text-sm text-muted-foreground">IT 서비스 | 서울 | 연매출 5억</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <PlusIcon className="h-4 w-4 mr-1" /> 추가
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Automation Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">워크플로우로 업무 자동화</h2>
            <p className="text-xl max-w-3xl mx-auto">
              노드 기반 자동화 시스템으로 반복적인 업무를 줄이고 영업 성과를 높이세요.
            </p>
          </div>
          
          <div className="relative h-[500px] rounded-xl overflow-hidden border bg-card shadow-xl">
            <div className="absolute inset-0 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Workflow className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">세금계산서 자동 발행 워크플로우</h3>
              </div>
              
              <div className="flex-1 relative overflow-hidden bg-muted/30 rounded-lg border p-6">
                <div className="flex items-start gap-6">
                  <div className="bg-background p-4 rounded-lg border shadow-sm w-48">
                    <div className="text-center mb-2">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="font-medium mt-1">고객 선택</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">고객 정보 불러오기</p>
                  </div>
                  
                  <div className="flex items-center">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg border shadow-sm w-48">
                    <div className="text-center mb-2">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <p className="font-medium mt-1">상품 정보 확인</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">구매한 상품 및 금액 확인</p>
                  </div>
                  
                  <div className="flex items-center">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg border shadow-sm w-48">
                    <div className="text-center mb-2">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-4 h-4" />
                      </div>
                      <p className="font-medium mt-1">세금계산서 발행</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">홈택스 API 연동</p>
                  </div>
                  
                  <div className="flex items-center">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg border shadow-sm w-48">
                    <div className="text-center mb-2">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center mx-auto">
                        <Mail className="w-4 h-4" />
                      </div>
                      <p className="font-medium mt-1">이메일 발송</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">발행 완료 알림</p>
                  </div>
                </div>
                
                <div className="absolute bottom-6 right-6">
                  <Button className="shadow-lg" onClick={handleWorkflowExecution}>워크플로우 실행</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">세일즈원 주요 기능</h2>
            <p className="text-xl max-w-3xl mx-auto">
              리드 수집부터 캠페인, CRM 및 워크플로우까지 모든 영업 활동을 통합하여 관리하세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">리드 관리</h3>
              <p className="text-muted-foreground mb-4">
                22만개 이상의 DB에서 ICP에 맞는 고객을 필터링하고 맞춤형 리드 리스트를 생성하세요.
              </p>
              <Link href="/leads" className="text-primary font-medium inline-flex items-center">
                자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">이메일 캠페인</h3>
              <p className="text-muted-foreground mb-4">
                맞춤형 템플릿으로 개인화된 이메일을 자동으로 보내 잠재고객 전환율을 높이세요.
              </p>
              <Link href="/campaigns" className="text-primary font-medium inline-flex items-center">
                자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">고객 관리</h3>
              <p className="text-muted-foreground mb-4">
                고객과의 모든 상호작용을 기록하고 소통 이력을 한 곳에서 관리하세요.
              </p>
              <Link href="/clients" className="text-primary font-medium inline-flex items-center">
                자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Workflow className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">워크플로우 자동화</h3>
              <p className="text-muted-foreground mb-4">
                반복적인 업무를 노드 기반 자동화 시스템으로 효율적으로 처리하세요.
              </p>
              <Link href="/workflows" className="text-primary font-medium inline-flex items-center">
                자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">할일 관리</h3>
              <p className="text-muted-foreground mb-4">
                업무를 시각적으로 관리하고 워크플로우를 결합하여 자동화된 업무를 구현하세요.
              </p>
              <Link href="/tasks" className="text-primary font-medium inline-flex items-center">
                자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-sm border">
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">데이터 대시보드</h3>
              <p className="text-muted-foreground mb-4">
                영업 성과와 KPI를 직관적인 대시보드로 확인하고 팀의 성과를 높이세요.
              </p>
              <Link href="/dashboard" className="text-primary font-medium inline-flex items-center">
                자세히 보기 <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 세일즈원을 경험해보세요</h2>
          <p className="text-xl mb-8">
            14일 무료 체험으로 세일즈원의 모든 기능을 경험할 수 있습니다.
            별도의 신용카드 정보가 필요하지 않습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                무료로 시작하기
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary hover:bg-primary-foreground hover:text-primary">
              데모 요청하기
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SalesOne</h3>
              <p className="text-muted-foreground mb-4">통합 영업 자동화 플랫폼으로 영업 프로세스를 혁신하세요.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">주요 기능</h4>
              <ul className="space-y-2">
                <li><Link href="/leads" className="text-muted-foreground hover:text-foreground">리드 관리</Link></li>
                <li><Link href="/campaigns" className="text-muted-foreground hover:text-foreground">이메일 캠페인</Link></li>
                <li><Link href="/clients" className="text-muted-foreground hover:text-foreground">고객 관리</Link></li>
                <li><Link href="/workflows" className="text-muted-foreground hover:text-foreground">워크플로우 자동화</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">회사 정보</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">회사 소개</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">팀 소개</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">채용 정보</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">문의하기</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객 지원</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">도움말 센터</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">API 문서</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">가격 정책</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">블로그</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">&copy; 2025 SalesOne. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">이용약관</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">개인정보처리방침</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">보안정책</a>
            </div>
          </div>
        </div>
      </footer>
      </div>
  );
}

// 추가 컴포넌트
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
