import { Node, Edge } from "reactflow";

export type WorkflowNodeType = 'emailNode' | 'slackNode' | 'webhookNode' | 'conditionNode' | 'delayNode';

export interface WorkflowNodeData {
  [key: string]: any;
  onChange?: (data: any) => void;
}

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
} 