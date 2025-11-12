"use client";

import { EmailEditor, EditorRef } from "@/components/email-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockEmailTemplates } from "@/lib/mock/campaigns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function EditEmailTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const emailEditorRef = useRef<EditorRef>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Replace with your actual Unlayer Project ID
  const YOUR_UNLAYER_PROJECT_ID = 12345;

  const templateId = typeof params?.id === 'string' ? params.id : '';

  // Instead of using a separate useEffect, we can use the onReady callback
  // to load the template when the editor is fully initialized
  const handleEditorReady = () => {
    console.log("Editor is ready to load template. Editor ref exists:", !!emailEditorRef.current);
    console.log("Template ID:", templateId);
    
    if (!templateId) {
      console.log("No template ID provided, skipping template load");
      return;
    }

    // Wait a moment to ensure the editor is fully initialized
    setTimeout(() => {
      // Check if numeric ID (Unlayer hosted template)
      if (/^\d+$/.test(templateId)) {
        const numericId = parseInt(templateId, 10);
        console.log(`Attempting to load Unlayer template ID: ${numericId}`);
        try {
          if (emailEditorRef.current?.isReady) {
            console.log("Editor reports it is ready, loading template");
            emailEditorRef.current.loadTemplate(numericId);
            toast.info(`Unlayer 템플릿 ${numericId} 로드 중...`);
          } else {
            console.error("Editor reports not ready yet");
            toast.error("편집기가 아직 준비되지 않았습니다. 페이지를 새로고침 해주세요.");
          }
        } catch (error) {
          console.error("Error loading Unlayer template:", error);
          toast.error(`Unlayer 템플릿 ${numericId} 로드 실패`);
        }
      } else {
        // Local template
        console.log(`Looking for local template with ID: ${templateId}`);
        const template = mockEmailTemplates.find(t => t.id === templateId);
        if (template) {
          try {
            // Handle custom JSON template
            const designData = (template as any).design || {};
            console.log("Loading design data:", designData);
            emailEditorRef.current?.loadDesign(designData);
            toast.info(`템플릿 "${template.name}" 로드 중...`);
          } catch (error) {
            console.error("Error loading template design:", error);
            toast.error("템플릿 디자인을 불러오는데 실패했습니다.");
          }
        } else {
          console.error(`Template with ID ${templateId} not found in mockEmailTemplates`);
        }
      }
    }, 500); // Short delay to ensure editor is fully initialized
  };

  useEffect(() => {
    // In a real app, fetch the template from API
    const template = mockEmailTemplates.find((t) => t.id === templateId);
    if (template) {
      setName(template.name);
      setSubject(template.subject);
    } else if (!/^\d+$/.test(templateId)) {
      // Only show error if this isn't a numeric templateId (which might be valid for Unlayer)
      toast.error("템플릿을 찾을 수 없습니다.");
      // router.push("/dashboard/campaigns/email-templates"); // Uncomment to redirect if template not found
    }
    setIsLoading(false);
  }, [templateId, router]);

  const handleSave = () => {
    if (!name || !subject) {
      toast.error("템플릿 이름과 이메일 제목을 입력해주세요");
      return;
    }

    // Use exportHtml directly on the ref
    if (emailEditorRef.current) {
      emailEditorRef.current.exportHtml((data: { design: object; html: string }) => {
        const { design, html } = data;
        console.log("Template data:", { name, subject, design, html });
        // TODO: Save template to backend (replace mock data)
        const updatedTemplate = { 
          id: templateId,
          name, 
          subject, 
          design, 
          content: html, // Assuming content is the exported HTML 
          thumbnail: "/path/to/new/thumbnail.png" // Need to generate/update thumbnail
        };
        console.log("Updated Template Mock:", updatedTemplate);
        toast.success("템플릿이 저장되었습니다");
        router.push("/dashboard/campaigns/email-templates");
      });
    } else {
      toast.error("편집기가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>; // Added padding to loading state
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/campaigns/email-templates">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">템플릿 수정</h1>
              <p className="text-muted-foreground">
                이메일 템플릿을 수정하세요
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">템플릿 이름</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="2024 봄 시즌 프로모션"
                />
              </div>
              <div>
                <Label htmlFor="subject">이메일 제목</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="안녕하세요 {{name}}님"
                />
              </div>
            </div>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </div>
      </div>
      <EmailEditor 
        ref={emailEditorRef}
        projectId={YOUR_UNLAYER_PROJECT_ID}
        onReady={handleEditorReady}
      />
    </div>
  );
} 