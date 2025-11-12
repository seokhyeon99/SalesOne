"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Filter,
  Mail,
  Clock,
  Database,
  Users,
  MessageSquare,
  Bell,
  Calendar,
  Target,
  Zap,
  Plus,
  Play,
  Save,
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Split,
  Repeat,
  Timer,
  Phone,
  FileText,
  Tag,
  Share2,
  GitBranch,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

// 워크플로우 블록 타입 정의
const workflowBlocks = {
  triggers: [
    { id: 'new-lead', icon: Users, title: '신규 리드', description: '새로운 리드 등록시 시작', color: 'bg-blue-500', category: '트리거' },
    { id: 'lead-action', icon: Activity, title: '리드 활동', description: '웹사이트 방문, 이메일 열람시', color: 'bg-green-500', category: '트리거' },
    { id: 'time-trigger', icon: Timer, title: '시간 트리거', description: '특정 시간/날짜에 실행', color: 'bg-purple-500', category: '트리거' }
  ],
  filters: [
    { id: 'lead-filter', icon: Filter, title: '리드 필터링', description: '조건별 리드 분류', color: 'bg-orange-500', category: '필터' },
    { id: 'company-size', icon: BarChart3, title: '회사 규모', description: '직원수, 매출 기준 필터', color: 'bg-cyan-500', category: '필터' },
    { id: 'industry-filter', icon: Tag, title: '업종 필터', description: '산업군별 분류', color: 'bg-pink-500', category: '필터' }
  ],
  actions: [
    { id: 'send-email', icon: Mail, title: '이메일 발송', description: '맞춤형 이메일 자동 발송', color: 'bg-red-500', category: '액션' },
    { id: 'send-sms', icon: MessageSquare, title: 'SMS 발송', description: '문자 메시지 발송', color: 'bg-yellow-500', category: '액션' },
    { id: 'create-task', icon: CheckCircle, title: '할일 생성', description: '담당자에게 업무 할당', color: 'bg-indigo-500', category: '액션' },
    { id: 'schedule-call', icon: Phone, title: '통화 예약', description: '영업 통화 일정 예약', color: 'bg-emerald-500', category: '액션' }
  ],
  conditions: [
    { id: 'if-condition', icon: GitBranch, title: '조건 분기', description: 'IF/THEN 조건부 실행', color: 'bg-gray-600', category: '조건' },
    { id: 'wait', icon: Clock, title: '대기', description: '일정 시간 대기 후 실행', color: 'bg-amber-500', category: '조건' },
    { id: 'split-test', icon: Split, title: 'A/B 테스트', description: '무작위 분할 테스트', color: 'bg-violet-500', category: '조건' }
  ]
}

// 현재 활성화된 워크플로우 예시
const activeWorkflow = [
  { id: 'start', type: 'new-lead', x: 100, y: 180, title: '신규 리드', connected: ['filter1'] },
  { id: 'filter1', type: 'lead-filter', x: 280, y: 180, title: '기업규모 > 50명', connected: ['email1'] },
  { id: 'email1', type: 'send-email', x: 460, y: 120, title: '환영 이메일', connected: ['wait1'] },
  { id: 'wait1', type: 'wait', x: 640, y: 120, title: '3일 대기', connected: ['condition1'] },
  { id: 'condition1', type: 'if-condition', x: 820, y: 180, title: '이메일 열람?', connected: ['email2', 'task1'] },
  { id: 'email2', type: 'send-email', x: 1000, y: 120, title: '후속 이메일', connected: [] },
  { id: 'task1', type: 'create-task', x: 1000, y: 240, title: '직접 연락', connected: [] }
]

// 미리 정의된 워크플로우 템플릿
const workflowTemplates = [
  { 
    name: '신규 리드 환영 시퀀스', 
    description: '신규 리드 등록시 자동 환영 이메일 및 후속 조치',
    blocks: 4,
    usage: '234회 사용'
  },
  { 
    name: '이메일 미응답자 재접촉', 
    description: '이메일 미열람시 SMS 및 전화 업무 생성',
    blocks: 6,
    usage: '156회 사용'
  },
  { 
    name: '고가치 리드 즉시 알림', 
    description: '매출 10억 이상 기업 등록시 즉시 알림',
    blocks: 3,
    usage: '89회 사용'
  }
]

