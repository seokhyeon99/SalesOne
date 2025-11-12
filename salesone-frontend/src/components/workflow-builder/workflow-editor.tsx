import { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
  Connection,
  addEdge,
  ReactFlowInstance,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WorkflowNode, WorkflowEdge, Workflow } from "@/types/workflow"
import { NodePanel } from "@/components/workflow-builder/panel"
import { EmailNode } from "@/components/workflow-builder/custom-nodes/email-node";
import { SlackNode } from "@/components/workflow-builder/custom-nodes/slack-node";
import { WebhookNode } from "@/components/workflow-builder/custom-nodes/webhook-node";
import { ConditionNode } from "@/components/workflow-builder/custom-nodes/condition-node";
import { DelayNode } from "@/components/workflow-builder/custom-nodes/delay-node";
import { TriggerNode } from "@/components/workflow-builder/custom-nodes/trigger-node";
import { cn } from "@/lib/utils";

const nodeTypes = {
  triggerNode: TriggerNode,
  emailNode: EmailNode,
  slackNode: SlackNode,
  webhookNode: WebhookNode,
  conditionNode: ConditionNode,
  delayNode: DelayNode,
};

interface WorkflowEditorProps {
  initialWorkflow?: Workflow | null;
}

const naverWorkflowMock = {
  id: "1ca0ff08-351a-4411-874d-e57e73a0ace6",
  name: "네이버 CPC 광고 세팅",
  description: "네이버 CPC 광고 세팅을 자동으로 수행합니다",
  nodes: {
    "0": {
      id: "0",
      data: {
        type: "client"
      },
      type: "triggerNode",
      position: {
        x: 77.50575815738966,
        y: 219.87523992322457
      }
    },
    "1": {
      id: "1",
      data: {
        url: "https://api.searchad.naver.com/ncc/campaigns",
        body: "{\n  \"name\": \"CPC 캠페인 예시\",\n  \"type\": \"SEARCH\",\n  \"customerId\": \"{{customerId}}\",\n  \"dailyBudget\": 100000,\n  \"useDailyBudget\": true,\n  \"period\": {\n    \"beginDate\": \"2025-04-19\",\n    \"endDate\": \"2025-12-31\"\n  }\n}\n",
        method: "POST",
        headers: "{\n  \"Content-Type\": \"application/json; charset=UTF-8\",\n  \"X-API-KEY\": \"{{apiKey}}\",\n  \"X-CUSTOMER\": \"{{customerId}}\",\n  \"X-Timestamp\": \"{{timestamp}}\",\n  \"X-Signature\": \"{{signature}}\"\n}\n"
      },
      type: "webhookNode",
      position: {
        x: 489.53489035990265,
        y: -11.876045395611527
      }
    },
    "2": {
      id: "2",
      data: {
        url: "https://api.searchad.naver.com/ncc/adgroups",
        body: "{\n  \"name\": \"광고그룹 예시\",\n  \"nccCampaignId\": \"{{campaignId}}\",\n  \"bidAmt\": 70,\n  \"pcChannelId\": null,\n  \"mobileChannelId\": null,\n  \"userLock\": false\n}",
        method: "POST",
        headers: "{\n  \"Content-Type\": \"application/json; charset=UTF-8\",\n  \"X-API-KEY\": \"{{apiKey}}\",\n  \"X-CUSTOMER\": \"{{customerId}}\",\n  \"X-Timestamp\": \"{{timestamp}}\",\n  \"X-Signature\": \"{{signature}}\"\n}\n"
      },
      type: "webhookNode",
      position: {
        x: 63.78357475103644,
        y: 564.428496543732
      }
    },
    "3": {
      id: "3",
      data: {
        url: "https://api.searchad.naver.com/ncc/keywords",
        body: "[\n  {\n    \"nccAdgroupId\": \"{{adgroupId}}\",\n    \"keyword\": \"네이버 광고\",\n    \"userLock\": false,\n    \"bidAmt\": 100,\n    \"useGroupBidAmt\": false\n  },\n  {\n    \"nccAdgroupId\": \"{{adgroupId}}\",\n    \"keyword\": \"검색광고 자동화\",\n    \"userLock\": false,\n    \"bidAmt\": 120,\n    \"useGroupBidAmt\": false\n  }\n]\n",
        method: "POST",
        headers: "{\n  \"Content-Type\": \"application/json; charset=UTF-8\",\n  \"X-API-KEY\": \"{{apiKey}}\",\n  \"X-CUSTOMER\": \"{{customerId}}\",\n  \"X-Timestamp\": \"{{timestamp}}\",\n  \"X-Signature\": \"{{signature}}\"\n}\n"
      },
      type: "webhookNode",
      position: {
        x: 855.5874538554876,
        y: 322.12186609778144
      }
    },
    "4": {
      id: "4",
      data: {
        channel: "#공지방",
        message: "{{customer.name}} 고객의 네이버 CPC 광고 세팅을 완료했습니다"
      },
      type: "slackNode",
      position: {
        x: 1234.8228526700348,
        y: 345.6184317317602
      }
    }
  },
  edges: [
    {
      id: "reactflow__edge-0-1",
      source: "0",
      target: "1"
    },
    {
      id: "reactflow__edge-1-2",
      source: "1",
      target: "2"
    },
    {
      id: "reactflow__edge-2-3",
      source: "2",
      target: "3"
    },
    {
      id: "reactflow__edge-3-4",
      source: "3",
      target: "4"
    }
  ],
  is_active: true
};

