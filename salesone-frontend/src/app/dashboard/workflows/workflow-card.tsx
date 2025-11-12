'use client';

import { Button } from "@/components/ui/button";
import { Play, Edit, Trash, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReactFlow, { 
  Background, 
  Controls, 
  Node as FlowNode, 
  Edge as FlowEdge, 
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMemo } from 'react';
import { EmailNode } from "@/components/workflow-builder/custom-nodes/email-node";
import { SlackNode } from "@/components/workflow-builder/custom-nodes/slack-node";
import { WebhookNode } from "@/components/workflow-builder/custom-nodes/webhook-node";
import { ConditionNode } from "@/components/workflow-builder/custom-nodes/condition-node";
import { DelayNode } from "@/components/workflow-builder/custom-nodes/delay-node";
import { TriggerNode } from "@/components/workflow-builder/custom-nodes/trigger-node";

const nodeTypes = {
  triggerNode: TriggerNode,
  emailNode: EmailNode,
  slackNode: SlackNode,
  webhookNode: WebhookNode,
  conditionNode: ConditionNode,
  delayNode: DelayNode,
};

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    nodes?: any;
    edges?: any;
    isActive?: boolean;
  };
  onExecute: (id: string) => void;
  onDelete: (id: string) => void;
}

export const WorkflowCard = ({ workflow, onExecute, onDelete }: WorkflowCardProps) => {
  // Transform API nodes format to ReactFlow format
  const reactFlowNodes = useMemo(() => {
    if (!workflow.nodes || typeof workflow.nodes !== 'object') {
      return [];
    }

    // Convert nodes object to array format expected by ReactFlow
    return Object.entries(workflow.nodes).map(([id, nodeData]: [string, any]) => ({
      id,
      type: nodeData.type,
      position: nodeData.position,
      data: {
        ...nodeData.data,
        // Add dummy onChange handler for read-only view
        onChange: () => {},
      },
      // Add styling for better visualization
      style: {
        background: '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '12px',
      },
    })) as FlowNode[];
  }, [workflow.nodes]);

  // Transform API edges format to ReactFlow format
  const reactFlowEdges = useMemo(() => {
    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      return [];
    }

    return workflow.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      // Add styling for better visualization
      style: { stroke: '#555', strokeWidth: 2 },
      animated: true,
    })) as FlowEdge[];
  }, [workflow.edges]);

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{workflow.name}</CardTitle>
            <CardDescription>{workflow.description || '설명이 없습니다'}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {workflow.isActive !== undefined && (
              <div className="flex items-center mr-2">
                <div className={`w-2 h-2 rounded-full mr-1 ${workflow.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-muted-foreground">{workflow.isActive ? '활성화' : '비활성화'}</span>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExecute(workflow.id)}>
                  <Play className="mr-2 h-4 w-4" />
                  <span>실행</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/workflows/${workflow.id}`} className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    <span>수정</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(workflow.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  <span>삭제</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <div className="h-[280px] border rounded-md bg-slate-50 overflow-hidden">
          {reactFlowNodes.length > 0 && (
            <ReactFlowProvider>
              <ReactFlow
                nodes={reactFlowNodes}
                edges={reactFlowEdges}
                nodeTypes={nodeTypes}
                fitView
                panOnScroll
                zoomOnScroll
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                minZoom={0.2}
                maxZoom={1.5}
              >
                <Background color="#aaa" gap={16} />
                <Controls showInteractive={false} />
              </ReactFlow>
            </ReactFlowProvider>
          )}
        </div>
        <div className="mt-3 text-sm text-muted-foreground text-right">
          <Link 
            href={`/dashboard/workflows/${workflow.id}`}
            className="text-primary hover:underline"
          >
            세부 정보 보기
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}; 