const WorkflowBlock = ({ block, isInCanvas = false, position }: any) => {
  const getBlockIcon = (type: string) => {
    const allBlocks = [...workflowBlocks.triggers, ...workflowBlocks.filters, ...workflowBlocks.actions, ...workflowBlocks.conditions]
    return allBlocks.find(b => b.id === type) || workflowBlocks.triggers[0]
  }
  
  const blockData = getBlockIcon(block.type || block.id)
  const Icon = blockData.icon

  return (
    <div 
      className={cn(
        "relative group cursor-move",
        isInCanvas && "absolute"
      )}
      style={isInCanvas ? { left: position?.x, top: position?.y } : {}}
    >
      <div className={cn(
        "p-3 rounded-xl border-2 border-white shadow-lg transition-all duration-200",
        "hover:shadow-xl hover:scale-105",
        blockData.color,
        "text-white min-w-[140px]"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold">{blockData.title}</span>
        </div>
        <div className="text-xs opacity-90 text-white">
          {block.title || blockData.description}
        </div>
        
        {/* 연결점 */}
        {isInCanvas && (
          <>
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </div>
    </div>
  )
}

const ConnectionLine = ({ from, to }: { from: any, to: any }) => {
  const fromX = from.x + 140
  const fromY = from.y + 40
  const toX = to.x
  const toY = to.y + 40
  
  const midX = (fromX + toX) / 2
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-0" 
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#94a3b8"
          />
        </marker>
      </defs>
      <path
        d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
        stroke="#94a3b8"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        className="drop-shadow-sm"
      />
    </svg>
  )
}

export default function WorkflowBuilderPage() {
  const [selectedCategory, setSelectedCategory] = useState('triggers')
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* 상단 툴바 */}
      <div className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">워크플로우 빌더</h1>
          <Badge variant="secondary">리드 자동화 시퀀스</Badge>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
          <Button 
            variant={isPlaying ? "destructive" : "default"} 
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <>
                <div className="h-4 w-4 mr-2 bg-white rounded-sm" />
                중지
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                실행
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* 좌측 블록 팔레트 */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* 템플릿 섹션 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">빠른 시작 템플릿</h3>
              <div className="space-y-2">
                {workflowTemplates.map((template, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                      <Badge variant="outline" className="text-xs">{template.blocks}개</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">{template.usage}</span>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                        사용
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* 블록 카테고리 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">워크플로우 블록</h3>
              <div className="flex flex-wrap gap-1 mb-4">
                {Object.keys(workflowBlocks).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'triggers' && '트리거'}
                    {category === 'filters' && '필터'}
                    {category === 'actions' && '액션'}
                    {category === 'conditions' && '조건'}
                  </Button>
                ))}
              </div>

              {/* 블록 목록 */}
              <div className="space-y-2">
                {(workflowBlocks as any)[selectedCategory]?.map((block: any, index: number) => (
                  <div key={index} className="group">
                    <WorkflowBlock block={block} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 메인 캔버스 */}
        <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-blue-50">
          {/* 그리드 배경 */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* 실행 상태 표시 */}
          {isPlaying && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">워크플로우 실행 중</span>
              </div>
            </div>
          )}

          {/* 성능 통계 */}
          <div className="absolute top-4 right-4 z-10">
            <Card className="p-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>처리된 리드: <strong>1,247</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>성공률: <strong>94.2%</strong></span>
                </div>
              </div>
            </Card>
          </div>

          {/* 워크플로우 노드들 */}
          <div className="relative h-full">
            {/* 연결선 그리기 */}
            {activeWorkflow.map((node) => 
              node.connected?.map((connectedId) => {
                const connectedNode = activeWorkflow.find(n => n.id === connectedId)
                if (connectedNode) {
                  return (
                    <ConnectionLine 
                      key={`${node.id}-${connectedId}`}
                      from={node} 
                      to={connectedNode} 
                    />
                  )
                }
                return null
              })
            )}

            {/* 워크플로우 블록들 */}
            {activeWorkflow.map((node, index) => (
              <div key={node.id} className="relative z-10">
                <WorkflowBlock 
                  block={node} 
                  isInCanvas={true}
                  position={{ x: node.x, y: node.y }}
                />
                
                {/* 실행 애니메이션 */}
                {isPlaying && (
                  <div 
                    className="absolute top-0 left-0 w-full h-full border-2 border-green-400 rounded-xl animate-pulse"
                    style={{ 
                      left: node.x, 
                      top: node.y,
                      width: '140px',
                      height: '80px',
                      animationDelay: `${index * 0.5}s`
                    }}
                  />
                )}
              </div>
            ))}

            {/* 드롭 영역 힌트 */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 text-gray-500 bg-white/80 px-4 py-2 rounded-full border border-gray-200">
                <Plus className="h-4 w-4" />
                <span className="text-sm">블록을 드래그하여 워크플로우를 구성하세요</span>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 속성 패널 */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* 선택된 블록 설정 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">블록 설정</h3>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">리드 필터링</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">필터 조건</label>
                    <select className="w-full mt-1 p-2 border border-gray-200 rounded text-sm">
                      <option>직원 수 50명 이상</option>
                      <option>매출 10억 이상</option>
                      <option>특정 업종</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-600">액션</label>
                    <select className="w-full mt-1 p-2 border border-gray-200 rounded text-sm">
                      <option>조건 만족시 다음 단계</option>
                      <option>조건 불만족시 종료</option>
                      <option>조건 불만족시 다른 경로</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {/* 워크플로우 통계 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">실행 통계</h3>
              <div className="space-y-3">
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">총 실행 횟수</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">성공률</span>
                    <span className="font-semibold text-green-600">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">평균 처리 시간</span>
                    <span className="font-semibold">2.3분</span>
                  </div>
                </Card>

                <Card className="p-3">
                  <h4 className="text-sm font-medium mb-2">단계별 전환율</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>리드 필터링</span>
                      <span className="text-green-600">100%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>이메일 발송</span>
                      <span className="text-green-600">98.1%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>이메일 열람</span>
                      <span className="text-yellow-600">67.3%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span>후속 조치</span>
                      <span className="text-blue-600">45.2%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* 자동 최적화 제안 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">AI 최적화 제안</h3>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-700">이메일 발송 시간 최적화</p>
                      <p className="text-xs text-blue-600 mt-1">오후 2-4시 발송시 열람률 15% 증가 예상</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-green-700">개인화 메시지 추가</p>
                      <p className="text-xs text-green-600 mt-1">회사명 포함시 응답률 23% 향상</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