const instaWorkflowMock = {
  id: "fa59ae90-acd0-4ea6-89df-819e1e098419",
  name: "인스타 (메타) 광고 자동 세팅",
  description: "메타 광고를 자동으로 세팅해주는 워크플로우입니다",
  nodes: {
    "0": {
      id: "0",
      data: {
        type: "client"
      },
      type: "triggerNode",
      position: {
        x: 104.75566218809979,
        y: 232.00038387715932
      }
    },
    "1": {
      id: "1",
      data: {
        url: "https://graph.facebook.com/v18.0/act_{ad_account_id}/campaigns",
        body: "{\n  \"name\": \"{{campaign_name}}\",\n  \"objective\": \"VIDEO_VIEWS\",\n  \"status\": \"PAUSED\"\n}\n",
        method: "POST",
        headers: "{\n  \"Authorization\": \"Bearer {{access_token}}\",\n  \"Content-Type\": \"application/json\"\n}"
      },
      type: "webhookNode",
      position: {
        x: 469.23326145484054,
        y: 170.7870664627627
      }
    },
    "2": {
      id: "2",
      data: {
        url: "https://graph.facebook.com/v18.0/act_{ad_account_id}/adsets",
        body: "{\n  \"name\": \"{{adset_name}}\",\n  \"campaign_id\": \"{{campaign_id}}\",\n  \"daily_budget\": 10000,\n  \"billing_event\": \"IMPRESSIONS\",\n  \"optimization_goal\": \"VIDEO_VIEWS\",\n  \"bid_strategy\": \"LOWEST_COST_WITHOUT_CAP\",\n  \"start_time\": \"{{start_time}}\",\n  \"end_time\": \"{{end_time}}\",\n  \"targeting\": {\n    \"geo_locations\": {\n      \"countries\": [\"KR\"]\n    },\n    \"age_min\": 18,\n    \"age_max\": 35,\n    \"genders\": [1],\n    \"interests\": [{\"id\": \"6003139266461\", \"name\": \"Technology\"}]\n  },\n  \"status\": \"PAUSED\"\n}\n",
        method: "POST",
        headers: "{\n  \"Authorization\": \"Bearer {{access_token}}\",\n  \"Content-Type\": \"application/json\"\n}"
      },
      type: "webhookNode",
      position: {
        x: 103.89421191027668,
        y: 573.4963448982646
      }
    },
    "3": {
      id: "3",
      data: {
        url: "https://graph.facebook.com/v18.0/act_{ad_account_id}/adcreatives",
        body: "{\n  \"name\": \"{{creative_name}}\",\n  \"object_story_spec\": {\n    \"instagram_actor_id\": \"{{instagram_actor_id}}\",\n    \"video_data\": {\n      \"video_id\": \"{{video_id}}\",\n      \"call_to_action\": {\n        \"type\": \"LEARN_MORE\",\n        \"value\": {\n          \"link\": \"{{landing_page_url}}\"\n        }\n      },\n      \"caption\": \"{{caption_text}}\"\n    }\n  }\n}\n",
        method: "POST",
        headers: "{\n  \"Authorization\": \"Bearer {{access_token}}\",\n  \"Content-Type\": \"application/json\"\n}\n"
      },
      type: "webhookNode",
      position: {
        x: 463.5258865162705,
        y: 746.0545263583191
      }
    },
    "4": {
      id: "4",
      data: {
        url: "https://graph.facebook.com/v18.0/act_{ad_account_id}/ads",
        body: "{\n  \"name\": \"{{ad_name}}\",\n  \"adset_id\": \"{{adset_id}}\",\n  \"creative\": {\n    \"creative_id\": \"{{creative_id}}\"\n  },\n  \"status\": \"PAUSED\"\n}\n",
        method: "POST",
        headers: "{\n  \"Authorization\": \"Bearer {{access_token}}\",\n  \"Content-Type\": \"application/json\"\n}\n"
      },
      type: "webhookNode",
      position: {
        x: 815.3607287448078,
        y: 173.87903330982795
      }
    },
    "5": {
      id: "5",
      data: {
        channel: "#공지방",
        message: "{{customer.name}}의 메타광고 세팅이 완료되었습니다"
      },
      type: "slackNode",
      position: {
        x: 819.6169881407932,
        y: 836.4913933780666
      }
    }
  },
  edges: [
    {
      id: "reactflow__edge-0-1",
      source: "0",
      target: "1"
    },
    {
      id: "reactflow__edge-1-2",
      source: "1",
      target: "2"
    },
    {
      id: "reactflow__edge-2-3",
      source: "2",
      target: "3"
    },
    {
      id: "reactflow__edge-3-4",
      source: "3",
      target: "4"
    },
    {
      id: "reactflow__edge-4-5",
      source: "4",
      target: "5"
    }
  ],
  is_active: true
};

