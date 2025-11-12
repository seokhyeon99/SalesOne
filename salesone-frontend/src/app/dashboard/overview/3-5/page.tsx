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
  Activity,
  Search,
  Download,
  Upload,
  Send,
  Webhook,
  Globe,
  Slack,
  Chrome,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  MousePointer,
  Eye,
  Square,
  Circle,
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"

// 확장된 워크플로우 블록 정의
const workflowBlocks = {
  triggers: [
    { id: 'new-lead', icon: Users, title: '신규 리드', description: '새로운 리드 등록시 시작', category: '트리거' },
    { id: 'lead-action', icon: Activity, title: '리드 활동', description: '웹사이트 방문, 이메일 열람시', category: '트리거' },
    { id: 'time-trigger', icon: Timer, title: '시간 트리거', description: '특정 시간/날짜에 실행', category: '트리거' },
    { id: 'webhook-trigger', icon: Webhook, title: '웹훅 트리거', description: '외부 시스템에서 신호 수신', category: '트리거' },
    { id: 'form-submit', icon: FileText, title: '폼 제출', description: '웹폼 제출시 시작', category: '트리거' }
  ],
  filters: [
    { id: 'lead-filter', icon: Filter, title: '리드 필터링', description: '조건별 리드 분류', category: '필터' },
    { id: 'company-size', icon: BarChart3, title: '회사 규모', description: '직원수, 매출 기준 필터', category: '필터' },
    { id: 'industry-filter', icon: Tag, title: '업종 필터', description: '산업군별 분류', category: '필터' },
    { id: 'geo-filter', icon: Globe, title: '지역 필터', description: '지역/국가별 필터링', category: '필터' },
    { id: 'score-filter', icon: Target, title: '점수 필터', description: '리드 점수 기준 필터', category: '필터' }
  ],
  actions: [
    { id: 'send-email', icon: Mail, title: '이메일 발송', description: '맞춤형 이메일 자동 발송', category: '액션' },
    { id: 'send-sms', icon: MessageSquare, title: 'SMS 발송', description: '문자 메시지 발송', category: '액션' },
    { id: 'create-task', icon: CheckCircle, title: '할일 생성', description: '담당자에게 업무 할당', category: '액션' },
    { id: 'schedule-call', icon: Phone, title: '통화 예약', description: '영업 통화 일정 예약', category: '액션' },
    { id: 'slack-notify', icon: Slack, title: '슬랙 알림', description: '슬랙 채널에 메시지 전송', category: '액션' },
    { id: 'webhook-send', icon: Send, title: '웹훅 발송', description: '외부 시스템에 데이터 전송', category: '액션' },
    { id: 'update-crm', icon: Database, title: 'CRM 업데이트', description: 'CRM 데이터 업데이트', category: '액션' },
    { id: 'create-deal', icon: DollarSign, title: '거래 생성', description: '새로운 거래 기회 생성', category: '액션' }
  ],
  conditions: [
    { id: 'if-condition', icon: GitBranch, title: '조건 분기', description: 'IF/THEN 조건부 실행', category: '조건' },
    { id: 'wait', icon: Clock, title: '대기', description: '일정 시간 대기 후 실행', category: '조건' },
    { id: 'split-test', icon: Split, title: 'A/B 테스트', description: '무작위 분할 테스트', category: '조건' },
    { id: 'loop', icon: Repeat, title: '반복', description: '조건에 따른 반복 실행', category: '조건' },
    { id: 'merge', icon: Share2, title: '병합', description: '여러 경로를 하나로 합침', category: '조건' }
  ],
  integrations: [
    { id: 'google-sheets', icon: FileText, title: '구글 시트', description: '구글 시트 데이터 연동', category: '통합' },
    { id: 'salesforce', icon: Database, title: '세일즈포스', description: '세일즈포스 CRM 연동', category: '통합' },
    { id: 'hubspot', icon: Target, title: '허브스팟', description: '허브스팟 마케팅 연동', category: '통합' },
    { id: 'zapier', icon: Zap, title: '자피어', description: '자피어를 통한 앱 연결', category: '통합' }
  ]
}

// 현재 활성화된 워크플로우 예시 (Y축 세로 방향 흐름)
const activeWorkflow = [
  { id: 'start', type: 'new-lead', x: 400, y: 40, title: '신규 리드', connected: ['filter1'] },
  { id: 'filter1', type: 'company-size', x: 400, y: 120, title: '기업규모 > 50명', connected: ['condition1'] },
  { id: 'condition1', type: 'if-condition', x: 400, y: 200, title: '업종 체크', connected: ['email1', 'slack1'] },
  { id: 'email1', type: 'send-email', x: 300, y: 280, title: '환영 이메일', connected: ['wait1'] },
  { id: 'slack1', type: 'slack-notify', x: 500, y: 280, title: '팀 알림', connected: ['wait1'] },
  { id: 'wait1', type: 'wait', x: 400, y: 360, title: '3일 대기', connected: ['score1'] },
  { id: 'score1', type: 'score-filter', x: 400, y: 440, title: '리드 점수 > 80', connected: ['task1', 'email2'] },
  { id: 'task1', type: 'create-task', x: 300, y: 520, title: '영업 할당', connected: [] },
  { id: 'email2', type: 'send-email', x: 500, y: 520, title: '후속 이메일', connected: [] }
]

