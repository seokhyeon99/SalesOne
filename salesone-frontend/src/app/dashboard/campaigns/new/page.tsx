"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mockEmailTemplates } from "@/lib/mock/campaigns";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Edit, PlusIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MultiSelect } from "@/components/ui/multi-select";
import Image from "next/image";
import { toast } from "sonner";
import { EmailEditor, EditorRef } from "@/components/email-editor";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LeadList = {
  id: string; 
  name: string;
  description?: string;
  created_at: string;
  leads_count: number;
};

const formSchema = z.object({
  name: z.string().min(1, "캠페인 이름을 입력해주세요"),
  description: z.string().min(1, "캠페인 설명을 입력해주세요"),
  templateId: z.string().min(1, "이메일 템플릿을 선택해주세요"),
  leadListIds: z.array(z.string()).min(1, "리드 리스트를 선택해주세요"),
});

export default function NewCampaignPage() {
  const router = useRouter();
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const emailEditorRef = useRef<EditorRef>(null);
  const YOUR_UNLAYER_PROJECT_ID = 12345;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      templateId: "",
      leadListIds: [] as string[],
    },
  });

  const selectedTemplateId = form.watch("templateId");

  useEffect(() => {
    const fetchLeadLists = async () => {
      try {
        const response = await fetch("/api/leads/lists");
        const data = await response.json();
        setLeadLists(data.results);
      } catch (error) {
        toast.error("리드 리스트를 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadLists();
  }, []);

  const handleEditorReady = () => {
    console.log("Email editor ready in campaign page");
    
    if (selectedTemplateId) {
      const templateIdNumber = parseInt(selectedTemplateId, 10);
      if (!isNaN(templateIdNumber)) {
        console.log(`Loading template ID ${templateIdNumber} on editor ready`);
        try {
          emailEditorRef.current?.loadTemplate(templateIdNumber);
          toast.info(`템플릿 ${templateIdNumber} 로드 중...`);
        } catch (error) {
          console.error("Error loading template on editor ready:", error);
          toast.error(`템플릿 로드 실패`);
        }
      }
    }
  };

  useEffect(() => {
    // Only attempt to load if editor is ready and template ID has changed
    if (selectedTemplateId && emailEditorRef.current?.isReady) {
      const templateIdNumber = parseInt(selectedTemplateId, 10);
      if (!isNaN(templateIdNumber)) {
        console.log(`Loading template ID ${templateIdNumber} from selection effect`);
        try {
          emailEditorRef.current.loadTemplate(templateIdNumber);
          toast.info(`템플릿 ${templateIdNumber} 로드 중...`);
        } catch (error) {
          console.error("Error loading template from selection:", error);
          toast.error(`템플릿 로드 실패`);
        }
      }
    }
  }, [selectedTemplateId]);

  const handleDeleteTemplate = async (id: string) => {
    toast.success(`템플릿 ${id} 삭제 요청 (구현 필요)`);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form Values:", values);
    
    // Check if editor is ready
    if (!emailEditorRef.current?.isReady) {
      toast.error("편집기가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    
    emailEditorRef.current.exportHtml((data: { design: object; html: string }) => {
      const { design, html } = data;
      console.log("Exported Design JSON:", design);

      const payload = {
        ...values,
        emailDesign: design,
      };

      console.log("API Payload:", payload);
      toast.promise(
        new Promise(resolve => setTimeout(resolve, 1000)),
        {
          loading: '캠페인 생성 중...',
          success: () => {
            router.push("/dashboard/campaigns");
            return '캠페인이 성공적으로 생성되었습니다!';
          },
          error: '캠페인 생성에 실패했습니다.',
        }
      );
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">새 캠페인</h1>
          <p className="text-muted-foreground">
            새로운 이메일 캠페인을 생성하세요
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>캠페인 이름</FormLabel>
                        <FormControl>
                          <Input placeholder="2024 봄 시즌 프로모션" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>캠페인 설명</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="캠페인의 목적과 대상을 설명해주세요"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leadListIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>리드 리스트</FormLabel>
                        <FormControl>
                          <MultiSelect
                            placeholder="리드 리스트를 선택하세요"
                            options={leadLists.map((list) => ({
                              label: `${list.name} (${list.leads_count}개)`,
                              value: list.id,
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            isLoading={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-4">
                          <FormLabel>이메일 템플릿 선택</FormLabel>
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/campaigns/email-templates/new">
                              <PlusIcon className="w-4 h-4 mr-2" />
                              새 템플릿
                            </Link>
                          </Button>
                        </div>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            {mockEmailTemplates.map((template) => (
                              <div
                                key={template.id}
                                className={cn(
                                  "relative group border rounded-md p-4 cursor-pointer",
                                  field.value === template.id ? "bg-secondary" : "bg-background hover:bg-accent/50"
                                )}
                                onClick={() => field.onChange(template.id)}
                              >
                                <div className="aspect-video relative bg-muted rounded-md mb-2 overflow-hidden w-full">
                                  <Image
                                    src={template.thumbnail}
                                    alt={template.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <p className="font-medium text-left w-full truncate">{template.name}</p>
                                <p className="text-sm text-muted-foreground text-left w-full truncate">
                                  {template.subject}
                                </p>
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Link 
                                    href={`/dashboard/campaigns/email-templates/${template.id}/edit`}
                                    className="h-7 w-7 bg-background/80 hover:bg-background rounded-md flex items-center justify-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </Link>
                                  <button
                                    type="button"
                                    className="h-7 w-7 bg-background/80 hover:bg-background text-destructive hover:text-destructive rounded-md flex items-center justify-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTemplate(template.id);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-2 block">이메일 편집기</Label>
            <Card>
              <CardContent className="p-0">
                <div className="h-[700px] flex flex-col border rounded-md overflow-hidden">
                  <EmailEditor
                    ref={emailEditorRef}
                    projectId={YOUR_UNLAYER_PROJECT_ID}
                    onReady={() => {
                      console.log("Email editor ready in campaign page");
                      console.log("Selected template ID:", selectedTemplateId);
                      
                      // Short delay to ensure editor is fully initialized
                      setTimeout(() => {
                        // Load template immediately if one is already selected
                        if (selectedTemplateId) {
                          const templateIdNumber = parseInt(selectedTemplateId, 10);
                          if (!isNaN(templateIdNumber)) {
                            console.log(`Loading template ID ${templateIdNumber} on editor ready`);
                            try {
                              if (emailEditorRef.current?.isReady) {
                                console.log("Editor confirms it is ready, loading template");
                                emailEditorRef.current.loadTemplate(templateIdNumber);
                                toast.info(`템플릿 ${templateIdNumber} 로드 중...`);
                              } else {
                                console.warn("Editor reports it's not ready yet despite onReady being called");
                              }
                            } catch (error) {
                              console.error("Error loading template on editor ready:", error);
                              toast.error(`템플릿 로드 실패`);
                            }
                          }
                        }
                      }, 500); // 500ms delay
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button type="submit">캠페인 생성</Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 