let id = 0;
const getId = () => `${id++}`;

export function WorkflowEditor({ initialWorkflow = null }: WorkflowEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>(() => {
    if (!initialWorkflow?.nodes) return [];
    return Object.entries(initialWorkflow.nodes).map(([id, node]) => ({
      id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        onChange: (newData: any) => {
          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === id) {
                n.data = { ...n.data, ...newData };
              }
              return n;
            })
          );
        },
      },
    }));
  });
  const [edges, setEdges] = useState<Edge[]>(initialWorkflow?.edges || []);
  const [name, setName] = useState(initialWorkflow?.name || "");
  const [description, setDescription] = useState(initialWorkflow?.description || "");
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [loading, setLoading] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = JSON.parse(event.dataTransfer.getData("application/reactflow"));

      if (!reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: getId(),
        type: data.type,
        position,
        data: {
          ...data.data,
          onChange: (newData: any) => {
            setNodes((nds) =>
              nds.map((node) => {
                if (node.id === newNode.id) {
                  node.data = { ...node.data, ...newData };
                }
                return node;
              })
            );
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      // Remove any edges connected to the deleted nodes
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !deleted.some(
              (node) => node.id === edge.source || node.id === edge.target
            )
        )
      );
    },
    []
  );

  const handleGenerateTemplate = () => {
    setLoading(true);
    
    // After 5 seconds, populate the editor based on the name
    setTimeout(() => {
      let templateData = null;
      
      if (name.includes("네이버")) {
        templateData = naverWorkflowMock;
      } else if (name.includes("인스타")) {
        templateData = instaWorkflowMock;
      }
      
      if (!templateData) {
        setLoading(false);
        return;
      }
      
      // Convert nodes object to array format for ReactFlow
      const newNodes = Object.entries(templateData.nodes).map(([id, node]: [string, any]) => ({
        id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          onChange: (newData: any) => {
            setNodes((nds) =>
              nds.map((n) => {
                if (n.id === id) {
                  n.data = { ...n.data, ...newData };
                }
                return n;
              })
            );
          },
        },
      }));
      
      // Set nodes and edges
      setNodes(newNodes);
      setEdges(templateData.edges);
      
      // Reset loading state
      setLoading(false);
    }, 5000);
  };

  const handleSave = async () => {
    try {
      const workflowData = {
        name,
        description,
        nodes: nodes.reduce<Record<string, any>>((acc, node) => {
          acc[node.id] = {
            id: node.id,
            type: node.type,
            position: node.position,
            data: node.data,
          };
          return acc;
        }, {}),
        edges: edges.map((edge) => ({
          source: edge.source,
          target: edge.target,
          id: edge.id,
        })),
        is_active: true,
      };

      const url = initialWorkflow 
        ? `/api/workflows/workflows/${initialWorkflow.id}`
        : "/api/workflows/workflows";

      const response = await fetch(url, {
        method: initialWorkflow ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflowData),
      });

      if (!response.ok) {
        throw new Error("워크플로우 저장에 실패했습니다");
      }

      // Redirect to workflows list
      window.location.href = "/dashboard/workflows";
    } catch (error) {
      console.error("Error saving workflow:", error);
      // TODO: Show error toast
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      <NodePanel />
      
      <div className="flex-1 flex flex-col gap-4">
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">워크플로우 이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="워크플로우 이름을 입력하세요"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="워크플로우에 대한 설명을 입력하세요"
              />
            </div>
          </div>
          
          {/* 템플릿 생성 버튼 */}
          <div className="mt-4">
            <button
              onClick={handleGenerateTemplate}
              disabled={loading}
              className={cn(
                "w-full h-9 font-medium rounded-xl transition-all",
                loading
                  ? "rainbow-button relative group inline-flex items-center justify-center border-0 bg-[length:200%] px-8 py-2 text-white [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]"
                  : "bg-black text-white hover:bg-gray-800 border border-transparent"
              )}
            >
              {loading ? "생성 중..." : "템플릿 생성하기"}
            </button>
          </div>
        </Card>

        <Card className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={onNodesDelete}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            deleteKeyCode="Delete"
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            취소
          </Button>
          <Button onClick={handleSave}>
            {initialWorkflow ? "수정" : "생성"}
          </Button>
        </div>
      </div>
      
      {/* CSS for rainbow button animation */}
      <style jsx global>{`
        .rainbow-button {
          --color-1: hsl(0 100% 63%);
          --color-2: hsl(270 100% 63%);
          --color-3: hsl(210 100% 63%);
          --color-4: hsl(195 100% 63%);
          --color-5: hsl(90 100% 63%);
          --speed: 2s;
          background: linear-gradient(#121213, #121213),
                    linear-gradient(#121213 50%, rgba(18,18,19,0.6) 80%, rgba(18,18,19,0)),
                    linear-gradient(90deg, var(--color-1), var(--color-5), var(--color-3), var(--color-4), var(--color-2));
          animation: rainbow var(--speed) infinite linear;
        }

        .rainbow-button:before {
          content: '';
          position: absolute;
          bottom: -20%;
          left: 50%;
          z-index: 0;
          height: 20%;
          width: 100%;
          transform: translateX(-50%);
          background: linear-gradient(90deg, var(--color-1), var(--color-5), var(--color-3), var(--color-4), var(--color-2));
          background-size: 200%;
          filter: blur(0.8rem);
          animation: rainbow var(--speed) infinite linear;
        }

        @keyframes rainbow {
          0% {
            background-position: 0;
          }
          100% {
            background-position: 200%;
          }
        }
      `}</style>
    </div>
  );
} 