// 미리 정의된 워크플로우 템플릿 (확장)
const workflowTemplates = [
  { 
    name: '신규 리드 온보딩',
    description: '신규 리드 등록부터 첫 미팅까지 자동화',
    blocks: 7,
    usage: '342회 사용',
    category: '리드 관리'
  },
  { 
    name: '이메일 캠페인 자동화',
    description: '이메일 시퀀스 및 반응 추적',
    blocks: 5,
    usage: '278회 사용',
    category: '마케팅'
  },
  { 
    name: '고가치 리드 알림',
    description: '매출 규모별 즉시 알림 시스템',
    blocks: 4,
    usage: '156회 사용',
    category: '영업'
  },
  { 
    name: 'CRM 데이터 동기화',
    description: '외부 CRM과 자동 데이터 동기화',
    blocks: 6,
    usage: '89회 사용',
    category: '통합'
  }
]

const WorkflowBlock = ({ block, isInCanvas = false, position, isSelected = false }: any) => {
  const getBlockIcon = (type: string) => {
    const allBlocks = [
      ...workflowBlocks.triggers, 
      ...workflowBlocks.filters, 
      ...workflowBlocks.actions, 
      ...workflowBlocks.conditions,
      ...workflowBlocks.integrations
    ]
    return allBlocks.find(b => b.id === type) || workflowBlocks.triggers[0]
  }
  
  const blockData = getBlockIcon(block.type || block.id)
  const Icon = blockData.icon

  return (
    <div 
      className={cn(
        "relative group cursor-move transition-all duration-200",
        isInCanvas && "absolute",
        isSelected && "scale-105 z-20"
      )}
      style={isInCanvas ? { left: position?.x, top: position?.y } : {}}
    >
      <div className={cn(
        "p-3 rounded-lg border-2 shadow-md transition-all duration-200",
        "hover:shadow-lg bg-white border-gray-200",
        "min-w-[140px] max-w-[140px]",
        isSelected && "border-blue-500 shadow-lg",
        !isInCanvas && "hover:border-gray-300"
      )}>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded bg-gray-100">
            <Icon className="h-3 w-3 text-gray-700" />
          </div>
          <span className="text-xs font-semibold text-gray-900 truncate">{blockData.title}</span>
        </div>
        <div className="text-xs text-gray-600 leading-tight">
          {block.title || blockData.description}
        </div>
        
        {/* 연결점 - 세로 방향 */}
        {isInCanvas && (
          <>
            <div className="absolute left-1/2 -top-1 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute left-1/2 -bottom-1 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        )}
      </div>
    </div>
  )
}

const ConnectionLine = ({ from, to }: { from: any, to: any }) => {
  const fromX = from.x + 70  // 블록 중앙에서 시작
  const fromY = from.y + 70  // 블록 하단에서 시작
  const toX = to.x + 70      // 블록 중앙으로 도착
  const toY = to.y           // 블록 상단으로 도착
  
  const midY = (fromY + toY) / 2
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-0" 
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill="#6b7280"
          />
        </marker>
      </defs>
      <path
        d={`M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`}
        stroke="#6b7280"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        className="drop-shadow-sm"
      />
    </svg>
  )
}

export default function AdvancedWorkflowBuilderPage() {
  const [selectedCategory, setSelectedCategory] = useState('triggers')
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  
  // 캔버스 이동 및 줌 상태
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  // 마우스 휠 줌 처리
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.5, Math.min(2, canvasTransform.scale * delta))
    
    setCanvasTransform(prev => ({
      ...prev,
      scale: newScale
    }))
  }

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // 왼쪽 마우스 버튼
      setIsDragging(true)
      setDragStart({ x: e.clientX - canvasTransform.x, y: e.clientY - canvasTransform.y })
    }
  }

  // 마우스 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCanvasTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }))
    }
  }

  // 마우스 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 줌 리셋
  const resetZoom = () => {
    setCanvasTransform({ x: 0, y: 0, scale: 1 })
  }

  return (
    <div className="w-full h-[100vh] bg-gray-50 overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {/* 상단 툴바 - 더 컴팩트하게 */}
      <div className="h-10 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-gray-900">고급 워크플로우 빌더</h1>
          <Badge variant="outline" className="text-xs py-0">v2.0</Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
            <Save className="h-3 w-3 mr-1" />
            저장
          </Button>
          <Button 
            variant={isPlaying ? "destructive" : "default"} 
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <>
                <Square className="h-3 w-3 mr-1" />
                중지
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                실행
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={resetZoom}>
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-2.5rem)]">
        {/* 좌측 블록 팔레트 - 더 좁게 */}
        <div className="w-60 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* 빠른 템플릿 - 컴팩트하게 */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">빠른 시작 템플릿</h3>
              <div className="space-y-1">
                {workflowTemplates.slice(0, 2).map((template, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-medium text-gray-900 truncate">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs py-0 px-1">{template.blocks}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 leading-tight mb-1">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{template.usage}</span>
                      <Button size="sm" variant="ghost" className="h-5 px-1 text-xs">
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
              <h3 className="text-xs font-semibold text-gray-900 mb-2">워크플로우 블록</h3>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {Object.keys(workflowBlocks).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    className="text-xs justify-start h-6 px-2"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'triggers' && '트리거'}
                    {category === 'filters' && '필터'}
                    {category === 'actions' && '액션'}
                    {category === 'conditions' && '조건'}
                    {category === 'integrations' && '통합'}
                  </Button>
                ))}
              </div>

              {/* 블록 목록 - 더 컴팩트하게 */}
              <div className="space-y-1">
                {(workflowBlocks as any)[selectedCategory]?.map((block: any, index: number) => (
                  <div key={index} className="group">
                    <div className="p-2 rounded border border-gray-200 cursor-move transition-all duration-200 hover:shadow-md bg-white hover:border-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-gray-100">
                          <block.icon className="h-3 w-3 text-gray-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-gray-900 block truncate">{block.title}</span>
                          <span className="text-xs text-gray-600 block truncate">{block.description}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 메인 캔버스 */}
        <div 
          ref={canvasRef}
          className="flex-1 relative bg-white overflow-hidden cursor-grab"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 그리드 배경 */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
              backgroundSize: `${20 * canvasTransform.scale}px ${20 * canvasTransform.scale}px`,
              backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`
            }}
          />
          
          {/* 실행 상태 표시 */}
          {isPlaying && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">워크플로우 실행 중</span>
              </div>
            </div>
          )}

          {/* 성능 통계 - 더 컴팩트하게 */}
          <div className="absolute top-2 right-2 z-10">
            <Card className="px-3 py-1">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-600" />
                  <span className="text-gray-600">처리: <strong className="text-gray-900">2,143</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-gray-600">성공: <strong className="text-gray-900">96.7%</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="text-gray-600">평균: <strong className="text-gray-900">1.8분</strong></span>
                </div>
              </div>
            </Card>
          </div>

          {/* 워크플로우 노드들 */}
          <div 
            className="relative h-full overflow-hidden"
            style={{
              transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
              transformOrigin: '0 0'
            }}
          >
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
              <div 
                key={node.id} 
                className="relative z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBlock(node.id)
                }}
                style={{ cursor: 'pointer' }}
              >
                <WorkflowBlock 
                  block={node} 
                  isInCanvas={true}
                  position={{ x: node.x, y: node.y }}
                  isSelected={selectedBlock === node.id}
                />
                
                {/* 실행 애니메이션 */}
                {isPlaying && (
                  <div 
                    className="absolute border-2 border-blue-400 rounded-lg animate-pulse pointer-events-none"
                    style={{ 
                      left: node.x - 2, 
                      top: node.y - 2,
                      width: '144px',
                      height: '74px',
                      animationDelay: `${index * 0.3}s`
                    }}
                  />
                )}
              </div>
            ))}

            {/* 캔버스 안내 - 더 작게 */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 text-gray-500 bg-white/90 px-3 py-1 rounded border border-gray-200 shadow-sm">
                <MousePointer className="h-3 w-3" />
                <span className="text-xs">블록을 드래그하여 워크플로우를 구성하세요</span>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 속성 패널 - 더 좁고 컴팩트하게 */}
        <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-3 space-y-4">
            {/* 선택된 블록 설정 */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">블록 설정</h3>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded bg-gray-100">
                    <Filter className="h-3 w-3 text-gray-700" />
                  </div>
                  <span className="text-xs font-medium text-gray-900">회사 규모 필터</span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">필터 조건</label>
                    <select className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white">
                      <option>직원 수 50명 이상</option>
                      <option>매출 10억원 이상</option>
                      <option>특정 업종 포함</option>
                      <option>지역별 필터</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">실행 조건</label>
                    <select className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white">
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
              <h3 className="text-xs font-semibold text-gray-900 mb-2">실행 통계</h3>
              <Card className="p-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">총 실행</span>
                    <span className="text-xs font-semibold text-gray-900">2,143</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">성공률</span>
                    <span className="text-xs font-semibold text-green-600">96.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">평균 시간</span>
                    <span className="text-xs font-semibold text-gray-900">1.8분</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI 최적화 제안 */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">AI 최적화 제안</h3>
              <div className="space-y-1.5">
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-start gap-1.5">
                    <Zap className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-800">병렬 처리 최적화</p>
                      <p className="text-xs text-blue-600 mt-0.5 leading-tight">병렬로 처리하여 15% 향상</p>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-start gap-1.5">
                    <Target className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-green-800">타겟팅 개선</p>
                      <p className="text-xs text-green-600 mt-0.5 leading-tight">IT 업종 필터로 28% 향상</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 버전 히스토리 */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 mb-2">버전 히스토리</h3>
              <Card className="p-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">v2.0 - 현재</span>
                    <span className="text-green-600">활성</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">v1.3 - 7일 전</span>
                    <Button variant="ghost" size="sm" className="h-4 px-1 text-xs">복원</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
