"use client";

import { EmailEditor, EditorRef } from "@/components/email-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function NewEmailTemplatePage() {
  const router = useRouter();
  const emailEditorRef = useRef<EditorRef>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  // Replace with your actual Unlayer Project ID
  const YOUR_UNLAYER_PROJECT_ID = 12345;

  // Add onReady handler
  const handleEditorReady = () => {
    console.log("Editor ready in new template page");
    
    // Wait a moment to ensure the editor is fully initialized
    setTimeout(() => {
      if (emailEditorRef.current?.isReady) {
        console.log("Editor is confirmed ready. Creating new template...");
        toast.info("템플릿 편집기가 준비되었습니다");
      } else {
        console.warn("Editor reports not ready yet despite onReady being called");
      }
    }, 500);
  };

  const handleSave = () => {
    if (!name || !subject) {
      toast.error("템플릿 이름과 이메일 제목을 입력해주세요");
      return;
    }

    // Check if editor is ready
    if (!emailEditorRef.current?.isReady) {
      toast.error("편집기가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // Use exportHtml directly on the ref instead of via .editor
    emailEditorRef.current.exportHtml((data: { design: object; html: string }) => {
      const { design, html } = data;
      console.log("Template data:", { name, subject, design, html });
      // TODO: Save template to backend (replace mock data)
      const newTemplate = {
        id: `tmpl_${Date.now()}`, // Generate temporary ID
        name,
        subject,
        design,
        content: html,
        thumbnail: "/path/to/new/thumbnail.png" // Need to generate/update thumbnail
      };
      console.log("New Template Mock:", newTemplate);
      toast.success("템플릿이 저장되었습니다");
      router.push("/dashboard/campaigns/email-templates");
    });
  };

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
              <h1 className="text-2xl font-bold">새 템플릿</h1>
              <p className="text-muted-foreground">
                새로운 이메일 템플릿을 만드세요
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