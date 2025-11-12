"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export interface OpportunityTask {
  id: string;
  title: string;
  body: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  created_by: string;
  opportunity_id: string;
}

// Mock data for tasks
const mockTasks: OpportunityTask[] = [
  {
    id: "task-1",
    title: "제안서 작성 후 전달",
    body: "고객사의 요구사항을 반영한 맞춤형 제안서를 작성하여 이메일로 전달",
    status: "completed",
    created_at: "2023-10-15T09:30:00Z",
    created_by: "김영희",
    opportunity_id: "opp-1"
  },
  {
    id: "task-2",
    title: "후속 미팅 일정 조율",
    body: "제안서 검토 후 후속 미팅 일정을 조율할 것",
    status: "pending",
    created_at: "2023-10-16T14:20:00Z",
    created_by: "박지훈",
    opportunity_id: "opp-1"
  },
  {
    id: "task-3",
    title: "가격 협상",
    body: "초기 계약 가격 협상 진행. 10% 할인까지 가능",
    status: "in_progress",
    created_at: "2023-10-17T11:45:00Z",
    created_by: "이상철",
    opportunity_id: "opp-2"
  },
  {
    id: "task-4",
    title: "경쟁사 분석 보고서 작성",
    body: "주요 경쟁사들의 제품 및 가격 비교 분석",
    status: "pending",
    created_at: "2023-10-18T10:00:00Z",
    created_by: "홍길동",
    opportunity_id: "opp-2"
  },
  {
    id: "task-5",
    title: "최종 계약서 검토",
    body: "법무팀과 함께 최종 계약서 검토",
    status: "pending",
    created_at: "2023-10-19T15:30:00Z",
    created_by: "김영희",
    opportunity_id: "opp-3"
  }
];

export function useOpportunityTasks(opportunityId: string) {
  const [tasks, setTasks] = useState<OpportunityTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      // Filter tasks for the specified opportunity
      const filteredTasks = mockTasks.filter(task => 
        task.opportunity_id === opportunityId || 
        (opportunityId === "opp-1" && task.opportunity_id === "opp-1") || 
        (!mockTasks.some(t => t.opportunity_id === opportunityId) && task.opportunity_id === "opp-1")
      );
      setTasks(filteredTasks);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [opportunityId]);

  // Function to update task status
  const updateTaskStatus = (taskId: string, newStatus: "pending" | "in_progress" | "completed") => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Function to create a new task
  const createTask = (title: string, body: string) => {
    const newTask: OpportunityTask = {
      id: uuidv4(),
      title,
      body,
      status: "pending",
      created_at: new Date().toISOString(),
      created_by: "현재 사용자", // In a real app, this would be the current user's name
      opportunity_id: opportunityId,
    };
    setTasks(prev => [...prev, newTask]);
  };

  // Function to delete a task
  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return {
    tasks,
    isLoading,
    updateTaskStatus,
    createTask,
    deleteTask
  };
} 