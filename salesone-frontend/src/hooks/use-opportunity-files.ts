import { useState, useEffect } from 'react';
import { OpportunityFile } from '@/types/opportunity-details';

// Mock files data
const generateMockFilesData = (opportunityId: string): OpportunityFile[] => [
  {
    id: '1',
    name: '제안서_v1.0.pdf',
    size: 2458000, // 2.4MB
    url: '/mock/files/proposal_v1.pdf',
    created_at: '2023-12-12T11:30:00Z',
    opportunity: opportunityId,
  },
  {
    id: '2',
    name: '기술요구사항_명세서.docx',
    size: 843000, // 843KB
    url: '/mock/files/tech_requirements.docx',
    created_at: '2023-12-15T14:00:00Z',
    opportunity: opportunityId,
  },
  {
    id: '3',
    name: '예산_계획서.xlsx',
    size: 562000, // 562KB
    url: '/mock/files/budget_plan.xlsx',
    created_at: '2023-12-18T09:45:00Z',
    opportunity: opportunityId,
  },
  {
    id: '4',
    name: '계약서_초안.pdf',
    size: 1250000, // 1.25MB
    url: '/mock/files/contract_draft.pdf',
    created_at: '2023-12-22T16:30:00Z',
    opportunity: opportunityId,
  }
];

export function useOpportunityFiles(opportunityId: string | null) {
  const [files, setFiles] = useState<OpportunityFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!opportunityId) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    const loadFiles = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set mock data
        const mockData = generateMockFilesData(opportunityId);
        setFiles(mockData);
      } catch (error) {
        console.error('Failed to load files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, [opportunityId]);

  // Function to upload a new file
  const uploadFile = (file: File, name: string) => {
    if (!opportunityId) return;
    
    const newFile: OpportunityFile = {
      id: `new-${Date.now()}`,
      name: name || file.name,
      size: file.size,
      url: URL.createObjectURL(file), // Create a local URL for the file
      created_at: new Date().toISOString(),
      opportunity: opportunityId,
    };

    setFiles(prev => [...prev, newFile]);
    return newFile;
  };

  // Function to delete a file
  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return {
    files,
    isLoading,
    uploadFile,
    deleteFile,
  };
} 